var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');
var passport = require('passport');
var router = express.Router();

router.get('/', function(req, res, next) {
	mongoose.model('event').find({}, function(err, events) {
		if (err) {
			console.error(err);
		}
		else {
			res.format(
				{ html: function() {
					res.render('events/index', {'events': events, user: req.user});
				},
				json: function() {
					res.json(events);
				}
			});
		}
	}
)});

router.post('/', function(req, res, next) {
	var name = req.body.name;
    var description = req.body.description;
    var price = req.body.price;
    var picture = {
		data: req.files.picture.data,
		type: req.files.picture.mimetype
	}
    var user_id = req.body.user_id;
    mongoose.model('event').create(
		{
			name: name,
			description: description,
			price: price,
			user_id: user_id
		},
		function (err, event) {
			if (err) {
				res.send("There was a problem adding the information to the database.");
            } else {
				console.log('POST creating new event: ' + event);
				saveEventImage(req.files.picture, event._id, user_id);
				res.format({
					//HTML response will set location and redirect back to home page. Could also create a 'success' page
					html: function(){
					// If it worked, set the header so the address bar doesn't still say /event/new
					res.location("/events/new");
					// And forward to success page
					res.redirect("/events/new");
					},
					//JSON response will show the newly created event
					json: function(){
						res.json(event);
					}
				});
			}
		}
	);
});

router.param('id', function (req, res, next, id) {
	mongoose.model('event').findById(id, function (err, event) {
   	if (err) {
		   console.log(id + ' was not found');
		   res.status(404)
		   var err = new Error('Not Found');
		   err.status = 404;
		   res.format({
    			html: function(){
					next(err);
				},
				json: function(){
					res.json({message : err.status  + ' ' + err});
				}
			});
      }
      else {
         req.id = id;
         next(); 
      }
  })
});

router.get('/image/:id', isLoggedIn, function(req, res, next) {
	var event_id = req.id;
	console.log(req.id);
	mongoose.model('event').find({ _id: event_id }, 'picture.data', function(err, image) {
		if (err) {
			console.error(err);
		}
		else {
			console.log(image[0].picture.data);
			res.send(image[0].picture.data.toString('base64'));
		}
	})
});

router.get('/new', isLoggedIn, function(req, res, next) {
  res.render('events/new', { user: req.user });
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();
  res.redirect('/auth');
}

function saveEventImage(imageData, event_id, user_id) {
	var extension = imageData.mimetype.split('/')[1];
	var path = 'public/uploaded_images/' + event_id + '.' + extension;
	fs.writeFile(path, imageData.data.toString('base64'), 'base64', function(err) {
		if (err) console.log(err);
		else {
			console.log('File saved');
			mongoose.model('event').findByIdAndUpdate(
				{ _id: event_id },
				{ $set: { picture: event_id + '.' + extension} },
				function(err, event) {
					if (err) return next(err);
				}
			);
		}
	});
}

var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var router = express.Router();

router.get('/', isLoggedIn, function(req, res, next) {
	mongoose.model('booking').find({}, function(err, bookings) {
		if (err) {
			console.error(err);
		}
		else {
			res.format({
				html: function() {
					res.render('events/index', {'bookings': bookings, user: req.user});
				},
				json: function() {
					res.json(bookings);
				}
			});
		}
	}
)});

router.post('/', isLoggedIn, function(req, res, next) {
	var user_id = req.user._id;
	var event_id = req.query.event_id;
	console.log(req.query);
	var date = req.query.date;
	var minAttend = req.query.minAttend;
	mongoose.model('booking').create(
		{
			user_id: user_id,
			event_id: event_id,
			date: date,
			minAttend: minAttend,
			attendees: []
		},
		function(err, booking) {
			if (err) {
				console.error(err);
			}
			else {
				console.log('POST creating new booking: ' + booking);
				res.format({
					html: function(){
						res.location('/');
						res.redirect('/');
					},
					json: function(){
						res.json(booking);
					}
				});
			}//end else
		}
	);
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();
  res.redirect('/auth');
}

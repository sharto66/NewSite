var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.render('index', { user: req.user});
});

router.get('/auth', function(req, res, next) {
	res.render('auth');
});

router.get('/login', function(req, res, next) {
	res.render('login', { message: req.flash('loginMessage') });
});

router.get('/signup', function(req, res) {
	res.render('signup', { message: req.flash('signupMessage') });
});

router.get('/profile', isLoggedIn, function(req, res) {
	res.render('profile', { user: req.user });
});

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/auth');
});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/auth',
  failureRedirect: '/signup',
  failureFlash: true,
}));

router.post('/login', passport.authenticate('local-login', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true,
}));

router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_friends'] }));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
	successRedirect: '/',
	failureRedirect: '/auth',
}));

router.param('token', function (req, res, next, token) {
	mongoose.model('User').find({ local: { verToken: token }}, function (err, user) {
   	if (err) {
	   console.log(token + ' was not found');
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
         req.token = token;
         next(); 
      }
  })
});

router.get('/verify/:token', function(req, res, next) {
	var token = req.token;
	console.log(token);
	mongoose.model('User').find({ 'local.verToken': token }, function(err, user) {
		if (err) {
			console.error(err);
		}
		else {
			console.log(user[0]);
			user[0].local.verified = true;
			user[0].save(function(err) {
				if (err) console.log('Failed to verify');
				res.render('auth');
			});
		}
	})
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();
  res.redirect('/auth');
}

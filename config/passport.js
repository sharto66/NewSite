var FacebookStrategy = require('passport-facebook').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var nodemailer = require('nodemailer');
var express = require('express');
var crypto = require('crypto');
var User = require('../models/user');
var configAuth = require('./auth');

var app = express();

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  },
  function(req, email, password, done) {
	console.log(email);
	console.log(req.body.name);
    process.nextTick(function() {
		User.findOne({ 'local.email':  email }, function(err, user) {
			if (err)
				return done(err);
			if (user) {
				return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
			} else {
				var newUser = new User();
				newUser.local.name = req.body.name;
				newUser.local.email = email;
				newUser.local.password = newUser.generateHash(password);
				newUser.local.verToken = crypto.randomBytes(16).toString('hex');
				newUser.save(function(err) {
					if (err)
						throw err;
					sendVerificationMail(newUser.local.verToken, newUser.local.email, newUser.local.name);
					return done(null, null);
				});
			}
		});
    });
  }));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  },
  function(req, email, password, done) {
	User.findOne({ 'local.email':  email }, function(err, user) {
		if (err)
			return done(err);
		if (!user)
			return done(null, false, req.flash('loginMessage', 'No user found.'));
		if (!user.validPassword(password))
			return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
		if (!user.local.verified)
			return done(null, false, req.flash('loginMessage', 'Please verify your account.'));
		return done(null, user);
    });
  }));

  passport.use(new FacebookStrategy({
	clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    profileFields: ['id', 'email', 'first_name', 'last_name', 'photos'],
  },
  function(token, refreshToken, profile, done) {
    process.nextTick(function() {
		User.findOrCreate({ profile },
			function (err, user) {
				if(user) {
					user.facebook.token = token;
					user.save(function(err, doc) {
						done(err, doc);
					});
				} else {
					done(err, user);
				}
			}
		);
    });
  }));
};

function sendVerificationMail(token, address, name) {
	var smtpConfig = {
		host: 'smtp.gmail.com',
		secure: true,
		auth: {
			user: 'accounts@bubblbook.com',
			pass: '5Bubbles!'
		}
	};
	var transporter = nodemailer.createTransport(smtpConfig);
	var link = '';
	if (app.get('env') === 'development') {
		link = 'http://localhost:3001/verify/' + token;		
	}
	else {
		link = 'http://ec2-54-229-127-77.eu-west-1.compute.amazonaws.com/verify/' + token;
	}
	var mailOptions = {
		from: 'Do Not Reply <accounts@bubblbook.com>',
		to: name + ', ' + address, 
		subject: 'Account Verification',
		text: token,
		html: 'Please click this link to verify your account. <a href="' + link +'">Here</a>'
	};
	transporter.sendMail(mailOptions, function(error, info){
		if(error){
			return console.log(error);
		}
		console.log('Message sent: ' + info.response);
	});
}

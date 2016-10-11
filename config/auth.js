var express = require('express');
var app = express();

var clientID, clientSecret, callbackURL;

if (app.get('env') === 'development') {
	clientID = '887714911337349';	
	clientSecret = '83d6d847e5b4acbb680b45b939dd3581';
	callbackURL = 'http://localhost:3001/auth/facebook/callback';
}
else {
	clientID = '881210925321081';
	clientSecret = 'bda66f9a11dbbdab3845201776a9f001';
	callbackURL = 'http://ec2-54-229-127-77.eu-west-1.compute.amazonaws.com/auth/facebook/callback';
}

module.exports = {
	facebookAuth: {
		'clientID': clientID,
		'clientSecret': clientSecret,
		'callbackURL': callbackURL
	}
};

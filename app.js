var express = require('express');
var fileUpload = require('express-fileupload');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var mongoose = require('mongoose');
var flash = require('connect-flash');
var session = require('express-session');

var port = process.env.PORT || 3001;

var routes = require('./routes/index');
var users = require('./routes/users');
var events = require('./routes/events');
var bookings = require('./routes/bookings');

var event = require('./models/event');
var booking = require('./models/booking');

var configDB = require('./config/database.js');
mongoose.connect(configDB.url);

var app = express();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'shhsecret' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(fileUpload());

require('./config/passport')(passport);

app.use('/', routes);
app.use('/users', users);
app.use('/events', events);
app.use('/bookings', bookings);

// Error Handling ///////////////////

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

app.listen(port);

module.exports = app;

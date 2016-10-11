var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
  local: {
    name: String,
    email: String,
    password: String,
    verified: { type: Boolean, default: false },
    verToken: String
  },
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String,
    username: String,
    picture: String
  }
});

userSchema.statics.findOrCreate = function(filters, cb) {
	User = this;
	this.find({ 'facebook.id': filters.profile.id }, function(err, results) {
		if(results.length == 0) {
			var newUser = new User();
			newUser.facebook.id = filters.profile.id;
			newUser.facebook.name = filters.profile.name.givenName + ' ' + filters.profile.name.familyName;
			newUser.facebook.email = (filters.profile.emails[0].value || '').toLowerCase();
			newUser.facebook.picture = filters.profile.photos[0].value;
			newUser.save(function(err, doc) {
				cb(err, doc)
			});
		} else {
			cb(err, results[0]);
		}
	});
};

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);

var mongoose = require('mongoose');

var eventSchema = mongoose.Schema({
	name: String,
	description: String,
	price: Number,
	picture: String,
	user_id: String
});

mongoose.model('event', eventSchema);

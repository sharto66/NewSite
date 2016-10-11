var mongoose = require('mongoose');

var bookingSchema = mongoose.Schema({
	user_id: mongoose.Schema.Types.ObjectId,
	event_id: mongoose.Schema.Types.ObjectId,
	attendees: [mongoose.Schema.Types.ObjectId],
	date: { type: Date, default: Date.now },
	minAttend: { type: Number, default: 2 },
	confirmed: { type: Boolean, default: false }
});

mongoose.model('booking', bookingSchema);

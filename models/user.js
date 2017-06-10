
var mongoose = require('mongoose');
var usersSchema = require('../schemas/userdata');

module.exports = mongoose.model('User', usersSchema);
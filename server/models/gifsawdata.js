const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GifsawData = new Schema({username: String, created: {}, saved: {}, stats: {}, friends: [], followers: [], options: {}});
module.exports = mongoose.model('GifsawData', GifsawData);
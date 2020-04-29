const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GifsawData = new Schema({username: String, puzzles: [], friends: [], followers: []});
module.exports = mongoose.model('GifsawData', GifsawData);
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Puzzle = new Schema({id:'',matches:[],initialScript:''});
module.exports = mongoose.model('Puzzle', Puzzle);
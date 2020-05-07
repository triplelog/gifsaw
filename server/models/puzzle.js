const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Puzzle = new Schema({id:'',matches:{},initialScript:'',creator:'',nrows:1,ncols:1,pointyFactor:50,heightFactor:50,widthFactor:50,imgSrc:''});
module.exports = mongoose.model('Puzzle', Puzzle);
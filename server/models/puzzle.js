const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Puzzle = new Schema({id:'',matches:{},initialScript:'',creator:'',nrows:Number,ncols:Number,pointyFactor:Number,heightFactor:Number,widthFactor:Number,imgSrc:''});
module.exports = mongoose.model('Puzzle', Puzzle);
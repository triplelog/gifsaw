
const https = require('https');
var fs = require("fs");
var qs = require('querystring');
var sizeOf = require('image-size');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
var nunjucks = require('nunjucks');
var crypto = require("crypto");
var Blockly = require('blockly');
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/matherrors.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/matherrors.com/fullchain.pem')
};
const { PerformanceObserver, performance } = require('perf_hooks');
const FileType = require('file-type');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/gifsaw', {useNewUrlParser: true});
const User = require('./models/user');
const UserData = require('./models/userdata');

var express = require('express');


var fromLogin = require('./login-server.js');
var app = fromLogin.loginApp;
var tempKeys = fromLogin.tempKeys;






app.use('/',express.static('static'));

app.get('/puzzle', 
	function(req, res) {
		var npieces = 24;
		var gametype = 'solo';
		var players = 'one';
		var score = false;
		var fname = 'opttest';
		var fullname = 'opttest.gif';
		var actheight = 246;
		var actwidth = 480;
		var nrows = 4;
		var ncols = 6;
		var dimensions = sizeOf('static/gifs/' + fullname);
		var retval = makelines(dimensions.width,dimensions.height,npieces,actwidth,actheight,nrows,ncols);
		
		var pieces = [];
		npieces = retval[6];
		for (var i=0;i<npieces;i++){
			var piece = {id:'video'+(i+1),rotation:retval[4][i],location:retval[3][i],centers:retval[2][i]};
			pieces.push(piece);
		}
		res.write(nunjucks.render('encryptedpuzzle.html',{
			gametype: gametype,
			players: players,
			score: score,
			npieces: retval[6],
			pagename: fname,
			image: {'name':'../gifs/'+fullname,'width':dimensions.width,'height':dimensions.height},
			vclines:JSON.stringify(retval[7]),
			hclines:JSON.stringify(retval[8]),
			ccenters:JSON.stringify(retval[9]),
			vlines:retval[0],
			hlines:retval[1],
			centers:JSON.stringify(retval[2]),
			matches:JSON.stringify(retval[5]),
			nrows:nrows,
			ncols:ncols,
			//actheight:288,
			//actwidth:512,
			actheight:actheight,
			actwidth:actwidth,
			pieces: JSON.stringify(pieces),
		}));
		res.end();
	}
);



const server1 = https.createServer(options, app);

server1.listen(12312);

const server = https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('hello world\n');
}).listen(8080);

const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
  	
  	if (typeof message !== 'string'){
  		
		
  		return;
  	}
  	var dm = JSON.parse(message);
	if (dm.type && dm.type == 'key'){
		if (dm.message && tempKeys[dm.message]){
			username = tempKeys[dm.message].username;
		}
		return;
	}
	
  	
  	
  });
});


function makelines(width,height,npieces,actwidth,actheight,nrows,ncols) {
	var vlines = [];
	var hlines = [];
	var vclines = [];
	var hclines = [];
	var ccenters = [];
	var x = [];
	var y = [];
	var xx = [];
	var yy = [];
	var centers = [];
	var locations = [];
	var rotations = [];
	var matches = {};
	/*
	let nrowsf = Math.floor(Math.sqrt(npieces*height/width));
	let ncolsf = Math.floor(nrowsf*width/height);
	var nrows = nrowsf;
	var ncols = ncolsf;
	var mind = npieces*2;
	for (var i=0;i<2;i++) {
		for (var ii=0;ii<2;ii++) {
			if (Math.abs(npieces-(nrows+i)*(ncols+ii))<mind){
				mind = Math.abs(npieces-(nrows+i)*(ncols+ii));
				nrows = nrows+i;
				ncols = ncols+ii;
			}
		}
	}
	
	
	nrows = 4;//must be even
	ncols = 8;//must be even*/
	
	width = actwidth/(40+2*actwidth); //Revert to 1
	height = actheight/(actheight+40); //Revert to 1
	
	var conversions = {};
	for (var i=0;i<ncols+1;i++){
		x.push(width/(ncols)*i);
	}
	for (var i=0;i<nrows+1;i++){
		y.push(height/(nrows)*i);
	}
	for (var i=0;i<nrows*ncols;i++){
		
		if (i%ncols<ncols/2){ //left half needs to grab from right half
			conversions['video'+i]=[(actwidth/2+20)/(40+2*actwidth),Math.floor(i/(2*ncols))*(.5+20/(actheight/2+20)/2)];
		}
		else{
			conversions['video'+i]=[20/(40+2*actwidth),Math.floor(i/(2*ncols))*(.5+20/(actheight/2+20)/2)];
		}
		conversions['video'+i].push(i%(ncols/2)); //column within half of gif
		conversions['video'+i].push(Math.floor(i/(ncols))%(nrows/2)); //row within half of gif;

		
		const x0 = conversions['video'+i][0]+conversions['video'+i][2]*width/ncols;
		const y0 = conversions['video'+i][1]+conversions['video'+i][3]*height/(nrows);
		const x1 = x0+width/ncols;
		const y1 = y0+height/(nrows);


		var line1 = x0+','+y0+' '+x0+','+y1+' ';
		
		var line2 = getRightLine(x0,x1,y0,y1,i,ncols);
		
		
		if (i%ncols > 0){ //not first column
			var newLine = flipRightVertical(vlines[i-1][1].split(' '),x0,y1);
			vlines.push([newLine,line2])
		}
		else {
			vlines.push([line1,line2])
		}

		line2 = x1+','+y0+' '+x0+','+y0+' ';
		line1 = getBottomLine(x0,x1,y0,y1,i,ncols,nrows);

		if (i >= ncols){ //not first row
			var newLine = flipBottomHorizontal(hlines[i-ncols][0].split(' '),x0,y0);
			hlines.push([line1,newLine])
		}
		else {
			hlines.push([line1,line2])
		}

		centers.push([{x:(x0+x1)/2, y:(y0+y1)/2, id:'video'+(i+1)}]);
		
		//This (everything with c for correct) is for the correct version of the gif
		const x0c = (actwidth+40)/(40+2*actwidth)+(i%ncols)*actwidth/(40+2*actwidth)/ncols;
		const y0c = Math.floor(i/ncols)*actheight/(actheight+40)/(nrows);
		const x1c = x0c+actwidth/(40+2*actwidth)/ncols;
		const y1c = y0c+actheight/(actheight+40)/(nrows);

		var line1c = x0c+','+y0c+' '+x0c+','+y1c+' ';
		var line2c = getRightLine(x0c,x1c,y0c,y1c,i,ncols);
		
		
		
		if (i%ncols > 0){ //not first column
			var newLine = flipRightVertical(vclines[i-1][1].split(' '),x0c,y1c);
			vclines.push([newLine,line2c])
		}
		else {
			vclines.push([line1c,line2c])
		}
		
		
		line2c = x1c+','+y0c+' '+x0c+','+y0c+' ';
		line1c = getBottomLine(x0c,x1c,y0c,y1c,i,ncols,nrows);

		if (i >= ncols){ //not first row
			var newLine = flipBottomHorizontal(hclines[i-ncols][0].split(' '),x0c,y0c);
			hclines.push([line1c,newLine])
		}
		else {
			hclines.push([line1c,line2c])
		}

		ccenters.push([(x0c+x1c)/2,(y0c+y1c)/2]);
	}
	
	for (var i=0;i<ncols*nrows;i++){
		locations.push([Math.floor(Math.random()*600),10+Math.floor(Math.random()*300)])
	}

	for (var i=0;i<ncols*nrows;i++){
		//rotations.push(Math.floor(Math.random()*4)*90)
		rotations.push(0)
	}
	for (var ii=0;ii<ncols*nrows;ii++){
		var i = parseInt(ii);
		matches['video'+(i+1)]=[];
		if (i%ncols<ncols-1){
			matches['video'+(i+1)].push(['video'+(i+2),'left'])
		}
		if (i%ncols>0){
			matches['video'+(i+1)].push(['video'+(i),'right'])
		}
		if (Math.floor(i/ncols)<nrows-1){
			matches['video'+(i+1)].push(['video'+(i+1+parseInt(ncols)),'top'])
		}
		if (Math.floor(i/ncols)>0){
			matches['video'+(i+1)].push(['video'+(i+1-parseInt(ncols)),'bottom'])
		}
	}
	return [vlines,hlines,centers,locations,rotations,matches,nrows*ncols,vclines,hclines,ccenters];
}
function getBottomLine(x0,x1,y0,y1,i,ncols,nrows){
	
	var line = x0+','+y1+' '+x1+','+y1+' ';
	if (i/ncols < nrows-1){
		line = x0+','+y1+' ' +(x1+x0)/2+','+(y1+(y1-y0)/6)+' '+ x1+','+y1+' ';
	}
	return line;
}
function getRightLine(x0,x1,y0,y1,i,ncols){
	var line = x1+','+y1+' ' +(x1+(x1-x0)/6)+','+(y0+y1)/2+' '+ x1+','+y0+' ';
	if (i%ncols == ncols-1){
		line = x1+','+y1+' ' + x1+','+y0+' ';
	}
	return line;
}
function flipBottomHorizontal(oldLine,x0,y0) {
	var oldx0 = parseFloat(oldLine[0].split(',')[0]);
	var oldy1 = parseFloat(oldLine[0].split(',')[1]);
	var newLine = '';
	for (var ii=oldLine.length-1;ii>=0;ii--){
		if (oldLine[ii].indexOf(',')>0){
			var newx = parseFloat(oldLine[ii].split(',')[0]);
			var linex = newx-oldx0+parseFloat(x0);//old x0 should be new x0
			var newy = parseFloat(oldLine[ii].split(',')[1]);
			var liney = newy-oldy1+parseFloat(y0);//old y1 should be new y0
			newLine += linex+','+liney+' ';
		}
	}
	return newLine;
}
function flipRightVertical(oldLine,x0,y1) {
	var oldx1 = parseFloat(oldLine[0].split(',')[0]);
	var oldy1 = parseFloat(oldLine[0].split(',')[1]);
	var newLine = '';
	for (var ii=oldLine.length-1;ii>=0;ii--){
		if (oldLine[ii].indexOf(',')>0){
			var newx = parseFloat(oldLine[ii].split(',')[0]);
			var linex = newx-oldx1+parseFloat(x0);//old x1 should be new x0
			var newy = parseFloat(oldLine[ii].split(',')[1]);
			var liney = newy-oldy1+parseFloat(y1);//old y1 should be same as new y1
			newLine += linex+','+liney+' ';
		}
	}
	return newLine;
}
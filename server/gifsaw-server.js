
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
		
		var dimensions = sizeOf('static/gifs/' + fullname);
		var retval = makelines(dimensions.width,dimensions.height,npieces,actwidth,actheight);

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
			locations:JSON.stringify(retval[3]),
			rotations:JSON.stringify(retval[4]),
			matches:JSON.stringify(retval[5]),
			nrows:4,
			ncols:6,
			//actheight:288,
			//actwidth:512,
			actheight:actheight,
			actwidth:actwidth,
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


function makelines(width,height,npieces,actwidth,actheight) {
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
	
	//nrows = 4;
	//ncols = 6;
	
	nrows = 4;
	ncols = 6;
	//width = 512/(276*2+512); //Revert to 1
	//height = 144/164; //Revert to 1
	
	width = actwidth/(40+2*actwidth); //Revert to 1
	height = actheight/(actheight+40); //Revert to 1
	
	
	const xchoices = [-1*width/ncols*.25,-1*width/ncols*.15,width/ncols*.15,width/ncols*.25];
	const ychoices = [-1*height/nrows*.25,-1*height/nrows*.15,height/nrows*.15,height/nrows*.25];
	var conversions = {};
	for (var i=0;i<ncols+1;i++){
		x.push(width/(ncols)*i);
		xx.push(xchoices[Math.floor(Math.random()*4)]);
	}
	for (var i=0;i<nrows+1;i++){
		y.push(height/(nrows)*i);
		yy.push(ychoices[Math.floor(Math.random()*4)]);
	}
	for (var i=0;i<nrows*ncols;i++){
		
		if (i%6<3){ //Delete conversions
			conversions['video'+i]=[(actwidth/2+20)/(40+2*actwidth),Math.floor(i/(2*ncols))*(.5+20/(actheight/2+20)/2),i%3,Math.floor(i/(ncols))%2];
		}
		else{
			conversions['video'+i]=[20/(40+2*actwidth),Math.floor(i/(2*ncols))*(.5+20/(actheight/2+20)/2),i%3,Math.floor(i/(ncols))%2];
		}
		const xdist = [xx[i%ncols],xx[i%ncols+1]];
		const ydist = [yy[Math.floor(i/ncols)+1],yy[Math.floor(i/ncols)]];
		
		const x0 = conversions['video'+i][0]+conversions['video'+i][2]*width/ncols;
		const y0 = conversions['video'+i][1]+conversions['video'+i][3]*height/(nrows);
		const x1 = x0+width/ncols;
		const y1 = y0+height/(nrows);
		//var line1 = x[i%ncols]+','+y[Math.floor(i/ncols)]+' '+x[i%ncols]+','+(y[Math.floor(i/ncols)+1]+y[Math.floor(i/ncols)]*2)/3+' '+(x[i%ncols]+xdist[0])+','+(y[Math.floor(i/ncols)+1]+y[Math.floor(i/ncols)]*1)/2+' '+x[i%ncols]+','+(y[Math.floor(i/ncols)+1]*2+y[Math.floor(i/ncols)])/3+' '+x[i%ncols]+','+y[Math.floor(i/ncols)+1]+' '
		//var line2 = x[i%ncols+1]+','+(y[Math.floor(i/ncols)+1]*2+y[Math.floor(i/ncols)]*1)/3+' '+(x[i%ncols+1]+xdist[1])+','+(y[Math.floor(i/ncols)+1]+y[Math.floor(i/ncols)]*1)/2+' '+x[i%ncols+1]+','+(y[Math.floor(i/ncols)+1]*1+y[Math.floor(i/ncols)]*2)/3+' '+x[i%ncols+1]+','+y[Math.floor(i/ncols)]+' '

		//if (i%ncols>=0){ //Revert to equality and remove conversions
		//	line1 = (x[0]+conversions['video'+i][0]*cwidth)+','+y[Math.floor(i/ncols)]+' '+(x[0]+conversions['video'+i][0]*cwidth)+','+y[Math.floor(i/ncols)+1]+' '
		//}
		//if (i%ncols<=ncols-1){ //Revert to equality and remove conversions
		//	line2 = (x[ncols]+conversions['video'+i][0]*cwidth)+','+y[Math.floor(i/ncols)]+' '
		//}
		var line1 = x0+','+y0+' '+x0+','+y1+' ';
		var line2 = x1+','+y1+' '+x1+','+y0+' ';

		
		
		if (i%6 > 0){ //not first column
			
			var oldLine = vlines[i-1][1].split(' ');
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
			console.log(line1, ";", newLine, ";");
			vlines.push([line1,line2])
		}
		else {
			vlines.push([line1,line2])
		}
		//vlines.push([line1,line2]);
		
		//line1 = (x[i%ncols]*2+x[i%ncols+1]*1)/3+','+y[Math.floor(i/ncols)+1]+' '+(x[i%ncols]+x[i%ncols+1]*1)/2+','+(y[Math.floor(i/ncols)+1]+ydist[0])+' '+(x[i%ncols]*1+x[i%ncols+1]*2)/3+','+y[Math.floor(i/ncols)+1]+' '+x[i%ncols+1]+','+y[Math.floor(i/ncols)+1]+' '
		//line2 = (x[i%ncols+1]*2+x[i%ncols]*1)/3+','+y[Math.floor(i/ncols)]+' '+(x[i%ncols]+x[i%ncols+1]*1)/2+','+(y[Math.floor(i/ncols)]+ydist[1])+' '+(x[i%ncols]*2+x[i%ncols+1]*1)/3+','+y[Math.floor(i/ncols)]+' '+x[i%ncols]+','+y[Math.floor(i/ncols)]+' '
	
		//if (Math.floor(i/ncols)>=0){//Revert to equality and remove conversions
		//	line2 = (x[i%ncols]+conversions['video'+i][0]*cwidth)+','+y[0]+' '
		//}
		//if (Math.floor(i/ncols)<=nrows-1){//Revert to equality and remove conversions
		//	line1 = (x[i%ncols+1]+conversions['video'+i][0]*cwidth)+','+y[nrows]+' '
		//}
		line2 = x1+','+y0+' '+x0+','+y0+' ';
		line1 = x0+','+y1+' '+x1+','+y1+' ';

		hlines.push([line1,line2])

		centers.push([[(x0+x1)/2,(y0+y1)/2]]);
		
		//This (everything with c for correct) is for the correct version of the gif
		const x0c = (actwidth+40)/(40+2*actwidth)+(i%ncols)*actwidth/(40+2*actwidth)/ncols;
		const y0c = Math.floor(i/ncols)*actheight/(actheight+40)/(nrows);
		const x1c = x0c+actwidth/(40+2*actwidth)/ncols;
		const y1c = y0c+actheight/(actheight+40)/(nrows);

		var line1c = x0c+','+y0c+' '+x0c+','+y1c+' ';
		var line2c = x1c+','+y0c+' ';

		vclines.push([line1c,line2c])
		line2c = x0c+','+y0c+' ';
		line1c = x1c+','+y1c+' ';

		hclines.push([line1c,line2c])

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
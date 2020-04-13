
const https = require('https');
var fs = require("fs");
const {VM, VMScript} = require('vm2');

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
const Puzzle = require('./models/puzzle');

var express = require('express');


var fromLogin = require('./login-server.js');
var app = fromLogin.loginApp;
var tempKeys = fromLogin.tempKeys;





app.use('/',express.static('static'));

app.get('/puzzles/:puzzleid', 
	
	function(req, res) {
		var tkey = crypto.randomBytes(100).toString('hex').substr(2, 18);
		var collab = true;
		var puzzleid = req.params.puzzleid;
		tempKeys[tkey]={username:'',puzzleid:puzzleid};
		/*if (collab){
			//Add connection to db
			Puzzle.findOne({id:puzzleid}, function(err,result) {
				
			})
			
		}*/
		res.write(nunjucks.render('puzzles/'+puzzleid+'.html',{
			tkey: tkey,
		}));
		res.end();
	}
);

app.post('/create', 
	
	function(req, res) {
		
		var puzzleid = crypto.randomBytes(100).toString('hex').substr(2, 12);
		var vm = new VM();
		var npieces;
		var gametype = 'solo';
		var players = 'one';
		var score = false;
		
		
		var fullname = req.body.fileSrc.replace('../img/in/','');
		var fname = fullname.substring(0,fullname.indexOf('.'));
		var nrows = parseInt(req.body.nrows);
		var ncols = parseInt(req.body.ncols);
		
		var encryptedpuzzle = false;
		
		var collab = true;
		var dimensions = sizeOf('static/img/in/' + fullname);
		var actheight = dimensions.height;
		var actwidth = dimensions.width;
		if (encryptedpuzzle){
			actheight = dimensions.height-40;
			actwidth = (dimensions.width-40)/2;
		}
		var retval = makelines(vm,encryptedpuzzle,actwidth,actheight,nrows,ncols);
		
		var pieces = [];
		npieces = retval[6];
		
		var matches = JSON.stringify(retval[5]);
		if (collab){
			matches = false;
			//Add connection to db
		}
		
		for (var i=0;i<npieces;i++){
			var piece = {id:'video'+(i+1),rotation:retval[4][i],location:retval[3][i],centers:retval[2][i]};
			pieces.push(piece);
		}
		var htmlstr = nunjucks.render('encryptedpuzzle.html',{
			gametype: gametype,
			players: players,
			score: score,
			npieces: retval[6],
			pagename: fname,
			image: {'name':'../img/in/'+fullname,'width':dimensions.width,'height':dimensions.height},
			vclines:JSON.stringify(retval[7]),
			hclines:JSON.stringify(retval[8]),
			ccenters:JSON.stringify(retval[9]),
			vlines:retval[0],
			hlines:retval[1],
			matches:matches,
			nrows:nrows,
			ncols:ncols,
			//actheight:288,
			//actwidth:512,
			actheight:actheight,
			actwidth:actwidth,
			pieces: JSON.stringify(pieces),
			collab: collab,
			tkeyHolder:'{{tkey}}',
			
		});
		var puzzle = new Puzzle({id:puzzleid,matches:retval[5]});
		puzzle.save(function(err,result) {
			if (err){
				console.log(err);
				res.redirect('../create');
				return;
			}
			fs.writeFile("puzzles/"+puzzleid+'.html', htmlstr, function (err2) {
				if (err){
					console.log(err);
					res.redirect('../create');
				}
				else {
				
					res.redirect('../puzzles/'+puzzleid);
				}
			
			});
		})
		
		
	}
);

app.get('/create', 
	
	function(req, res) {
		
		res.write(nunjucks.render('createpuzzle.html',{
			
		}));
		res.end();
	}
);

app.get('/puzzle', 
	
	function(req, res) {
		var vm = new VM();
		var npieces;
		var gametype = 'solo';
		var players = 'one';
		var score = false;
		var fname = 'testname';
		var fullname = 'testname.gif';
		var encryptedpuzzle = false;
		
		var nrows = 4;
		var ncols = 8;
		var dimensions = sizeOf('static/gifs/' + fullname);
		var actheight = dimensions.height;
		var actwidth = dimensions.width;
		if (encryptedpuzzle){
			actheight = dimensions.height-40;
			actwidth = (dimensions.width-40)/2;
		}
		var retval = makelines(vm,encryptedpuzzle,actwidth,actheight,nrows,ncols);
		
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
var rooms = {};
wss.on('connection', function connection(ws) {
	var imgid = parseInt(crypto.randomBytes(50).toString('hex'),16).toString(36).substr(2, 12);
  	var outSrc = 'out/'+imgid+'.png';
  	var inSrc = 'static/img/in/'+imgid+'.png';
  	var imgTypes = ['.png','.jpg','.jpeg','.gif','.tiff','.tif'];//.svg, .psd, .eps, .raw, .pdf?
  	var imgIndex = 0;
  	var matches= [];
  	var username = parseInt(crypto.randomBytes(50).toString('hex'),16).toString(36).substr(2, 12);
  	var puzzleid = '';
  	var myroom = false;
  	ws.on('message', function incoming(message) {
		if (typeof message !== 'string'){
			console.log("af",performance.now());
			var buffer = Buffer.from(message);
			FileType.fromBuffer(buffer.slice(0,1000)).then( (val) => {
				var ext = '.'+val.ext;
				for (var i=0;i<imgTypes.length;i++){
					if (ext == imgTypes[i]){
						inSrc = 'static/img/in/'+imgid+imgTypes[i];
						console.log(inSrc);
						fs.writeFile(inSrc, buffer, function (err) {
							if (err){console.log(err);}
							console.log("cf",performance.now());
							var jsonmessage = {'type':'imageSrc','src':inSrc.replace('static/','../')};
							ws.send(JSON.stringify(jsonmessage));
						});
						break;
					}
				}
			});
		
			return;
		}
	
		var dm = JSON.parse(message);
		if (dm.type && dm.type == 'key'){
			if (dm.message && tempKeys[dm.message]){
				if (tempKeys[dm.message].username && tempKeys[dm.message].username != ''){
					username = tempKeys[dm.message].username;
				}
				if (tempKeys[dm.message].puzzleid){
					puzzleid = tempKeys[dm.message].puzzleid;
					matches = false;
					Puzzle.findOne({id:puzzleid}, function(err,result) {
						console.log(err);
						console.log(result);
						matches = result.matches;
						console.log(matches);
						if (rooms[puzzleid]){
							myroom = rooms[puzzleid];
							var acceptPlayer = myroom.vm.run('newPlayer("'+username+'");');
							if (acceptPlayer !== false) {
								myroom.players[username]={ws:ws,score:0};
								for (var ii=0;ii<myroom.merges.length;ii++){ //send all existing matches;
									var jsonmessage = {'type':'foundMatch','message':myroom.merges[ii]};
									ws.send(JSON.stringify(jsonmessage));
								}
							}
							else {
								//Add message rejecting player
							}
						
						
						}
						else {
							rooms[puzzleid]={players:{},merges:[],vm:new VM()};
							myroom = rooms[puzzleid];
							myroom.initialScript = `var players={};
							function newPlayer(username){
								var color = 'rgb('+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+')';
								players[username]={score:0,color:color};
							}
							function newMerge(username,matches){
								players[username].score++;
								return {stroke: players[username].color};
							}`;
						
						
							myroom.vm.run(myroom.initialScript);
							var acceptPlayer = myroom.vm.run('newPlayer("'+username+'");');
							if (acceptPlayer !== false) {
								myroom.players[username]={ws:ws,score:0};
							}
							else {
								//Add message rejecting player
							}
						
						}
					
					})
					
					
					
				}
			}
			return;
		}
		else if (dm.type == 'possMatch'){
			if (dm.message && dm.message.length>1){
				var tomatch = socketanswer(dm.message[1],matches);
				if (tomatch.length>0){
					for (var i=tomatch.length-1;i>=0;i--){
						for (var ii=0;ii<myroom.merges.length;ii++){
							var oldMatch = myroom.merges[ii][1];
							for (var iii=0;iii<oldMatch.length;iii++){
								if (tomatch[i][1] == oldMatch[iii][1] && tomatch[i][2] == oldMatch[iii][2]){
									tomatch = tomatch.splice(i,1);
								}
							}
							
						}
					}
					if (tomatch.length>0 && myroom){
						var acceptMatch = updateScores(myroom,[tomatch,username]);
						console.log(myroom.vm.run('players'));
						if (acceptMatch !== false){
							var jsonmessage = {'type':'foundMatch','message':['video'+dm.message[0],tomatch,'me',acceptMatch]}
							for (var i in myroom.players){
								if (i != username){
									jsonmessage.message[2] = username;
									myroom.players[i].ws.send(JSON.stringify(jsonmessage));
								}
								else{
									myroom.merges.push(['video'+dm.message[0],tomatch,i,acceptMatch]);
									myroom.players[i].ws.send(JSON.stringify(jsonmessage));
								}
							}
						}
						else {
							///add message explaining denial
						}
					}
					
		
				}
				else {
					return
				}
			}
			return;
		}
  	});
});


function updateScores(myroom,play){
	return myroom.vm.run('newMerge("'+play[1]+'",'+JSON.stringify(play[0])+');');
}


function socketanswer(pairs,matches) {
	var tomatch = [];
	if (pairs.length>0){
		for (var i=0;i<pairs.length;i++){
			var piece2 = 'video'+pairs[i][0];
			var realidofotherpiece = pairs[i][2];
			var myrealid = pairs[i][3];
			for (var ii=0;ii<matches[myrealid].length;ii++) {
				if (realidofotherpiece == matches[myrealid][ii][0] && pairs[i][1]==matches[myrealid][ii][1]) {
					//console.log(piece1,piece2,pairs,matches[piece1][ii]);

					tomatch.push([piece2,myrealid,realidofotherpiece,matches[myrealid][ii][1]]);
				}
			}
		}
	}
	return tomatch;
	

}


function makelines(vm,encryptedpuzzle,actwidth,actheight,nrows,ncols) {
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
	const bottomcode = new VMScript(`line = x0+','+y1+' '+x1+','+y1+' ';
	if (i/ncols < nrows-1){
		line = x0+','+y1+' ' +(x1+x0)/2+','+(y1+(y1-y0)/6)+' '+ x1+','+y1+' ';
	}
	line;`);
	var rightcodes = [];
	rightcodes.push(new VMScript(`line = x1+','+y1+' ' +(x1+(x1-x0)/6)+','+(y0+y1)/2+' '+ x1+','+y0+' ';
	if (i%ncols == ncols-1){
		line = x1+','+y1+' ' + x1+','+y0+' ';
	}
	line;`));
	rightcodes.push(new VMScript(`line = x1+','+y1+' ' +(x1-(x1-x0)/6)+','+(y0+y1)/2+' '+ x1+','+y0+' ';
	if (i%ncols == ncols-1){
		line = x1+','+y1+' ' + x1+','+y0+' ';
	}
	line;`));
	vm.run('var x0; var x1; var y0; var y1; var i; var ncols; var nrows; var line;');

	width = 1;
	height = 1;
	
	if (encryptedpuzzle){
		width = actwidth/(40+2*actwidth); //Revert to 1
		height = actheight/(actheight+40); //Revert to 1
	}
	
	
	var conversions = {};
	for (var i=0;i<ncols+1;i++){
		x.push(width/(ncols)*i);
	}
	for (var i=0;i<nrows+1;i++){
		y.push(height/(nrows)*i);
	}
	console.log(performance.now());
	for (var i=0;i<nrows*ncols;i++){
		
		if (encryptedpuzzle){
			if (i%ncols<ncols/2){ //left half needs to grab from right half
				conversions['video'+i]=[(actwidth/2+20)/(40+2*actwidth),Math.floor(i/(nrows*ncols/2))*(.5+20/(actheight/2+20)/2)];
			}
			else{
				conversions['video'+i]=[20/(40+2*actwidth),Math.floor(i/(nrows*ncols/2))*(.5+20/(actheight/2+20)/2)];
			}
			conversions['video'+i].push(i%(ncols/2)); //column within half of gif
			conversions['video'+i].push(Math.floor(i/(ncols))%(nrows/2)); //row within half of gif;
		}
		else {
			conversions['video'+i]=[0];
			conversions['video'+i].push(0);
			conversions['video'+i].push(i%(ncols)); //column within full gif
			conversions['video'+i].push(Math.floor(i/(ncols))%(nrows)); //row within full gif;
		}
		

		
		const x0 = conversions['video'+i][0]+conversions['video'+i][2]*width/ncols;
		const y0 = conversions['video'+i][1]+conversions['video'+i][3]*height/(nrows);
		const x1 = x0+width/ncols;
		const y1 = y0+height/(nrows);


		var line1 = x0+','+y0+' '+x0+','+y1+' ';
		var rightcode = rightcodes[Math.floor(Math.random()*2)];
		
		var line2 = getRightLine(vm,rightcode,x0,x1,y0,y1,i,ncols);
		
		
		if (i%ncols > 0){ //not first column
			var newLine = flipRightVertical(vlines[i-1][1].split(' '),x0,y1);
			vlines.push([newLine,line2])
		}
		else {
			vlines.push([line1,line2])
		}

		line2 = x1+','+y0+' '+x0+','+y0+' ';
		line1 = getBottomLine(vm,bottomcode,x0,x1,y0,y1,i,ncols,nrows);

		if (i >= ncols){ //not first row
			var newLine = flipBottomHorizontal(hlines[i-ncols][0].split(' '),x0,y0);
			hlines.push([line1,newLine])
		}
		else {
			hlines.push([line1,line2])
		}

		centers.push([{x:(x0+x1)/2, y:(y0+y1)/2, id:'video'+(i+1)}]);
		
		//This (everything with c for correct) is for the correct version of the gif
		var x0c = x0;
		var y0c = y0;
		var x1c = x1;
		var y1c = y1;
		if (encryptedpuzzle){
			x0c = (actwidth+40)/(40+2*actwidth)+(i%ncols)*actwidth/(40+2*actwidth)/ncols;
			y0c = Math.floor(i/ncols)*actheight/(actheight+40)/(nrows);
			x1c = x0c+actwidth/(40+2*actwidth)/ncols;
			y1c = y0c+actheight/(actheight+40)/(nrows);
		}

		var line1c = x0c+','+y0c+' '+x0c+','+y1c+' ';
		var line2c = getRightLine(vm,rightcode,x0c,x1c,y0c,y1c,i,ncols);
		
		
		
		if (i%ncols > 0){ //not first column
			var newLine = flipRightVertical(vclines[i-1][1].split(' '),x0c,y1c);
			vclines.push([newLine,line2c])
		}
		else {
			vclines.push([line1c,line2c])
		}
		
		
		line2c = x1c+','+y0c+' '+x0c+','+y0c+' ';
		line1c = getBottomLine(vm,bottomcode,x0c,x1c,y0c,y1c,i,ncols,nrows);

		if (i >= ncols){ //not first row
			var newLine = flipBottomHorizontal(hclines[i-ncols][0].split(' '),x0c,y0c);
			hclines.push([line1c,newLine])
		}
		else {
			hclines.push([line1c,line2c])
		}

		ccenters.push([(x0c+x1c)/2,(y0c+y1c)/2]);
	}
	console.log(performance.now());
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
function getBottomLine(vm,bottomcode,x0,x1,y0,y1,i,ncols,nrows){
	vm.run('x0='+x0+'; '+'x1='+x1+'; '+'y0='+y0+'; '+'y1='+y1+'; '+'i='+i+'; '+'ncols='+ncols+'; '+'nrows='+nrows+'; ');
	var line = vm.run(bottomcode);
	return line;
}
function getRightLine(vm,rightcode,x0,x1,y0,y1,i,ncols){
	vm.run('x0='+x0+'; '+'x1='+x1+'; '+'y0='+y0+'; '+'y1='+y1+'; '+'i='+i+'; '+'ncols='+ncols+'; ');
	var line = vm.run(rightcode);
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
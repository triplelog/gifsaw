
const https = require('https');
var fs = require("fs");
const {VM, VMScript} = require('vm2');

var qs = require('querystring');
var sizeOf = require('image-size');
var getDimensions = require('get-video-dimensions');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
var nunjucks = require('nunjucks');
nunjucks.configure({noCache:true});
var crypto = require("crypto");
//var Blockly = require('blockly');
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/gifsaw.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/gifsaw.com/fullchain.pem')
};
const { PerformanceObserver, performance } = require('perf_hooks');
const FileType = require('file-type');

const mongoose = require('mongoose');
mongoose.connect('mongodb://45.32.213.227:27017/triplelog', {useNewUrlParser: true});
const User = require('./models/user');
const GifsawData = require('./models/gifsawdata');
const Puzzle = require('./models/puzzle');

var express = require('express');


var fromLogin = require('./login-server.js');
var app = fromLogin.loginApp;
var tempKeys = fromLogin.tempKeys;





app.use('/',express.static('static'));

app.get('/index.html', 
	
	function(req, res) {
		
		res.write(nunjucks.render('templates/index.html',{
			
		}));
		res.end();
	}
);
app.get('/', 
	
	function(req, res) {
		/*var vm = new VM();
		
		var retval = makelines(vm,false,3000,500,3,18,.4,3,5.0);
		
		var letters = ['G','I','F','S','A','W'];
		for (var i=19;i<25;i++){
			var cG = `<clipPath id="clip`+letters[i-19]+`" clipPathUnits="userSpaceOnUse">
				<path id="path`+letters[i-19]+`" d="M`+retval[0][i].join('')+`"/>
		</clipPath>`;
		console.log(cG);
		}*/
		
		res.write(nunjucks.render('templates/index.html',{
			
		}));
		res.end();
	}
);

app.get('/puzzles/:puzzleid', 
	
	function(req, res) {
		var tkey = crypto.randomBytes(100).toString('hex').substr(2, 18);
		var collab = true;
		if (req.query && req.query.q && req.query.q == 'solo'){
			collab = false;
		}
		else if (req.query && req.query.q && req.query.q == 'fork'){
			//redirect to fork page
			res.redirect('../fork?q='+req.params.puzzleid);
			return;
		}
		else if (req.query && req.query.q && req.query.q == 'edit'){
			//redirect to edit page if original user
			res.redirect('../edit?q='+req.params.puzzleid);
			return;
		}
		var puzzleid = req.params.puzzleid;
		var matches = false;
		var initialCSS = `.pieceBorder{
			stroke-dasharray: calc(2.5 * var(--scale));
			stroke:black;
			stroke-width:calc(2.5 * var(--scale));
			stroke-opacity:.67;
			fill: transparent;
		}
		.interiorBorder{
			stroke-dasharray: calc(1 * var(--scale));
			stroke:gray;
			stroke-width:calc(1 * var(--scale));
			stroke-opacity:.5;
			fill: transparent;
		}
		.interiorBorder.toggled{
			stroke-dasharray: calc(4 * var(--scale));
			stroke-width:calc(4 * var(--scale));
			stroke-opacity:1;
			fill: transparent;
		}
		.interiorBorder.myBorder{
			stroke:green;
			stroke-width:calc(1.5 * var(--scale));
			stroke-opacity:.7;
		}
		.interiorBorder.myBorder.toggled{
			stroke-dasharray: calc(4 * var(--scale));
			stroke-width:calc(4 * var(--scale));
			stroke-opacity:1;
		}
		.piece {
			fill: black;
			fill-opacity: .01;
			stroke: none;
		}`;
		
		var username = parseInt(crypto.randomBytes(50).toString('hex'),16).toString(36).substr(2, 12);
		if (req.isAuthenticated()){
			username = req.user.username;
			//Load user's initialCSS here
			//initialCSS = ;
		}
		tempKeys[tkey]={username:username,puzzleid:puzzleid};
		if (!collab){
			matches = true;
		}
		res.write(nunjucks.render('puzzles/'+puzzleid+'.html',{
			tkey: tkey,
			matches: matches,
			collab: collab,
			initialCSS: initialCSS,
			username: username,
		}));
		res.end();
	}
);

app.post('/solo', 
	
	function(req, res) {
		var bgtype = req.body.background;
		var bgid = 1;
		//compute dimensions and fname
		var fullname = bgtype+bgid+".gif";
		var fname = fullname.substring(0,fullname.indexOf('.'));
		var dimensions = sizeOf('static/img/' + fullname);
		/*getDimensions('static/gifs/city/aerial.mp4').then(dimvid => {
		  console.log(dimvid.width);
		  console.log(dimvid.height);
		})*/
		//compute nrows and ncols
		var np = getNpieces(parseInt(req.body.pieces),dimensions.width,dimensions.height);
		var nrows = np[0];
		var ncols = np[1];
		//compute retval and pieces
		var vm = new VM();
		var retval = makelines(vm,false,dimensions.width,dimensions.height,nrows,ncols,.4,2.5,5);
		
		var pieces = [];
		var npieces = retval[5];
		
		for (var i=0;i<npieces;i++){
			var piece = {id:'video'+(i+1),rotation:retval[3][i],location:retval[2][i],centers:retval[1][i],group:'group0'};
			pieces.push(piece);
		}
		
		var initialCSS = `.pieceBorder{
			stroke-dasharray: calc(2.5 * var(--scale));
			stroke:black;
			stroke-width:calc(2.5 * var(--scale));
			stroke-opacity:.67;
			fill: transparent;
		}
		.interiorBorder{
			stroke-dasharray: calc(1 * var(--scale));
			stroke:gray;
			stroke-width:calc(1 * var(--scale));
			stroke-opacity:.5;
			fill: transparent;
		}
		.interiorBorder.toggled{
			stroke-dasharray: calc(4 * var(--scale));
			stroke-width:calc(4 * var(--scale));
			stroke-opacity:1;
			fill: transparent;
		}
		.interiorBorder.myBorder{
			stroke:green;
			stroke-width:calc(1.5 * var(--scale));
			stroke-opacity:.7;
		}
		.interiorBorder.myBorder.toggled{
			stroke-dasharray: calc(4 * var(--scale));
			stroke-width:calc(4 * var(--scale));
			stroke-opacity:1;
		}
		.piece {
			fill: black;
			fill-opacity: .01;
			stroke: none;
		}`;
		
		var htmlstr = nunjucks.render('templates/basepuzzle.html',{
			gametype: 'solo',
			players: 'one',
			score: false,
			npieces: nrows*ncols,
			pagename: fname,
			image: {'name':'../img/'+fullname,'width':dimensions.width,'height':dimensions.height},
			clines:JSON.stringify(retval[6]),
			ccenters:JSON.stringify(retval[7]),
			plines:retval[8],
			lines:retval[0],
			matchesHolder:JSON.stringify(retval[4]),
			nrows:nrows,
			ncols:ncols,
			actheight:dimensions.height,
			actwidth:dimensions.width,
			pieces: JSON.stringify(pieces),
			collabHolder: `<script>var keepscore = false; var collab = false;</script>
			<script src="../js/solopuzzle.js"></script>`,
			initialCSS: initialCSS ,
			
		});
		fs.writeFile("static/"+bgtype+bgid+".html", htmlstr, function (err2) {
			if (err2){
				console.log(err2);
				res.redirect('../create');
			}
			else {
				res.redirect("../"+bgtype+bgid+".html?n="+req.body.pieces);
			}
		
		});
		
	}
);
app.post('/create', 
	
	function(req, res) {
		console.log(req.body);
		
		var vm = new VM();
		var gametype = 'solo';
		var players = 'one';
		var score = false;
		
		{
			var initialScript = `var players={};
			function newPlayer(username){
				var color = 'rgb('+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+')';
				players[username]={score:0,color:color};
			}
			function newMerge(username,matches){
				players[username].score++;
				return {stroke: players[username].color};
			}`;
		}
		var fullname = req.body.fileSrc.replace('../img/in/','');
		var fname = fullname.substring(0,fullname.indexOf('.'));
		var nrows = parseInt(req.body.nrows);
		var ncols = parseInt(req.body.ncols);
		initialScript = req.body.initialScript;
		
		var encryptedpuzzle = false;
		
		var collab = true;
		var dimensions = sizeOf('static/img/in/' + fullname);
		var actheight = dimensions.height;
		var actwidth = dimensions.width;
		if (encryptedpuzzle){
			actheight = dimensions.height-40;
			actwidth = (dimensions.width-40)/2;
		}
		var pf = parseFloat(req.body.pointyFactor);
		var pointyFactor = pf/40 - (50/40-.4);
		if (pf<50){
			pointyFactor = pf/150 - (50/150-.4);
		}
		var hf = 100-parseFloat(req.body.heightFactor);
		var heightFactor = hf/7-(50/7-2.5);
		if (hf<50){
			heightFactor = hf/25 - (50/25-2.5);
		}
		var wf = 100-parseFloat(req.body.widthFactor);
		var widthFactor = wf/9-(50/9-5);
		if (wf<50){
			widthFactor = wf/15 - (50/15-5);
		}
		
		var retval = makelines(vm,encryptedpuzzle,actwidth,actheight,nrows,ncols,pointyFactor,heightFactor,widthFactor);
		
		var pieces = [];
		var npieces = retval[5];
		
		var matches = JSON.stringify(retval[4]);
		if (collab){
			matches = false;
			//Add connection to db
		}
		
		for (var i=0;i<npieces;i++){
			var piece = {id:'video'+(i+1),rotation:retval[3][i],location:retval[2][i],centers:retval[1][i],group:'group0'};
			pieces.push(piece);
		}
		var puzzleid = crypto.randomBytes(100).toString('hex').substr(2, 12);
		if (req.body.puzzleid != ''){
			puzzleid = req.body.puzzleid;
		}
		var username = '';
		if (req.isAuthenticated()){
			username = req.user.username;
		}
		var htmlstr = nunjucks.render('templates/basepuzzle.html',{
			gametype: gametype,
			players: players,
			score: score,
			npieces: npieces,
			pagename: fname,
			image: {'name':'../img/in/'+fullname,'width':dimensions.width,'height':dimensions.height},
			clines:JSON.stringify(retval[6]),
			ccenters:JSON.stringify(retval[7]),
			plines:retval[8],
			lines:retval[0],
			matchesHolder:'{% if matches %}'+JSON.stringify(retval[4])+'{% else %}false{% endif %}',
			nrows:nrows,
			ncols:ncols,
			//actheight:288,
			//actwidth:512,
			actheight:actheight,
			actwidth:actwidth,
			pieces: JSON.stringify(pieces),
			collabHolder: `{% if collab %}

			<script>var keepscore = true; var collab = true; var tkey = '{{tkey}}';</script>
			<script src="../js/collabpuzzle.js"></script>
			<script src="../js/solopuzzle.js"></script>

			{% else %}

			<script>
				document.getElementById('save').style.display = 'inline-block';
				var ws = false;
				var keepscore = false; var collab = false; var tkey = '{{tkey}}';
			</script>
			<script src="../js/solopuzzle.js"></script>

			{% endif %}`,
			initialCSS: '{{ initialCSS }}',
			usernameHolder: '{{ username }}',
			creator: username,
			puzzleid: puzzleid,
			
			
		});
		
		
		
		if (req.body.puzzleid != ''){
			var newObj = {id:puzzleid,matches:retval[4],initialScript:initialScript,creator:username,nrows:nrows,ncols:ncols,pointyFactor:parseInt(req.body.pointyFactor),heightFactor:parseInt(req.body.heightFactor),widthFactor:parseInt(req.body.widthFactor),imgSrc:fullname};
				
			Puzzle.replaceOne({id:puzzleid}, newObj, function(err,result) {
				if (!err){
					fs.writeFile("puzzles/"+puzzleid+'.html', htmlstr, function (err2) {
						if (err2){
							console.log(err2);
							res.redirect('../create');
						}
						else {
							
							res.redirect('../puzzles/'+puzzleid);
						}
			
					});
				}
			})
		}
		else {
			var puzzle = new Puzzle({id:puzzleid,matches:retval[4],initialScript:initialScript,creator:username,nrows:nrows,ncols:ncols,pointyFactor:parseInt(req.body.pointyFactor),heightFactor:parseInt(req.body.heightFactor),widthFactor:parseInt(req.body.widthFactor),imgSrc:fullname});
			puzzle.save(function(err,result) {
				if (err){
					console.log(err);
					res.redirect('../create');
					return;
				}
				fs.writeFile("puzzles/"+puzzleid+'.html', htmlstr, function (err2) {
					if (err2){
						console.log(err2);
						res.redirect('../create');
					}
					else {
				
						res.redirect('../puzzles/'+puzzleid);
					}
			
				});
			})
		}
		
		
		
	}
);

app.get('/fork', 
	function(req, res) {
		var puzzleid = '';
		if (req.query && req.query.q){
			puzzleid = req.query.q;
		}
		else {
			res.redirect('../create');
			return;
		}
		Puzzle.findOne({id:puzzleid}, function(err,result) {
			if (err || result == null){
				res.redirect('../create');
			}
			else {
				var defaultScripts = makeScripts();
				res.write(nunjucks.render('templates/createbase.html',{
					defaultScripts: defaultScripts,
					selectedScript: 'default',
					nrows: result.nrows,
					ncols: result.ncols,
					pointyFactor: result.pointyFactor,
					heightFactor: result.heightFactor,
					widthFactor: result.widthFactor,
					imgSrc: '../img/in/'+result.imgSrc,
				}));
				res.end();
			}
		})
		
	}
);

app.get('/edit', 
	function(req, res) {
		var puzzleid = '';
		if (req.query && req.query.q){
			puzzleid = req.query.q;
		}
		else {
			res.redirect('../create');
			return;
		}
		Puzzle.findOne({id:puzzleid}, function(err,result) {
			if (err || result == null){
				res.redirect('../create');
			}
			else {
				console.log(result);
				var defaultScripts = makeScripts();
				res.write(nunjucks.render('templates/createbase.html',{
					defaultScripts: defaultScripts,
					selectedScript: 'default',
					nrows: result.nrows,
					ncols: result.ncols,
					pointyFactor: result.pointyFactor,
					heightFactor: result.heightFactor,
					widthFactor: result.widthFactor,
					imgSrc: '../img/in/'+result.imgSrc,
					puzzleid: puzzleid,
				}));
				res.end();
			}
		})
		
	}
);



app.get('/create', 
	
	function(req, res) {
		var defaultScripts = makeScripts();
		res.write(nunjucks.render('templates/createbase.html',{
			defaultScripts: defaultScripts,
			selectedScript: 'default',
			nrows: 5,
			ncols: 5,
			pointyFactor: 70,
			heightFactor: 50,
			widthFactor: 30,
			imgSrc: '../img/in/pd6gm0cd8000.jpg',
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
			var piece = {id:'video'+(i+1),rotation:retval[4][i],location:retval[3][i],centers:retval[2][i],group:'group0'};
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
  	var inSrc = 'static/img/in/'+imgid+'.png';
  	var imgTypes = ['.png','.jpg','.jpeg','.gif','.tiff','.tif'];//.svg, .psd, .eps, .raw, .pdf?
  	var imgIndex = 0;
  	var matches= [];
  	var username = parseInt(crypto.randomBytes(50).toString('hex'),16).toString(36).substr(2, 12);
  	var puzzleid = '';
  	var myroom = false;
  	var maxsize = 2000000; //1000000~1MB
  	ws.on('message', function incoming(message) {
		if (typeof message !== 'string'){
			console.log("af",performance.now());
			var buffer = Buffer.from(message).slice(0,maxsize);
			if (buffer.length==maxsize){
				//send message
				return;
			}
			FileType.fromBuffer(buffer.slice(0,5000)).then( (val) => {
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
						matches = result.matches;
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
							myroom.initialScript = result.initialScript;
						
						
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
		else if (dm.type && dm.type == 'soloKey'){
			if (dm.message && tempKeys[dm.message]){
				if (tempKeys[dm.message].username && tempKeys[dm.message].username != ''){
					username = tempKeys[dm.message].username;
				}
				if (tempKeys[dm.message].puzzleid){
					puzzleid = tempKeys[dm.message].puzzleid;
				}
			}
			return;
		}
		else if (dm.type && dm.type == 'download') {
			var url = dm.url;
			var ext = '';
			for (var i=0;i<imgTypes.length;i++){
				if (url.indexOf(imgTypes[i])==url.length-imgTypes[i].length){
					ext = imgTypes[i];
				}
			}
			if (ext == ''){
				//send message rejecting
				return;
			}
			else {
				inSrc = 'static/img/in/'+imgid+ext;
				var wget = '(ulimit -f '+parseInt(maxsize/512)+'; wget -O '+inSrc+' "'+ url + '")';
				var child = exec(wget, function(err, stdout, stderr) {
					if (err){
						console.log(err);
						//send message--likely file size limit
						return;
					}
					else {
						var jsonmessage = {'type':'imageSrc','src':inSrc.replace('static/','../')};
						ws.send(JSON.stringify(jsonmessage));
					}
				
				});
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
						if (acceptMatch && acceptMatch.accept === false){
							//Send acceptMerge.message
						}
						else{
							var jsonmessage = {'type':'foundMatch','message':['video'+dm.message[0],tomatch,username,acceptMatch]}
							for (var i in myroom.players){
								if (i != username){
									myroom.players[i].ws.send(JSON.stringify(jsonmessage));
								}
								else{
									myroom.merges.push(['video'+dm.message[0],tomatch,username,acceptMatch]);
									myroom.players[username].ws.send(JSON.stringify(jsonmessage));
								}
							}
						}
					}
					
		
				}
				else {
					return
				}
			}
			return;
		}
		else if (dm.type && dm.type == 'saveProgress'){
			if (dm.message){
				GifsawData.findOne({username: username}, function(err, result) {
					console.log(result);
					if (!result.saved){
						result.saved = {};
					}
					console.log(result.saved);
					result.saved[puzzleid] = dm.message;
					result.markModified('saved');
					result.save(function(err2,result2) {
						if (err2){
							console.log(err2);
							return;
						}
						console.log(result2);
					})
				}) 
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

function makeScripts() {
	var script;
	defaultScripts = {};
	script = `var players={};
function newPlayer(username){
	players[username]={score:0};
}
function newMerge(username,matches){
	players[username].score++;
	var score = {};
	score[username]=players[username].score;
	return {'message':'Merge','accept':true,'score':score};
}`;
	defaultScripts['default'] = script;
	
	script = `var players={};
function newPlayer(username){
	players[username]={score:0};
}
function newMerge(username,matches){
	players[username].score+= matches.length;
	var score = {};
	score[username]=players[username].score;
	return {'message':'Merge','accept':true,'score':score};
}`;
	defaultScripts['edges'] = script;
	
	script = `var players={};
function newPlayer(username){
	players[username]={score:0};
}
function newMerge(username,matches){
	if (matches.length > 0){
		players[username].score+= 1/matches.length;
	}
	var score = {};
	score[username]=players[username].score;
	return {'message':'Merge','accept':true,'score':score};
}`;
	defaultScripts['denominator'] = script;
	
	script = `var players={};
function newPlayer(username){
	players[username]={score:0};
}
function newMerge(username,matches){
	var score = {};
	return {'message':'Merge','accept':true,'score':score};
}`;
	defaultScripts['custom'] = script;
	
	
	
	return defaultScripts;
}
function makelines(vm,encryptedpuzzle,actwidth,actheight,nrows,ncols,pointyFactor,heightFactor,widthFactor) {
	var lines = [];
	var clines = [];
	var plines = [];
	var ccenters = [];
	var x = [];
	var y = [];
	var xx = [];
	var yy = [];
	var centers = [];
	var locations = [];
	var rotations = [];
	var matches = {};
	var bottomcodes = [];
	bottomcodes.push(new VMScript(`
	w = x1-x0;
	if (w<0){w *= -1;}
	if (y1-y0<0 && y0-y1<w){w=y0-y1;}
	else if (y1-y0>0 && y1-y0<w){w=y1-y0;}
	c = (x0+x1)/2;
	
	ww = w;
	if (x0>x1){ww = -1*w;}
	w /= heightFactor;
	ww /= widthFactor;
	line = [{'M':[x0,y1]}];
	line.push({'L':[c-ww,y1]});
	line.push({'C':[c-ww/pointyFactor,y1+w,c+ww/pointyFactor,y1+w,c+ww,y1]})
	line.push({'L':[x1,y1]});
	if (i/ncols >= nrows-1){
		line = [{'M':[x0,y1]},{'L':[x1,y1]}];
	}
	line;`));
	bottomcodes.push(new VMScript(`
	w = x1-x0;
	if (w<0){w *= -1;}
	if (y1-y0<0 && y0-y1<w){w=y0-y1;}
	else if (y1-y0>0 && y1-y0<w){w=y1-y0;}
	c = (x0+x1)/2;
	
	ww = w;
	if (x0>x1){ww = -1*w;}
	w /= heightFactor;
	ww /= widthFactor;
	line = [{'M':[x0,y1]}];
	line.push({'L':[c-ww,y1]});
	line.push({'C':[c-ww/pointyFactor,y1-w,c+ww/pointyFactor,y1-w,c+ww,y1]})
	line.push({'L':[x1,y1]});
	if (i/ncols >= nrows-1){
		line = [{'M':[x0,y1]},{'L':[x1,y1]}];
	}
	line;`));
	var rightcodes = [];
	rightcodes.push(new VMScript(`
	w = x1-x0;
	if (w<0){w *= -1;}
	if (y1-y0<0 && y0-y1<w){w=y0-y1;}
	else if (y1-y0>0 && y1-y0<w){w=y1-y0;}
	c = (y0+y1)/2;
	ww = w;
	if (y1>y0){ww = -1*w;}
	w /= heightFactor;
	ww /= widthFactor;
	line = [{'M':[x1,y1]}];
	line.push({'L':[x1,c-ww]});
	line.push({'C':[x1+w,c-ww/pointyFactor,x1+w,c+ww/pointyFactor,x1,c+ww]})
	line.push({'L':[x1,y0]});
	if (i%ncols == ncols-1){
		line = [{'M':[x1,y1]},{'L':[x1,y0]}];
	}
	line;`));
	rightcodes.push(new VMScript(`
	w = x1-x0;
	if (w<0){w *= -1;}
	if (y1-y0<0 && y0-y1<w){w=y0-y1;}
	else if (y1-y0>0 && y1-y0<w){w=y1-y0;}
	c = (y0+y1)/2;
	ww = w;
	if (y1>y0){ww = -1*w;}
	w /= heightFactor;
	ww /= widthFactor;
	line = [{'M':[x1,y1]}];
	line.push({'L':[x1,c-ww]});
	line.push({'C':[x1-w,c-ww/pointyFactor,x1-w,c+ww/pointyFactor,x1,c+ww]})
	line.push({'L':[x1,y0]});
	if (i%ncols == ncols-1){
		line = [{'M':[x1,y1]},{'L':[x1,y0]}];
	}
	line;`));
	vm.run('var x0; var x1; var y0; var y1; var i; var ncols; var nrows; var line; var actheight = '+actheight+'; var actwidth = '+actwidth+'; var pointyFactor= '+pointyFactor+';'+'; var heightFactor= '+heightFactor+'; var widthFactor= '+widthFactor+';');

	width = 1;
	height = 1;
	var fullwidth = actwidth;
	var fullheight = actheight;
	if (encryptedpuzzle){
		width = actwidth/(40+2*actwidth);
		height = actheight/(actheight+40);
		fullwidth = (40+2*actwidth);
		fullheight = (actheight+40);
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
			conversions['video'+i].push(i%Math.floor(ncols/2)); //column within half of gif
			conversions['video'+i].push(Math.floor(i/(ncols))%Math.floor(nrows/2)); //row within half of gif;
		}
		else {
			conversions['video'+i]=[0];
			conversions['video'+i].push(0);
			conversions['video'+i].push(i%(ncols)); //column within full gif
			conversions['video'+i].push(Math.floor(i/(ncols))%(nrows)); //row within full gif;
		}
		

		
		const x0 = fullwidth*(conversions['video'+i][0]+conversions['video'+i][2]*width/ncols);
		const y0 = fullheight*(conversions['video'+i][1]+conversions['video'+i][3]*height/(nrows));
		const x1 = x0+fullwidth*(width/ncols);
		const y1 = y0+fullheight*(height/(nrows));
		
		
		
		var rightcode = rightcodes[Math.floor(Math.random()*2)];
		var bottomcode = bottomcodes[Math.floor(Math.random()*2)];
		/*if (i < ncols){
			bottomcode = bottomcodes[1];
		}
		else if (i < 2*ncols){
			bottomcode = bottomcodes[0];
		}
		
		if (i%ncols == 0){rightcode = rightcodes[1];}
		if (i%ncols == 1){rightcode = rightcodes[0];}
		if (i%ncols == 2){rightcode = rightcodes[1];}
		if (i%ncols == 3){rightcode = rightcodes[1];}
		if (i%ncols == 4){rightcode = rightcodes[1];}
		if (i%ncols == 5){rightcode = rightcodes[1];}
		if (i%ncols == 6){rightcode = rightcodes[0];}*/
		
		if ((i%ncols)%2 == Math.floor(i/ncols)%2){
			var left = x0+','+y0+' '+x0+','+y1+' ';
			var rightArray = getRightLine(vm,rightcode,x0,x1,y0,y1,i,ncols);
			var right = "";
			for (var ii=0;ii<rightArray.length;ii++){
				var key = Object.keys(rightArray[ii])[0];
				var val = rightArray[ii][key];
				if (key=='M'){
					right += val[0]+","+val[1]+" ";
				}
				else if (key=='L'){
					right += "L"+val[0]+','+val[1]+" ";
				}
				else if (key=='C'){
					right += "C"+val[0]+','+val[1]+" ";
					right += ""+val[2]+','+val[3]+" ";
					right += ""+val[4]+','+val[5]+" ";
				}
			}
			var top = x1+','+y0+' '+x0+','+y0+' ';
			var bottomArray = getBottomLine(vm,bottomcode,x0,x1,y0,y1,i,ncols,nrows);
			var bottom = "";
			for (var ii=0;ii<bottomArray.length;ii++){
				var key = Object.keys(bottomArray[ii])[0];
				var val = bottomArray[ii][key];
				if (key=='M'){
					bottom += val[0]+","+val[1]+" ";
				}
				else if (key=='L'){
					bottom += "L"+val[0]+','+val[1]+" ";
				}
				else if (key=='C'){
					bottom += "C"+val[0]+','+val[1]+" ";
					bottom += ""+val[2]+','+val[3]+" ";
					bottom += ""+val[4]+','+val[5]+" ";
				}
			}
			var piecelines = [];
			if (i%ncols > 0){ //not first column
				piecelines.push(lines[i-1][2]);
			}
			else {
				piecelines.push(left);
			}
			piecelines.push(bottom);
			piecelines.push(right);
			if (i >= ncols){ //not first row
				piecelines.push(lines[i-ncols][3]);
			}
			else {
				//hlines.push([line1,line2])
				piecelines.push(top);
			}
			lines.push(piecelines);
		}
		else {
			var left = x0+','+y1+' '+x0+','+y0+' ';
			var rightArray = getRightLine(vm,rightcode,x0,x1,y1,y0,i,ncols);
			var right = "";
			for (var ii=0;ii<rightArray.length;ii++){
				var key = Object.keys(rightArray[ii])[0];
				var val = rightArray[ii][key];
				if (key=='M'){
					right += val[0]+","+val[1]+" ";
				}
				else if (key=='L'){
					right += "L"+val[0]+','+val[1]+" ";
				}
				else if (key=='C'){
					right += "C"+val[0]+','+val[1]+" ";
					right += ""+val[2]+','+val[3]+" ";
					right += ""+val[4]+','+val[5]+" ";
				}
			}
			var top = x0+','+y0+' '+x1+','+y0+' ';
			var bottomArray = getBottomLine(vm,bottomcode,x1,x0,y0,y1,i,ncols,nrows);
			var bottom = "";
			for (var ii=0;ii<bottomArray.length;ii++){
				var key = Object.keys(bottomArray[ii])[0];
				var val = bottomArray[ii][key];
				if (key=='M'){
					bottom += val[0]+","+val[1]+" ";
				}
				else if (key=='L'){
					bottom += "L"+val[0]+','+val[1]+" ";
				}
				else if (key=='C'){
					bottom += "C"+val[0]+','+val[1]+" ";
					bottom += ""+val[2]+','+val[3]+" ";
					bottom += ""+val[4]+','+val[5]+" ";
				}
			}
			var piecelines = [];
			if (i%ncols > 0){ //not first column
				//var newLine = flipRightVertical(vlines[i-1][1].split(' '),x0,y1);
				//vlines.push([newLine,line2])
				piecelines.push(lines[i-1][2]);
			}
			else {
				piecelines.push(left);
			}
			if (i >= ncols){ //not first row
				//var newLine = flipBottomHorizontal(hlines[i-ncols][0].split(' '),x0,y0);
				//hlines.push([line1,newLine])
				piecelines.push(lines[i-ncols][1]);
			}
			else {
				//hlines.push([line1,line2])
				piecelines.push(top);
			}
			piecelines.push(right);
			piecelines.push(bottom);
			
			
			
			lines.push(piecelines);
		}
		
		centers.push([{x:(x0+x1)/2/fullwidth, y:(y0+y1)/2/fullheight, id:'video'+(i+1)}]);
		
		
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


		
		if ((i%ncols)%2 == Math.floor(i/ncols)%2){
			var left = x0c/fullwidth+','+y0c/fullheight+' '+x0c/fullwidth+','+y1c/fullheight+' ';
		
			var rightArray = getRightLine(vm,rightcode,x0c,x1c,y0c,y1c,i,ncols);
			var right = "";
			for (var ii=0;ii<rightArray.length;ii++){
				var key = Object.keys(rightArray[ii])[0];
				var val = rightArray[ii][key];
				if (key=='M'){
					right += val[0]/fullwidth+","+val[1]/fullheight+" ";
				}
				else if (key=='L'){
					right += "L"+val[0]/fullwidth+','+val[1]/fullheight+" ";
				}
				else if (key=='C'){
					right += "C"+val[0]/fullwidth+','+val[1]/fullheight+" ";
					right += ""+val[2]/fullwidth+','+val[3]/fullheight+" ";
					right += ""+val[4]/fullwidth+','+val[5]/fullheight+" ";
				}
			}
			var top = x1c/fullwidth+','+y0c/fullheight+' '+x0c/fullwidth+','+y0c/fullheight+' ';
			var bottomArray = getBottomLine(vm,bottomcode,x0c,x1c,y0c,y1c,i,ncols,nrows);
			var bottom = "";
			for (var ii=0;ii<bottomArray.length;ii++){
				var key = Object.keys(bottomArray[ii])[0];
				var val = bottomArray[ii][key];
				if (key=='M'){
					bottom += val[0]/fullwidth+","+val[1]/fullheight+" ";
				}
				else if (key=='L'){
					bottom += "L"+val[0]/fullwidth+','+val[1]/fullheight+" ";
				}
				else if (key=='C'){
					bottom += "C"+val[0]/fullwidth+','+val[1]/fullheight+" ";
					bottom += ""+val[2]/fullwidth+','+val[3]/fullheight+" ";
					bottom += ""+val[4]/fullwidth+','+val[5]/fullheight+" ";
				}
			}
			var piecelines = [];
			if (i%ncols > 0){
				piecelines.push(clines[i-1][2]);
			}
			else {
				piecelines.push(left);
			}
			piecelines.push(bottom);
			piecelines.push(right);
			if (i >= ncols){
				piecelines.push(clines[i-ncols][3]);
			}
			else {
				piecelines.push(top);
			}
			clines.push(piecelines);
			
			
		
		}
		else {
			var left = x0c/fullwidth+','+y1c/fullheight+' '+x0c/fullwidth+','+y0c/fullheight+' ';
		
			var rightArray = getRightLine(vm,rightcode,x0c,x1c,y1c,y0c,i,ncols);
			var right = "";
			for (var ii=0;ii<rightArray.length;ii++){
				var key = Object.keys(rightArray[ii])[0];
				var val = rightArray[ii][key];
				if (key=='M'){
					right += val[0]/fullwidth+","+val[1]/fullheight+" ";
				}
				else if (key=='L'){
					right += "L"+val[0]/fullwidth+','+val[1]/fullheight+" ";
				}
				else if (key=='C'){
					right += "C"+val[0]/fullwidth+','+val[1]/fullheight+" ";
					right += ""+val[2]/fullwidth+','+val[3]/fullheight+" ";
					right += ""+val[4]/fullwidth+','+val[5]/fullheight+" ";
				}
			}
			var top = x0c/fullwidth+','+y0c/fullheight+' '+x1c/fullwidth+','+y0c/fullheight+' ';
			var bottomArray = getBottomLine(vm,bottomcode,x1c,x0c,y0c,y1c,i,ncols,nrows);
			var bottom = "";
			for (var ii=0;ii<bottomArray.length;ii++){
				var key = Object.keys(bottomArray[ii])[0];
				var val = bottomArray[ii][key];
				if (key=='M'){
					bottom += val[0]/fullwidth+","+val[1]/fullheight+" ";
				}
				else if (key=='L'){
					bottom += "L"+val[0]/fullwidth+','+val[1]/fullheight+" ";
				}
				else if (key=='C'){
					bottom += "C"+val[0]/fullwidth+','+val[1]/fullheight+" ";
					bottom += ""+val[2]/fullwidth+','+val[3]/fullheight+" ";
					bottom += ""+val[4]/fullwidth+','+val[5]/fullheight+" ";
				}
			}
			var piecelines = [];
			if (i%ncols > 0){
				piecelines.push(clines[i-1][2]);
			}
			else {
				piecelines.push(left);
			}
			if (i >= ncols){
				piecelines.push(clines[i-ncols][1]);
			}
			else {
				//hlines.push([line1,line2])
				piecelines.push(top);
			}
			piecelines.push(right);
			piecelines.push(bottom);
			
			
			
			clines.push(piecelines);
		
		}

		ccenters.push([(x0c+x1c)/2/fullwidth,(y0c+y1c)/2/fullheight]);
	}
	plines = clines;
	console.log(performance.now());
	for (var i=0;i<ncols*nrows;i++){
		locations.push([Math.random(),Math.random()])
	}
	
	for (var i=0;i<ncols*nrows;i++){
		rotations.push(Math.floor(Math.random()*4)*90)
		//rotations.push(0)
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
	return [lines,centers,locations,rotations,matches,nrows*ncols,clines,ccenters,plines];
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
function getNpieces(npieces,width,height) {
	
	let nrowsf = Math.floor(Math.sqrt(npieces*height/width));
	let ncolsf = Math.floor(nrowsf*width/height);

	
	//Find closest approximations
	var approxdimensions = [];
	var mind = npieces*2;
	if (nrowsf <3){nrowsf = 3;}
	if (ncolsf <3){ncolsf = 3;}
	for (var i=nrowsf-2;i<nrowsf+4;i++) {
		for (var ii=ncolsf-2;ii<ncolsf+4;ii++) {
			var nnpieces = i*ii;
			var npieceserr = Math.sqrt( (nnpieces-npieces)*(nnpieces-npieces)/(npieces*npieces) );
			var rat = ii/i;
			var raterr = Math.sqrt( (rat-width/height)*(rat-width/height)/((width/height)*(width/height)) );
			//var score = (raterr+.01) * Math.pow( npieceserr+.01, 2);
			var score = raterr + npieceserr*8;
			var dim = {nrows:i,ncols:ii,score:score};
			approxdimensions.push(dim);
		}
	}

	approxdimensions.sort(function compare(a, b) {
	  if (a.score > b.score) return 1;
	  if (b.score > a.score) return -1;

	  return 0;
	});
	
	var nrows = approxdimensions[0].nrows;
	var ncols = approxdimensions[0].ncols;
	return [nrows,ncols];
}

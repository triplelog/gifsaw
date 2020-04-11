const https = require('https');
var fs = require("fs");
var qs = require('querystring');
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

var tempKeys = {};
const User = require('./models/user');
const UserData = require('./models/userdata');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/gifsaw', {useNewUrlParser: true});
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
// use static authenticate method of model in LocalStrategy
//passport.use(User.createStrategy());
 
// use static serialize and deserialize of model for passport session support
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var express = require('express');



var app = express();
const session = require("express-session");
app.use(session({ secret: "cats" }));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(passport.initialize());
app.use(passport.session());
app.get('/account',
  function(req, res){
  	if (!req.isAuthenticated()){
  		if (req.query.e && req.query.e=='duplicate'){
  			res.write(nunjucks.render('loginregister.html',{
				duplicate: true,
			}));
			res.end();
  		}
  		else if (req.query.e && req.query.e=='badlogin'){
  			res.write(nunjucks.render('loginregister.html',{
				badlogin: true,
			}));
			res.end();
  		}
  		else {
  			res.write(nunjucks.render('loginregister.html',{}));
			res.end();
  		}
		
  	}
  	else {
  		var tkey = crypto.randomBytes(100).toString('hex').substr(2, 18);
		tempKeys[tkey] = {username:req.user.username};
		
		UserData.findOne({username:req.user.username}, function(err,result) {
			var formulas = result.formulas.color;
			var workspace;
			var wxml;
			var code;
			//console.log(req.user);
			for (var i=0;i<formulas.length;i++){
				formulas[i].id = i;
				workspace = new Blockly.Workspace();
				wxml = Blockly.Xml.textToDom(formulas[i].workspace);
				Blockly.Xml.domToWorkspace(wxml, workspace);
				code = Blockly.Lua.workspaceToCode(workspace);
				formulas[i].code = code;
			}
		
			var images = result.images;
			var templates = result.templates;
			for (var i=0;i<templates.length;i++){
				templates[i].id = i;
			}
			var creations = result.creations;
		
		
			res.write(nunjucks.render('account.html',{
				username: req.user.options.displayName || req.user.username,
				name: req.user.name || '',
				options: req.user.options,
				friends: result.friends,
				tkey: tkey,
				formulas: formulas,
				images: images,
				templates: templates,
				creations: creations,
			}));
			res.end();
		})
		
  	}
  	
  }
);

app.post('/register',
  function(req, res){
  	console.log('registering: ',performance.now());
  	var user = new User({username: req.body.username.toLowerCase(), options: {displayName: req.body.username,robot:1}});
	User.register(user,req.body.password, function(err) {
		if (err) {
		  if (err.name == 'UserExistsError'){
		  	res.redirect('../account?e=duplicate');
		  }
		  else {
		  	console.log(err);
		  }
		  
		}
		else {
			var userData = new UserData({username: req.body.username.toLowerCase(), formulas: {gradient:[],distance:[],color:[]}, images: [], templates: [], creations: [], friends: [], followers: []});
			userData.save(function(err,result){
				console.log('user registered!',performance.now());
				var robot = 'python3 python/robohash/createrobo.py '+req.body.username.toLowerCase()+' 1';
				var child = exec(robot, function(err, stdout, stderr) {
					console.log('robot created: ',performance.now());
					req.login(user, function(err) {
					  if (err) { res.redirect('/'); }
					  else {
						console.log('logged in: ',performance.now());
						res.redirect('../account');
					  }
					});
				});
			})
			
			
			
			
		}
		

	});
  }
);

function usernameToLowerCase(req, res, next){
	req.body.username = req.body.username.toLowerCase();
	next();
} 
app.post('/login',  usernameToLowerCase,
	passport.authenticate('local', { successRedirect: '/account', failureRedirect: '/account?e=badlogin' })
);

app.get('/logout', 
	function(req, res) {
	  req.logout();
	  res.redirect('../');
	}
);




module.exports = {loginApp: app, tempKeys: tempKeys}
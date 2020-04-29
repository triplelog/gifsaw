const https = require('https');
var fs = require("fs");
var qs = require('querystring');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
var nunjucks = require('nunjucks');
var crypto = require("crypto");
//var Blockly = require('blockly');
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/soliturn.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/soliturn.com/fullchain.pem')
};
const { PerformanceObserver, performance } = require('perf_hooks');

var tempKeys = {};
const User = require('./models/user');
const GifsawData = require('./models/gifsawdata');
const mongoose = require('mongoose');
mongoose.connect('mongodb://45.32.213.227:27017/triplelog', {useNewUrlParser: true});
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
  			res.write(nunjucks.render('templates/loginregisterbase.html',{
				duplicate: true,
			}));
			res.end();
  		}
  		else if (req.query.e && req.query.e=='badlogin'){
  			res.write(nunjucks.render('templates/loginregisterbase.html',{
				badlogin: true,
			}));
			res.end();
  		}
  		else {
  			res.write(nunjucks.render('templates/loginregisterbase.html',{}));
			res.end();
  		}
		
  	}
  	else {
  		var tkey = crypto.randomBytes(100).toString('hex').substr(2, 18);
		tempKeys[tkey] = {username:req.user.username.toLowerCase()};
		
		GifsawData.findOne({username:req.user.username.toLowerCase()}, function(err,result) {
			if (err){
				console.log(err);
			}
			if (result == null){
				result = {username: req.user.username.toLowerCase(), puzzles: [], friends: [], followers: []};
				var gifsawData = new GifsawData(result);
				gifsawData.save(function(err2,result2){
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
				});
				
			}
		
			res.write(nunjucks.render('templates/accountbase.html',{
				username: req.user.options.displayName || req.user.username,
				name: req.user.name || '',
				options: req.user.options,
				friends: result.friends,
				tkey: tkey,
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
			var gifsawData = new GifsawData({username: req.body.username.toLowerCase(), puzzles: [], friends: [], followers: []});
			gifsawData.save(function(err,result){
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
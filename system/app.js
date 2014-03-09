
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var ObjectId = require('mongodb').ObjectID;
var fs = require('fs');

var mongoose = require('mongoose');
var Grid = require('gridfs-stream');

var passport = require('passport');
var util = require('util');
var GoogleStrategy = require('passport-google').Strategy;

var app = express();

// Passport session setup.
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session. Typically,
// this will be as simple as storing the user ID when serializing, and finding
// the user by ID when deserializing. However, since this example does not
// have a database of user records, the complete Google profile is serialized
// and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the GoogleStrategy within Passport.
// Strategies in passport require a `validate` function, which accept
// credentials (in this case, an OpenID identifier and profile), and invoke a
// callback with a user object.
passport.use(new GoogleStrategy({
    returnURL: 'http://tsb358.no-ip.biz/auth/google/return',
    realm: 'http://tsb358.no-ip.biz/'
  },
  function(identifier, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user. In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));

// Simple route middleware to ensure user is authenticated.
// Use this route middleware on any resource that needs to be protected. If
// the request is authenticated (typically via a persistent login session),
// the request will proceed. Otherwise, the user will be redirected to the
// login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}


var config = require("./config");




// initialize mongoose & gridfs

var conn = mongoose.createConnection(config.mongoose);

Grid.mongo = mongoose.mongo;

conn.once("open", function() {
  
  console.log("connected to mongo");
  
});

var gfs = Grid(conn.db)




// all environments
//app.set('port', process.env.PORT || 3000);
app.set('port', 40123);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.multipart());
app.use(express.methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

app.post('/file-upload',function(req, res){
  
  
  var file = req.files.file;
  
  fs.createReadStream(file.path).pipe(gfs.createWriteStream({filename:file.originalFilename})).on("close",function(){
    res.redirect("/");
  });
  
  
})

app.get('/uploads.json',function(req,res){
  
  gfs.files.find().toArray(function (err, files) {
    if (err) {
      console.log(err);
    } else {
      res.json(files);
    }
  });
  
});

app.get("/:file_id/info.json",function(req,res){
  
  
  
  var file_id = req.params.file_id;

  var files;

  gfs.files.find({_id:ObjectId(file_id)}).toArray(function (err,files){
    this.files = files[0];
    
    if(err)
      console.log(files);
  });
  console.log(this.files);
  res.send(this.files);
  
});

app.get("/:file_id/download",function(req,res){
  
  var file_id = req.params.file_id;

  var files;

  gfs.files.find({_id:ObjectId(file_id)}).toArray(function (err,files){
    this.files = files[0];
   
    var instream = gfs.createReadStream({_id: this.files._id});

    if(err)
      console.log(files);
    else {
      res.setHeader("Content-Type",this.files.contentType);
      res.setHeader("Content-Length", this.files.length);
      res.setHeader('Content-disposition', 'attachment; filename=\"' + this.files.filename+"\"");
      instream.pipe(res);
    }
      

  });

  
});

//passport

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.redirect('/auth/google');
});

// GET /auth/google
// Use passport.authenticate() as route middleware to authenticate the
// request. The first step in Google authentication will involve redirecting
// the user to google.com. After authenticating, Google will redirect the
// user back to this application at /auth/google/return
app.get('/auth/google',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

// GET /auth/google/return
// Use passport.authenticate() as route middleware to authenticate the
// request. If authentication fails, the user will be redirected back to the
// login page. Otherwise, the primary route function function will be called,
// which, in this example, will redirect the user to the home page.
app.get('/auth/google/return',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


/////////////

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


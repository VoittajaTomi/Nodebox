
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var fs = require('fs');

var mongoose = require('mongoose');
var Grid = require('gridfs-stream');


var app = express();

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
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

app.post('/file-upload',function(req, res){
  
  
  var file = req.files.file;
  
  var newPath = __dirname + "/uploads/"+path.basename(file.originalFilename);
  
  console.log(req.files);
  console.log("--->" + file.path);
  //fs.createReadStream(file.path).pipe(fs.createWriteStream(newPath)).on("close",function(){
  fs.createReadStream(file.path).pipe(gfs.createWriteStream({filename:file.originalFilename})).on("close",function(){
    res.redirect("back");
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

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

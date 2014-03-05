
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var fs = require('fs');

var app = express();

// all environments
//app.set('port', process.env.PORT || 3000);
app.set('port',40123);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.multipart());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

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
  fs.createReadStream(file.path).pipe(fs.createWriteStream(newPath)).on("close",function(){
    res.redirect("back");
  });


})

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

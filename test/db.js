var mongoose = require('mongoose');

mongoose.connect('mongodb://file_user:w4nk3r@y010.biz/mydb');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("works");
});
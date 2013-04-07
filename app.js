// vim: set ts=2 sw=2 expandtab :
var config = require('./config.js');

var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  currentValue = 0;

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {
  currentValue += 1;
  socket.emit('data', currentValue);
});

server.listen(3000);

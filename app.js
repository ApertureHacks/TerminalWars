// vim: set ts=2 sw=2 expandtab :
var config = require('./config.js');

var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  currentValue = 0; //Number of connected users

app.use(express.static(__dirname+'/public'));

app.get('/', function(req, res) {
  res.sendfile('index.html');
});

io.sockets.on('connection', function(socket) {
  if(currentValue >= 2)
  {
    socket.emit('data', 'ERROR: Overload');
  }
  else
  {
    currentValue += 1;
    io.sockets.emit('data', currentValue);
  }

  socket.on('disconnect', function() {
	currentValue -= 1;
	io.sockets.emit('data', currentValue);
  });
});

server.listen(3000);
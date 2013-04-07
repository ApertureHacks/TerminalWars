var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  currentValue = 0;

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
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

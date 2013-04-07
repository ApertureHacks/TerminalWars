// vim: set ts=2 sw=2 expandtab :
var config = require('./config.js');

var DigitalOceanAPI = require('digitalocean-api');
var api = new DigitalOceanAPI(config.digitalocean_keys.client,
  config.digitalocean_keys.api);

var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  users = {},
  currVms = 0, 
  currentValue = 0; //Number of connected users

app.use(express.static(__dirname+'/public'));

app.get('/', function(req, res) {
  res.sendfile('index.html');
});

var challenges_queue = { '_apache': [],
                         '_tunnel': [] };


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

  socket.on('choose_challenge', function(data) {
    challenges_queue[data.challenge].push({'username': data.username, 
      'socket': socket});
    if(challenges_queue[data.challenge].length > 1)
    {
      //Send event to clear screens
      var admin1 = challenges_queue[data.challenge][0]
      var admin2 = challenges_queue[data.challenge][1]
      challenges_queue[data.challenge].splice(0,1);

      admin1.socket.emit('join_users', data.challenge); 
      admin2.socket.emit('join_users', data.challenge);

      //Spin up VMs
      api.dropletNew('server1', '66', '4345', '1', config.ssh_keys.admin1, function(error, response) {
        //console.log(error);
        //console.log(response);
        admin1.server_id = response.id;
      })
      api.dropletNew('server2', '66', '4345', '1', config.ssh_keys.admin2, function(error, response) {
        //console.log(error);
        //console.log(response);
        admin2.server_id = response.id;
      })


      watch_builds(admin1, admin2);
    }
  });

  socket.on('check_uid', function(uid) {
    for(var field in users)
    {
      if(uid in field) return 1;
    }
  });

  function watch_builds(admin1, admin2) {
    var ready_admins = [];

    function check_build(admin)
    {
      api.dropletGet(admin1.server_id, function(error, data) {
        if(data.status == 'active')
        {
          admin.server_ip = data.ip_address;
          ready_admins.push(admin);
          if(ready_admins.length > 1)
          {
            start_round(ready_admins);
          }
        }
        else
        {
          setTimeout(function() {
            check_build(admin);
          }5000);
        }
      });
    }
    check_build(admin1);
    check_build(admin2);
  }

  function start_round(admins)
  {
    //First, set up tty.js on each server

  }
});

server.listen(3000);

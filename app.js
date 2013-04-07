// vim: set ts=2 sw=2 expandtab :
var config = require('./config.js');

//execute external commands.
var sys = require('sys');
var exec = require('child_process').exec;

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
      var admin1 = challenges_queue[data.challenge][0];
      var admin2 = challenges_queue[data.challenge][1];
      challenges_queue[data.challenge].splice(0,1);

      admin1.socket.emit('join_users', data.challenge); 
      admin2.socket.emit('join_users', data.challenge);

      // Destroy any old vms.
      //api.dropletGetAll(function(error, servers) {
        //for(i=0;i<servers.length;i++)
        //{
          //api.dropletDestroy(servers[i].id, function(errors, data){
            //console.log(data);
          //});
        //}
      //});

      //Spin up VMs
      //api.dropletNew('server1', '66', '202602', '1', config.ssh_key_ids.admin1, function(error, response) {
        ////console.log(error);
        ////console.log(response);
        //admin1.server_id = response.id;
      //});
        admin1.server_id = '145829';
      //api.dropletNew('server2', '66', '202602', '1', config.ssh_key_ids.admin2, function(error, response) {
        ////console.log(error);
        ////console.log(response);
        //admin2.server_id = response.id;
      //});
        admin2.server_id = '145828';


      watch_builds(admin1, admin2);
    }
  });


  socket.on('finished', function(user_info) {
    setTimeout(function() {
      io.sockets.emit("end_game", user_info.uid);
    }, 10000);
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
      api.dropletGet(admin.server_id, function(error, data) {
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
          },5000);
        }
      });
    }
    setTimeout(function() {
      check_build(admin1);
    },2000);
    setTimeout(function() {
      check_build(admin2);
    },5000);
  }

  function start_round(admins)
  {
    //First, set up tty.js on each server
    //var ssh_exec1 = exec('ssh -i /home/josh/projects/terminalwars/ssh_keys/admin1 -l root ' +
        //admins[0].server_ip +
        //' "nohup /root/node_modules/tty.js/bin/tty.js &"', function(error, stdout, stdout){
          //console.log(error.stack);
          //console.log('Error code: '+error.code);
          //console.log('Signal received: '+error.signal);

          //console.log('stdout: ' + stdout);
        //});

    //var ssh_exec2 = exec('ssh -i /home/josh/projects/terminalwars/ssh_keys/admin2 -l root ' +
        //admins[1].server_ip +
        //' "nohup /root/node_modules/tty.js/bin/tty.j &"', function(error, stdout, stdout){
          //console.log(error.stack);
          //console.log('Error code: '+error.code);
          //console.log('Signal received: '+error.signal);

          //console.log('stdout: ' + stdout);
        //});

    var sock1 = admins[0].socket;
    var sock2 = admins[1].socket;
    var admin_data1 = admins[0];
    var admin_data2 = admins[1];
    delete admin_data1.socket;
    delete admin_data2.socket;

    //Signal the browsers to popup tty.js
    sock1.emit('open_tty', admin_data1);
    sock2.emit('open_tty', admin_data2);
  }
});

server.listen(3000);

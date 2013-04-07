// vim: set ts=1 sw=2 expandtab :
$(document).ready(function() {
  var socket = io.connect('/');

/*  socket.on('data', function(currentValue) {
    $('h1').text(currentValue);
    if(currentValue != "ERROR: Overload")
    {
  $("#main_form").css('display', '');
    }
  });*/

  var player_data;

  socket.on('disconnect', function() {
    socket.emit('update');
  });

  socket.on('join_users', function(challenge) {
    clear_screen();
  });

  socket.on('open_tty', function(data) {
    $('#waiting').text("GO!");
    $('#finished').css('display','');
    player_data = data;
    console.log(player_data);
    window.open("http://"+data.server_ip+":8080", "Battle Station",
      'menubar=no,toolbar=no,width=800,height=500');
  });

  socket.on('end_game', function(winner) {
    console.log(winner);
    console.log(player_data.username);
    if(winner == player_data.username) {
      $('body').css('background-color', 'green');
    } else{
      $('body').css('background-color', 'red');
    }
  });

  /*Begin Helper Functions*/

  function clear_screen()
  {
    $("#main_form").css('display', 'none');
    $("#waiting").css('display','').after("<br\\><span>Goal: install apache and " +
        "configure to serve on non-standard port 8022.</span>");
  }

  function validate_form()
  {
    var uid = $("#_uid").val();
    var ok = socket.emit('check_uid', uid);
    if(ok)
    {
      console.log("UID taken");
    }
    console.log("Not token");
  }

  $("#submit_choice").click(function() {
    socket.emit('choose_challenge', {'username': $('#_uid').val(),
                                     'challenge': $('#challenges_select').find(':selected').attr('value')});
  });

  $('#finished').click(function() {
    socket.emit('finished', player_data);
  });

  /*End Helper Functions*/
});

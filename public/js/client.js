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

  socket.on('disconnect', function() {
    socket.emit('update');
  });

  socket.on('join_users', function(challenge) {
    clear_screen();
  });

  socket.on('open_tty', function(data) {
    $('#waiting').text("GO!");
    $('#finished').css('display','');
    window.open("http://"+data.server_ip+":8080", "Battle Station",
      'menubar=no,toolbar=no,width=800,height=500');
  });

  /*Begin Helper Functions*/

  function clear_screen()
  {
    $("#main_form").css('display', 'none');
    $("#waiting").css('display','').after("<br\\><span>Goal: install apache and " +
        "configure to serve on non-standard port 8080.</span>");
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

  /*End Helper Functions*/
});

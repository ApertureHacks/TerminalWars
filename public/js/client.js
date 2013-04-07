// vim: set ts=1 sw=2 expandtab :
$(document).ready(function() {
  var socket = io.connect('/');

  socket.on('data', function(currentValue) {
    $('h1').text(currentValue);
    if(currentValue != "ERROR: Overload")
    {
  $("#main_form").css('display', '');
    }
  });

  socket.on('disconnect', function() {
    socket.emit('update');
  });

  socket.on('join_users', function(challenge) {
    clear_screen();
  });

  /*Begin Helper Functions*/

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
    socket.emit('choose_challenge', {'username': $('#_uid').text(),
                                     'challenge': $('#challenges_select').find(':selected').attr('value')});
  });

  /*End Helper Functions*/
});

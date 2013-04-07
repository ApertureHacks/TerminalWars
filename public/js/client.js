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

/*End Helper Functions*/

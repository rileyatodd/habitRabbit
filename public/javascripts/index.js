$(document).ready(function() {
  var parsePath = /^\/([A-Za-z_]+)\/([A-Za-z0-9 %]+)/;
  var pathResults = parsePath.exec(window.location.pathname);
  var username = pathResults[2];
  username = username.replace(/%20/, ' ');
  var currentUser;
  HABRAB.getUser(username)
    .done(function(user){
      currentUser = user;
      HABRAB.populateHabitList(user);   
    });
  $('#addHabitForm').on('click', '#addHabitButton', function(){
    //Gather info from form into an object and call addHabit on it
    var habit = {};
    habit.name = $('#inputHabitName').val();
    HABRAB.addHabit(currentUser, habit);
  });
  $('.deleteHabit').click(function(e) {
    e.preventDefault();
    var habitElement = $(this).closest('.habit');
    var name = habitElement.find('.habitName').text();
    var habit;
    for (var i = 0, len = currentUser.habits.length; i < len; i++) {
      if (currentUser.habits[i].name == name) {
        habit = currentUser.habits[i];
      }
    }
    HABRAB.removeHabit(currentUser, habit, habitElement);
  });
});
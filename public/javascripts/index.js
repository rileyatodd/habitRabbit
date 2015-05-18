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
    })
    .then(function(){
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
  $('#addHabitForm').on('click', '#addHabitButton', function(e){
    e.preventDefault();
    //Gather info from form into an object and call addHabit on it
    var habit = {};
    habit.name = $('#inputHabitName').val().replace(/[^A-Za-z0-9]+/, '');
    HABRAB.addHabit(currentUser, habit);
  });
});
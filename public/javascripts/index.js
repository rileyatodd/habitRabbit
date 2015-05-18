$(document).ready(function() {
  var parsePath = /^\/([A-Za-z_]+)\/([A-Za-z0-9 %]+)/;
  var pathResults = parsePath.exec(window.location.pathname);
  if (pathResults && pathResults[1] === 'users' && pathResults[2]){
    var username = pathResults[2];
    username = username.replace(/%20/, ' ');
  }
  var currentUser;
  HABRAB.getUser(username)
    .done(function(user){
      currentUser = user;
      HABRAB.populateHabitList(user);   
    })
    .then(function(){
      $('#habitList').on('click', '.deleteHabit', function(e) {
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
    habit.name = $('#inputHabitName').val().replace(/[^A-Za-z0-9 ]+/g, '');
    habit.frequency = +$('input#frequency').val();
    habit.period = $('select#period').val();
    habit.goodOrNo = $('select#goodOrNo').val();
    $('#addHabitForm')[0].reset();
    HABRAB.addHabit(currentUser, habit);
  });
});
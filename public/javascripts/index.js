'use strict';
$(document).ready(function() {
  var parsePath = /^\/([A-Za-z_]+)\/([A-Za-z0-9 %]+)/;
  var pathResults = parsePath.exec(window.location.pathname);
  if (pathResults && pathResults[1] === 'users' && pathResults[2]) {
    var username = pathResults[2];
    username = username.replace(/%20/, ' ');
    var currentUser;
    HABRAB.get('/users/' + username)
      .then(function(user) {
        currentUser = user;
        HABRAB.populateHabitList(user);   
      })
      .then(function() {
        $('#habitList').on('click', '.deleteHabit', function(e) {
          e.preventDefault();
          var habitElement = $(this).closest('.habit');
          var habit = HABRAB.getClickedHabit(currentUser, habitElement);
          HABRAB.removeHabit(currentUser, habit, habitElement);
        });
        $('#habitList').on('click', '.reinforceNo', function() {
          var habitElement = $(this).closest('.habit');
          var habit = HABRAB.getClickedHabit(currentUser, habitElement);
          habitElement.detach();
          HABRAB.newHabitRecordElement(habit)
            .then(function(habitRecordEl) {
              $('#habitList').find('tbody').append(habitRecordEl);
            });
        });
        $('#habitList').on('click', '.reinforceYes', function() {
          var habitElement = $(this).closest('.habit');
          var habit = HABRAB.getClickedHabit(currentUser, habitElement);
          habitElement.detach();
          HABRAB.reinforceHabit(currentUser, habit, 1, 0);
          HABRAB.newHabitRecordElement(habit)
            .then(function(habitRecordEl) {
              $('#habitList').find('tbody').append(habitRecordEl);
            });
        });
      });
  }
  $('#addHabitForm').on('click', '#addHabitButton', function(e) {
    e.preventDefault();
    //Gather info from form into an object and call addHabit on it
    var habit = {};
    habit.name = $('#inputHabitName').val().replace(/[^A-Za-z0-9 \-_]+/g, '');
    habit.frequency = +$('input#frequency').val();
    habit.period = $('select#period').val();
    habit.goodOrNo = $('select#goodOrNo').val();
    habit.habitRecord = [0];
    $('#addHabitForm')[0].reset();
    HABRAB.addHabit(currentUser, habit);
  });
});
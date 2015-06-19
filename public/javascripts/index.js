'use strict';
$(document).ready(function() {
  var parsePath = /^\/([A-Za-z_]+)\/([A-Za-z0-9 %]+)/;
  var pathResults = parsePath.exec(window.location.pathname);
  if (pathResults && pathResults[1] === 'users' && pathResults[2]) {
    var username = pathResults[2];
    username = username.replace(/%20/, ' ');
    var currentUser;
    HR.get('/users/' + username)
      .then(function(user) {
        currentUser = user;
        HR.populateHabitList(user);   
      })
      .then(function() {
        $('table').on('click', '.deleteHabit', function(e) {
          e.preventDefault();
          var habitElement = $(this).closest('tr');
          var habit = HR.getClickedHabit(currentUser, habitElement);
          HR.removeHabit(currentUser, habit, habitElement);
        });
        $('#habitList').on('click', '.reinforceNo', function() {
          var habitElement = $(this).closest('.habit');
          var habit = HR.getClickedHabit(currentUser, habitElement);
          habitElement.detach();
          HR.newHabitRecordElement(habit)
            .then(function(habitRecordEl) {
              $('#recordListBody').append(habitRecordEl);
            });
        });
        $('#habitList').on('click', '.reinforceYes', function() {
          var habitElement = $(this).closest('.habit');
          var habit = HR.getClickedHabit(currentUser, habitElement);
          habitElement.detach();
          HR.reinforceHabit(currentUser, habit, 1, 0);
          HR.newHabitRecordElement(habit)
            .then(function(habitRecordEl) {
              $('#recordListBody').append(habitRecordEl);
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
    habit.habitRecord = [{
      times:0,
      periodEnd: moment().endOf(habit.period),
      timeStamp: moment().add(1, habit.period + 's')
    }];
    $('#addHabitForm')[0].reset();
    HR.addHabit(currentUser, habit);
  });
});
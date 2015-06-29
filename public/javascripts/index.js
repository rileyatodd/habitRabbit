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
        // Promise.all(user.habits.map(function(habit) {
        //   return HR.timeAdjustRecord(user, habit);
        // })).then(function() {
        //   HR.populateHabitList(user);
        // })
        HR.populateHabitList(user);
      })
      .then(function() {
        $('table').on('click', '.deleteHabit', function(e) {
          e.preventDefault();
          var habitElement = $(this).closest('tr');
          var habit = HR.getClickedHabit(currentUser, habitElement);
          HR.removeHabit(currentUser, habit, habitElement);
        });
        $('#habitTable').on('click', '.reinforce', function() {
          var habitElement = $(this).closest('.habit');
          var habit = HR.getClickedHabit(currentUser, habitElement);
          HR.reinforceHabit(currentUser, habit);
          HR.newHabitElement(currentUser, habit)
            .then(function(habitRecordEl) {
              habitElement.replaceWith(habitRecordEl);
            });
        });
        $('#editHabitForm').on('click', '#saveChanges', function(e) {
          e.preventDefault();
          var habit = currentUser.habits.filter(function(hab){
            return hab.name === $('h1').text();
          })[0];
          habit.name = $('input#name').val().replace(/[^A-Za-z0-9 \-_]+/g, '');
          habit.frequency = $('input#frequency').val();
          habit.period = $('select#period').val();
          HR.putJSON('/users/' + currentUser.name + '/habits/' + habit.name, habit)
            .then(function() {
              window.location.href = '/users/' + currentUser.name + '/index';
            });
        });
        $('#editHabitForm').on('click', '#cancelEdit', function(e){
          e.preventDefault();
          window.location.href = '/users/' + currentUser.name + '/index';
        });
        $('select#goodOrNo').on('change', function(e) {
          var selected = $(this).find('option:selected');
          var form = $('form#addHabitForm');
          if (selected.val() === '') {
            form.find('#frequencyAndPeriod').addClass('hidden');
          } else {
            form.find('.hidden').removeClass('hidden');
          }
        });
      });
  }
  $('#addHabitForm').on('click', '#addHabitButton', function(e) {
    e.preventDefault();
    var habit = {};
    habit.name = $('#inputHabitName').val().replace(/[^A-Za-z0-9 \-_]+/g, '');
    habit.frequency = +$('input#frequency').val();
    habit.period = $('select#period').val();
    habit.goodOrNo = $('select#goodOrNo').val();
    habit.timestamps = [];
    habit.startOfFirstPeriod = moment().startOf(habit.period);
    $('#addHabitForm')[0].reset();
    HR.addHabit(currentUser, habit);
    $('#addHabitForm').find('select#goodOrNo').trigger('change');
  });
});
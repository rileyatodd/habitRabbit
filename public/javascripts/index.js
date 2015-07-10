'use strict';

//initialize listeners for the habit table
(function($) {
  $.fn.initializeHabitTable = function(currentUser) {
    this.on('click', '.deleteHabit', function(e) {
      e.preventDefault();
      var habitElement = $(this).closest('tr');
      var habit = HR.getClickedHabit(currentUser, habitElement);
      HR.removeHabit(currentUser, habit, habitElement);
    });
    this.on('click', '.reinforce .btn', function() {
      var habitElement = $(this).closest('.habit');
      var habit = HR.getClickedHabit(currentUser, habitElement);
      HR.reinforceHabit(currentUser, habit);
      HR.newHabitElement(currentUser, habit)
        .then(function(habitRecordEl) {
          habitElement.replaceWith(habitRecordEl);
        });
    });
  };
})(jQuery);

(function($) {
  $.fn.initializeEditHabitForm = function(currentUser) {
    var originalHabitName = $('input#name').val();

    var saveChanges = function() {
      var habit = currentUser.habits.filter(function(hab){
        return hab.name === originalHabitName;
      })[0];
      habit.name = $('input#name').val().replace(/[^A-Za-z0-9 \-_]+/g, '');
      habit.frequency = $('input#frequency').val();
      habit.period = $('select#period').val();
      HR.putJSON('/users/' + currentUser.name + '/habits/' + originalHabitName, habit)
        .then(function() {
          window.location.href = '/users/' + currentUser.name + '/index';
        });
    }
    this.on('click', '#cancelEdit', function(e){
      window.location.href = '/users/' + currentUser.name + '/index';
    });
    this.submit(function(e){
      e.preventDefault();
      saveChanges();
    });
  };
})(jQuery);

(function($) {
  $.fn.initializeAddHabitForm = function(currentUser) {
    var $this = this;
    this.find('select#goodOrNo').on('change', function(e) {
      var selected = $(this).find('option:selected');
      if (selected.val() === '') {
        $this.find('#frequencyAndPeriod').addClass('hidden');
      } else {
        $this.find('.hidden').removeClass('hidden');
      }
    });
    this.on('click', '#addHabitButton', function(e) {
      e.preventDefault();
      var habit = {
        name: $('#inputHabitName').val().replace(/[^A-Za-z0-9 \-_]+/g, ''),
        frequency: +$('input#frequency').val(),
        period: $('select#period').val(),
        goodOrNo: $('select#goodOrNo').val(),
        timestamps: [],
        startOfFirstPeriod: moment().startOf(period)
      };
      $this[0].reset();
      HR.addHabit(currentUser, habit);
      $this.find('select#goodOrNo').trigger('change');
    });
  };
})(jQuery);

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
        $('#habitTable').initializeHabitTable(currentUser);
        $('#editHabitForm').initializeEditHabitForm(currentUser);
        $('#addHabitForm').initializeAddHabitForm(currentUser);
      });
  }
});
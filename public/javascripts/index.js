$(document).ready(function() {
  populateHabitList('Test User');
});

var populateHabitList = function(username) {
  $.getJSON('/users/' + username)
  .success(function(user) {
    var habitList = $('#habitList');
    var parent = habitList.parent();
    habitList.detach();
    $.each(user.habits, function() {
      var habitElement = $('<li></li>');
      habitElement.text(this.name);
      habitList.append(habitElement);
    });
    parent.append(habitList);
  });
};
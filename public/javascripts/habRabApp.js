'use strict';
var HABRAB = (function() {

  var retObj = {};

  var habitHTML;
  var habitHTMLPromise = $.get('/habit').done(function(html){habitHTML = html});

  //Fetches a user
  var getUser = function(username) {
    var deferred = $.Deferred();
    $.getJSON('/users/' + username)
      .success(function(user) {
        deferred.resolve(user);
      });
    return deferred.promise();
  };
  retObj.getUser = getUser;

  var addUser = function(user) {
    if (!user.name) {
      throw new Error('Must supply a user name');
    }
    $.post('/users/' + user.name, user);
  };
  retObj.addUser = addUser;

  var addHabit = function(user, habit) {
    var habitElement;
    if (!user.habits) {
      user.habits = [];
    }
    user.habits.push(habit);
    if (!habitHTML) {
      $.get('/habit', function(html) {
        habitHTML = html;
      });
    }
    $.when(
      $.post('/users/' + user.name + '/habits/' + habit.name, habit)
    ).then(function() {
      habitElement = $(habitHTML);
      habitElement.find('.habitName').text(habit.name);
      $('#habitList').append(habitElement);
    }
      
    );
    $
  };
  retObj.addHabit = addHabit;

  var removeHabit = function(user, habit, habitElement) {
    var habitJSON = JSON.stringify(habit);
    for (var i = 0, len = user.habits.length; i < len; i++) {
      if (JSON.stringify(user.habits[i]) === habitJSON) {
        user.habits.splice(i, 1);
      }
    }
    //Send an HTTP delete to the habit url and remove from the DOM
    $.ajax('/users/' + user.name + '/habits/' + habit.name, {type: 'DELETE'});
    habitElement.detach();
  };
  retObj.removeHabit = removeHabit;

  //Fetches habit list with AJAX and inserts into DOM
  var populateHabitList = function(user) {    
    var habitList = $('#habitList'),
      parent = habitList.parent(),
      habitElement;
    habitList.detach();
    var habits = user.habits;
    //Fill in and uncollapse the habit elements that were rendered server-side
    for (var i = 0, len = habits.length; i < len; i++) {
      habitElement = $(habitHTML);
      var habit = habits[i];
      habitElement.find('.habitName').text(habit.name);
      habitList.append(habitElement);
    }
    parent.append(habitList);
  };
  retObj.populateHabitList = populateHabitList;

  //Records how many times you reinforced a habit in a period
  var reinforceHabit = function(habit, times, periodsAgo) {
    times = times || 1;
    periodsAgo = periodsAgo || 0;

    var habitRecord = habit.habitRecord;

    //Pad record with zeros if periodsAgo is more than the length of the record
    var index = habitRecord.length - periodsAgo - 1;
    while (index < 0) {
      habitRecord.unshift(0);
      index += 1;
    }
    //Record the number of times reinforced for the proper period
    habitRecord[index] = habitRecord[index] ? habitRecord[index] + times : times;

    //Truncate the habitRecord to the most recent 30 periods
    if (habitRecord.length > 30) {
      habitRecord.splice(habitRecord.length - 30, 30);
    }

  };
  retObj.reinforceHabit = reinforceHabit;

  return retObj;
})();
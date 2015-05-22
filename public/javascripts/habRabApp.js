'use strict';
var HABRAB = (function() {

  var retObj = {};

  var habitHTML;

  var habitRecordHTML;

  var getHabitHTML = function() {
    var deferred = $.Deferred();
    if (habitHTML) {
      deferred.resolve(habitHTML);
    } else {
      $.get('/habit').done(function(html){
        habitHTML = html;
        deferred.resolve(habitHTML);
      });
    }
    return deferred.promise();
  };
  retObj.getHabitHTML = getHabitHTML;

  var newHabitElement = function(habit) {
    var deferred = $.Deferred();
    getHabitHTML()
      .then(function(html){
        var habitElement = $(html);
        habitElement.find('.habitName').text(habit.name);
        habitElement.find('.period').text(habit.period);
        deferred.resolve(habitElement);
      });
    return deferred.promise();
  };

  var getHabitRecordHTML = function() {
    var deferred = $.Deferred();
    if (habitRecordHTML) {
      deferred.resolve(habitRecordHTML);
    } else {
      $.get('/habitRecord', function(html) {
        habitRecordHTML = html;
        deferred.resolve(html);
      });
    }
    return deferred.promise();
  };
  retObj.getHabitRecordHTML = getHabitRecordHTML;

  var newHabitRecordElement = function(habit) {
    var deferred = $.Deferred();
    getHabitRecordHTML()
      .then(function(html) {
        var habitRecordElement = $(html);
        habitRecordElement.find('.habitName').text(habit.name);
        habitRecordElement.find('.habitRecord').text(habit.habitRecord);
        deferred.resolve(habitRecordElement);
      });
    return deferred.promise();
  };
  retObj.newHabitRecordElement = newHabitRecordElement;

  var getClickedHabit = function(currentUser, habitElement) {
    var name = habitElement.find('.habitName').text();
    var habit = currentUser.habits.filter(function(hab){ return hab.name === name })[0];
    return habit;
  };
  retObj.getClickedHabit = getClickedHabit;

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

    $.when(
      $.ajax({
        url:'/users/' + user.name + '/habits/' + habit.name,
        data: JSON.stringify(habit),
        type: 'POST',
        contentType: 'application/json'
      }), 
      newHabitElement(habit)
        .then(function(habitEl){
          habitElement = habitEl;
        })
    ).then(function() {
        $('#habitList').append(habitElement);
    });
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
      parent = habitList.parent();
    habitList.detach();
    var habits = user.habits;
    for (var i = 0, len = habits.length; i < len; i++) {
      var habit = habits[i];
      newHabitElement(habit)
        .then(function(habitEl){
          habitList.append(habitEl);
        });
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
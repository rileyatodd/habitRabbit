'use strict';
var HABRAB = (function() {

  var retObj = {};

  var habitHtmlPromise;

  var habitRecordHtmlPromise;

  //wraps jQuery get to return real promise
  var get = function(url) {
    return new Promise(function(resolve, reject) {
      $.ajax({
        url: url,
        type: 'GET',
        success: resolve,
        error: reject
      });
    });
  }
  retObj.get = get;

  var getJSON = function(url) {
    return get(url).then(JSON.parse);
  }
  retObj.getJSON = getJSON;

  var postJSON = function(url, data) {
    return new Promise(function(resolve, reject) {
      $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: resolve,
        error: reject
      });
    });
  }
  retObj.postJSON = postJSON;

  var putJSON = function(url, data) {
    return new Promise(function(resolve, reject) {
      $.ajax({
        url: url,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: resolve,
        error: reject
      });
    });
  }
  retObj.putJSON = putJSON;

  var newHabitElement = function(habit) {
    habitHtmlPromise = habitHtmlPromise || get('/habit');
    return habitHtmlPromise.
      then(function(html){
        var habitElement = $(html);
        habitElement.find('.habitName').text(habit.name);
        habitElement.find('.period').text(habit.period);
        return habitElement;
      });
  };

  var newHabitRecordElement = function(habit) {
    habitRecordHtmlPromise = habitRecordHtmlPromise || get('/habitRecord');
    return habitRecordHtmlPromise.
      then(function(html) {
        var habitRecordElement = $(html);
        habitRecordElement.find('.habitName').text(habit.name);
        habitRecordElement.find('.habitRecord').text(habit.habitRecord);
        return habitRecordElement;
      });
  };
  retObj.newHabitRecordElement = newHabitRecordElement;

  var getClickedHabit = function(currentUser, habitElement) {
    var name = habitElement.find('.habitName').text();
    //basically just array.find. Didn't want to bother with polyfilling it
    var habit = currentUser.habits.filter(function(hab){ return hab.name === name })[0];
    return habit;
  };
  retObj.getClickedHabit = getClickedHabit;

  var addUser = function(user) {
    if (!user.name) {
      throw new Error('Must supply a user name');
    }
    return Promise.resolve($.post('/users/' + user.name, user));
  };
  retObj.addUser = addUser;

  var addHabit = function(user, habit) {
    var habitElement;
    if (!user.habits) {
      user.habits = [];
    }
    user.habits.push(habit);

    return Promise.all([
      postJSON('/users/' + user.name + '/habits/' + habit.name, habit),
      newHabitElement(habit)
        .then(function(habitEl){
          habitElement = habitEl;
        })
    ]).then(function() {
        $('#habitList').append(habitElement);
    });
  };
  retObj.addHabit = addHabit;

  var removeHabit = function(user, habit, habitElement) {
    var habitJSON = JSON.stringify(habit);
    user.habits = user.habits.filter(function(habit) {
      JSON.stringify(habit) !== habitJSON;
    });
    
    //Remove from the DOM and return a promise that resolves when the habit is deleted
    habitElement.detach();
    return Promise.resolve($.ajax('/users/' + user.name + '/habits/' + habit.name, {type: 'DELETE'}));
  };
  retObj.removeHabit = removeHabit;

  //Fetches habit list with AJAX and inserts into DOM
  var populateHabitList = function(user) {    
    var habitList = $('#habitList'),
      parent = habitList.parent();
    habitList.detach();
    var habits = user.habits;
    habits.map(function(habit) {
      newHabitElement(habit)
        .then(function(habitEl) {
          habitList.append(habitEl);
        });
    });
    parent.append(habitList);
  };
  retObj.populateHabitList = populateHabitList;

  //Records how many times you reinforced a habit in a period
  var reinforceHabit = function(user, habit, times, periodsAgo) {
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

    return putJSON('/users/' + user.name + '/habits/' + habit.name + '/habitrecord', habitRecord);
  };
  retObj.reinforceHabit = reinforceHabit;

  return retObj;
})();
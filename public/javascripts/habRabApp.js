'use strict';
var HR = (function() {

  var retObj = {};

  var habitHtmlPromise,
    habitReminderHtmlPromise;

  var populateHabitList = function(user) {    
    var habitList = $('#habitTable'),
      container = habitList.parent();
    habitList.detach();
    var habits = user.habits;
    habits.map(function(habit) {
      newHabitElement(user, habit)
        .then(function(habitEl) {
          habitList.append(habitEl);
        });
    });
    container.find('#addHabitForm').after(habitList);
  };
  retObj.populateHabitList = populateHabitList;

  var newHabitElement = function(user, habit) {
    habitHtmlPromise = habitHtmlPromise || get('/habit');
    return habitHtmlPromise.
      then(function(html) {
        var habitElement = $(html),
          link = habitElement.find('.editHabit');
        link.attr('href', '/users/' + user.name + '/habits/' + habit.name + '/edit');
        link.find('.habitName').text(habit.name);
        habitElement.find('.reinforceGlyphicon').addClass(habit.goodOrNo ? 'glyphicon-thumbs-up': 'glyphicon-thumbs-down');
        habitElement.find('.record').html(generateRecordTable(habit));
        return habitElement;
      });
  };
  retObj.newHabitElement = newHabitElement;

  var newHabitReminderElement = function(habit) {
    habitReminderHtmlPromise = habitReminderHtmlPromise || get('/habitReminder');
    return habitReminderHtmlPromise.
      then(function(html){
        var habitElement = $(html);
        habitElement.find('.habitName').text(habit.name);
        habitElement.find('.period').text(habit.period);
        return habitElement;
      });
  };
  retObj.newHabitReminderElement = newHabitReminderElement;

  var generateRecordTable = function(habit) {
    var recordTableElement = $('<table class="recordTable table table-bordered"><tr></tr></table>'),
      periodArray = generatePeriodArrayFromTimestamps(habit),
      periodElement;
    for(var len = periodArray.length, i = Math.min(len, 5); i > 0; i--) {
      periodElement = $('<td></td>').text(periodArray[len - i]);
      recordTableElement.find('tr').append(periodElement);
    }
    colorRecordTable(recordTableElement, habit);
    return recordTableElement;
  };
  retObj.generateRecordTable = generateRecordTable;

  var generatePeriodArrayFromTimestamps = function(habit) {
    var periodArray = [],
      numPeriods = moment().diff(habit.startOfFirstPeriod, habit.period) + 1,
      index;

    for (var i = 0; i < numPeriods; i++) {
      periodArray[i] = 0;
    }
    habit.timestamps.forEach(function(timestamp) {
      index = moment(timestamp).diff(habit.startOfFirstPeriod, habit.period);
      periodArray[index] += 1;
    });
    return periodArray;
  };
  retObj.generatePeriodArrayFromTimestamps = generatePeriodArrayFromTimestamps;

  var colorRecordTable = function(recordTableElement, habit) {
    var periodElements = recordTableElement.find('td'),
      classForOverThreshold,
      classForUnderThreshold;
    classForOverThreshold = habit.goodOrNo ? 'success' : 'danger';
    classForUnderThreshold = habit.goodOrNo ? 'danger' : 'success';
    var periodElement;
    periodElements.each(function(index, td) {
      periodElement = $(td);
      if (periodElement.text() >= habit.frequency) {
        periodElement.addClass(classForOverThreshold);
      } else {
        periodElement.addClass(classForUnderThreshold);
      }
    });
  };

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
      newHabitElement(user, habit)
        .then(function(habitEl){
          habitElement = habitEl;
        })
    ]).then(function() {
      $('#habitTable').append(habitElement);
    });
  };
  retObj.addHabit = addHabit;

  var removeHabit = function(user, habit, habitElement) {
    var habitJSON = JSON.stringify(habit);
    user.habits = user.habits.filter(function(hab) {
      return JSON.stringify(hab) !== habitJSON;
    });
    habitElement.detach();
    return Promise.resolve($.ajax('/users/' + user.name + '/habits/' + habit.name, {type: 'DELETE'}));
  };
  retObj.removeHabit = removeHabit;

  //Records how many times you reinforced a habit in a period
  var reinforceHabit = function(user, habit, time) {
    time = time || moment();
    habit.timestamps.push(time);
    return putJSON('/users/' + user.name + '/habits/' + habit.name + '/timestamps', habit.timestamps);
  };
  retObj.reinforceHabit = reinforceHabit;

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

  return retObj;
})();

// module.exports = HR;
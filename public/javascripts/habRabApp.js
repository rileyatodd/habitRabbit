'use strict';
var HR = (function() {

  // if (!moment) {
  //   var moment = require('moment');
  // }

  var retObj = {};

  var habitReminderHtmlPromise;

  var habitHtmlPromise;

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

  var recordTableFromHabit = function(habit) {
    var recordElement = $('<table class="recordTable table"><tr></tr></table>'),
      habitRecord = habit.habitRecord,
      times = null,
      period = null,
      frequency = habit.frequency,
      goodOrNo = habit.goodOrNo,
      record = null;
    for(var i = 5, len = habitRecord.length; i > 0; i--) {
      record = habitRecord[len - i] ||
        {times: 0, periodEnd: moment().endOf(habit.period).subtract(i, habit.period)};
      times = record.times;
      period = $('<td></td>').text(times);
      if ((times < frequency && goodOrNo) || (times >= frequency && !goodOrNo)) {
        period.addClass('danger');
      } else {
        period.addClass('success');
      }
      recordElement.find('tr').append(period);
    }
    return recordElement;
  };
  retObj.recordTableFromHabit = recordTableFromHabit;

  var newHabitElement = function(user, habit) {
    habitHtmlPromise = habitHtmlPromise || get('/habit');
    return habitHtmlPromise.
      then(function(html) {
        var habitElement = $(html),
          link = habitElement.find('.editHabit');
        link.attr('href', '/users/' + user.name + '/habits/' + habit.name + '/edit');
        link.find('.habitName').text(habit.name);
        habitElement.find('.reinforceGlyphicon').addClass(habit.goodOrNo ? 'glyphicon-thumbs-up': 'glyphicon-thumbs-down');
        habitElement.find('.record').html(recordTableFromHabit(habit));
        return habitElement;
      });
  };
  retObj.newHabitElement = newHabitElement;

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
      $('#habitList').append(habitElement);
    });
  };
  retObj.addHabit = addHabit;

  var removeHabit = function(user, habit, habitElement) {
    var habitJSON = JSON.stringify(habit);
    user.habits = user.habits.filter(function(hab) {
      return JSON.stringify(hab) !== habitJSON;
    });
    
    //Remove from the DOM and return a promise that resolves when the habit is deleted
    habitElement.detach();
    return Promise.resolve($.ajax('/users/' + user.name + '/habits/' + habit.name, {type: 'DELETE'}));
  };
  retObj.removeHabit = removeHabit;

  //Fetches habit list with AJAX and inserts into DOM
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

  var timeAdjustRecord = function(user, habit) {
    var now = moment(),
      record = habit.habitRecord,
      period = habit.period,
      lastPeriodEnd = moment(record[record.length - 1].periodEnd),
      diff = now.diff(lastPeriodEnd, period, true);
    if (diff < -1) {
      return Promise.reject('Future period has been recorded. Bad record state.');
    }
    if (diff < 0) {
      return Promise.resolve();
    }
    while (diff > 0) {
      record.push ({times: 0, periodEnd: lastPeriodEnd.add(1, period)});
      diff--;
    }
    return putJSON('/users/' + user.name + '/habits/' + habit.name + '/habitrecord', record);
  };
  retObj.timeAdjustRecord = timeAdjustRecord;

  //Records how many times you reinforced a habit in a period
  var reinforceHabit = function(user, habit, times, periodsAgo) {
    times = times || 1;
    periodsAgo = periodsAgo || 0;

    var habitRecord = habit.habitRecord,
      now = moment();

    //Pad record with zeros if periodsAgo is more than the length of the record
    var index = habitRecord.length - periodsAgo - 1,
      periodEnd = now.clone().endOf(habit.period);
    while (index < 0) {
      habitRecord.unshift({times: 0, periodEnd: periodEnd.subtract(1, habit.period)});
      index += 1;
    }
    //Record the number of times reinforced for the proper period
    var record = habitRecord[index];
    record.times = record.times ? record.times + times : times;
    record.timeStamp = moment();

    //Truncate the habitRecord to the most recent 30 periods
    if (habitRecord.length > 30) {
      habitRecord.splice(habitRecord.length - 30, 30);
    }

    return putJSON('/users/' + user.name + '/habits/' + habit.name + '/habitrecord', habitRecord);
  };
  retObj.reinforceHabit = reinforceHabit;

  return retObj;
})();

// module.exports = HR;
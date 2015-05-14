'use strict';
var HABRAB = (function() {

  var retObj = {};

  //Fetches habit list with AJAX and inserts into DOM
  var populateHabitList = function(username) {
    $.getJSON('/users/' + username)
      .success(function(user) {
        var habitList = $('#habitList'),
          parent = habitList.parent(),
          habitElement = habitList.find('tbody').children().first();
        habitList.detach();
        //Fill in and uncollapse the habit elements that were rendered server-side
        for (var habit in user.habits) {
          if (typeof habit !== 'function' && user.habits.hasOwnProperty(habit)) {
            habitElement.find('.habitName').text(habit);
            habitElement.removeClass('collapse');
            habitElement = habitElement.next();
          }
        }
        parent.append(habitList);
      });
  };
  retObj.populateHabitList = populateHabitList;

  // //Not sure how to factor this behavior yet, may be better to have this handled by something else...
  // var addHabit = function(user, habit) {
  //   //create a new habit object and store it in the database
  // };

  //Habit constructor, defines private variables via closure and returns a habit object with
  //public methods for accessing the private variables
  var newHabit = function(spec) {
    var self = {},
      spec = spec || {},
      user = spec.user, 
      name = spec.name || 'Unnamed Habit',
      frequency = spec.frequency || 1,
      period = spec.period || 'day',
      habitRecord = []; //An array that stores the number of times the habit was reincforced for the last min(record.length, 30) days

    var getHabitRecord = function() {
      return habitRecord;
    };
    self.getHabitRecord = getHabitRecord;

    var getName = function() {
      return name;
    };
    self.getName = getName;

    var getUser = function() {
      return user;
    };
    self.getUser = getUser;

    var getFrequency = function() {
      return frequency;
    };
    self.getFrequency = getFrequency;

    var getPeriod = function() {
      return period;
    };
    self.getPeriod = getPeriod;

    //Records how many times you reinforced a habit in a day
    var recordReinforcement = function(times, periodsAgo) {
      times = times || 1;
      periodsAgo = periodsAgo || 0;

      //Record the number of times reinforced for the proper day
      var index = habitRecord.length - periodsAgo - 1;
      while (index < 0) {
        habitRecord.unshift(0);
        index += 1;
      }
      habitRecord[index] = habitRecord[index] ? habitRecord[index] + times : times;

      //Truncate the habitRecord to the most recent 30 days
      if (habitRecord.length > 30) {
        habitRecord.splice(habitRecord.length - 30, 30);
      }
    };
    self.recordReinforcement = recordReinforcement;

    //Pushes current state to database via $.post
    var persistCurrentState = function() {
      if (!user) {
        throw new Error('Undefined User');
      }
      $.post('/users/' + user + '/habits/' + name, {habitRecord: habitRecord, frequency: frequency, period: period})
        .done(function(){
          populateHabitList(user);
        });
    };
    self.persistCurrentState = persistCurrentState;
    
    return self;
  };
  retObj.newHabit = newHabit;

  return retObj;
})();
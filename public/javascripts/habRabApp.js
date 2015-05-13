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
        for (habit in user.habits) {
          if (typeof habit !== 'function' && user.habits.hasOwnProperty(habit)) {
            habitElement.find('.habitName').text(habit);
            habitElement.removeClass('collapse');
            habitElement = habitElement.next();
          }
        }
        parent.append(habitList);
      });
  }
  retObj.populateHabitList = populateHabitList;

  //Not sure how to factor this behavior yet, may be better to have this handled by something else...
  var addHabit = function(user, habit) {
    //create a new habit object and store it in the database
  };

  //Habit constructor, defines private variables via closure and returns a habit object with
  //public methods for accessing the private variables
  var newHabit = function(spec) {
    var self = {},
      user = spec.user || 'Test User', //----CURRENTLY DEFAULTS TO TEST USER----
      name = spec.name || 'Test Habit', //----CURRENTLY DEFAULTS TO TEST HABIT----
      habitRecord = []; //An array that stores the number of times the habit was reincforced for the last min(record.length, 30) days

    var getHabitRecord = function() {
      return habitRecord;
    };
    self.getHabitRecord = getHabitRecord;

    //Records how many times you reinforced a habit in a day
    var recordReinforcement = function(times, daysAgo) {
      times = times || 1;
      daysAgo = daysAgo || 0;

      //Record the number of times reinforced for the proper day
      habitRecord[habitRecord.length - daysAgo] = times;

      //Truncate the habitRecord to the most recent 30 days
      if (habitRecord.length > 30) {
        habitRecord.splice(1,30);
      }
    }
    self.recordReinforcement = recordReinforcement;

    var persistCurrentState = function() {
      $.post('/users/' + user + '/habits/' + name, habitRecord)
        .done(function(data){
          populateHabitList(user);
        });
    }
    self.persistCurrentState = persistCurrentState;
    
    return self;
  }
  retObj.newHabit = newHabit;

  return retObj;
})();
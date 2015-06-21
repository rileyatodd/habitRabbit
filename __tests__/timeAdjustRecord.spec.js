jest.dontMock('moment')
jest.dontMock('../public/javascripts/habRabApp.js');

var moment = require('moment');
var HR = require('../public/javascripts/habRabApp.js');

describe('timeAdjustRecord', function() {
  var user,
    habit;

  beforeEach(function(){
    user = {
      name: 'name', 
      habits: [
        {
          name: 'habitName',
          period: 'day',
          habitRecord: [
            {
              times: 0,
              periodEnd: moment().endOf('day')
            }
          ]
        }
      ]
    };
    habit = user.habits[0];
  });

  it('should change nothing if the lastest period end is after the current time', function() {
    var oldHabit = habit;
    HR.timeAdjustRecord(user, habit);
    expect(user.habits.length).toBe(1);
    expect(oldHabit).toBe(habit);
  });

  it('should add a record to habitRecord if it is the next day', function() {
    habit.habitRecord[0].periodEnd.subtract(1, 'day');
    expect(habit.habitRecord[0].periodEnd.diff(moment())).toBeLessThan(0);
    HR.timeAdjustRecord(user, habit);
    expect(habit.habitRecord.length).toBe(2);
    expect(habit.habitRecord[0].periodEnd.diff(habit.habitRecord[1].periodEnd, 'day')).toBe(-1);
  });

  it('should add multiple records if multiple days have passed', function() {
    habit.habitRecord[0].periodEnd.subtract(4, 'day');
    HR.timeAdjustRecord(user, habit);
    expect(habit.habitRecord.length).toBe(5);
    expect(habit.habitRecord[0].periodEnd.diff(habit.habitRecord[4].periodEnd, 'day')).toBe(-4);
  });

});
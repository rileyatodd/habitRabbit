jest.dontMock('moment')
jest.dontMock('../public/javascripts/habRabApp.js');

var moment = require('moment');
var HR = require('../public/javascripts/habRabApp.js');

describe('reinforcing a habit', function(){
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

  it('should ')

});
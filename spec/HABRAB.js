'use strict';
describe('habit management', function(){
  var user;

  beforeEach(function(){
    jasmine.Ajax.install();
    user = {name: 'Test User', habits: []};
  });

  afterEach(function(){
    jasmine.Ajax.uninstall();
  });

  it('should be able to add habits', function(){
    var habit = {name:'Test Habit'};
    HABRAB.addHabit(user, habit);
    expect(user.habits[0]).toBe(habit);
  });
  
  it('should be able to delete habits', function(){
    var habit = {name:'Test Habit'};
    var habit2 = {name:'other tests'};
    HABRAB.addHabit(user, habit);
    HABRAB.addHabit(user, habit2);
    HABRAB.removeHabit(user, habit, $('.habit'));
    expect(user.habits).toEqual([habit2]);    
  });
});

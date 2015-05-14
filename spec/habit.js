describe('a habit object', function() {
  var blankHabit;

  beforeEach(function(){
    habit = HABRAB.newHabit({user:"Test User", name:"test habit", frequency: 1, period: 'day'});
  });

  it('should have a reasonable default name, user, record, frequency, and period', function() {
    habit = HABRAB.newHabit();
    expect(habit.getName()).toEqual('Unnamed Habit');
    expect(habit.getUser()).toBeUndefined();
    expect(habit.getHabitRecord()).toEqual([]);
    expect(habit.getFrequency()).toEqual(1);
    expect(habit.getPeriod()).toEqual('day');
  });

  it('should be able to record when it gets reinforced', function(){
    habit.recordReinforcement(2);
    expect(habit.getHabitRecord()).toEqual([2]);
    habit.recordReinforcement(1, 3);
    expect(habit.getHabitRecord()).toEqual([1,0,0,2]);
    habit.recordReinforcement(1,3);
    expect(habit.getHabitRecord()).toEqual([2,0,0,2]);
  });

  it('should be able to persist its state to the database', function() {

  });

  it('should throw and error if trying to persist with an undefined user', function() {
    habit = HABRAB.newHabit();
    expect(habit.persistCurrentState).toThrowError('Undefined User');
  });

});
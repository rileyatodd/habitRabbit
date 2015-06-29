var express = require('express'), 
  router = express.Router(),
  mongo = require('mongodb'),
  db = require('monk')('localhost/habitRabbitDb');

router.use('/', function(req, res, next){
  req.users = db.get('users');
  next();
});

router.param('username', function(req, res, next, username) {
  if (req.isAuthenticated() && req.user.name === username) {
    req.users.find({name: username})
      .success(function(docs) {
        req.user = docs[0];
        next();
      })
      .error(function(err) {
        console.log(err);
        next();
      });
  } else {
    res.redirect('/login');
  }
});

router.get('/:username', function(req, res, next) {
  res.json(req.user);
});

router.get('/:username/index', function(req, res, next) {
  res.render('habitIndex', req.user);
});

router.post('/:username/habits/:habitName', function(req, res, next) {
  req.users.update({name: req.params.username}, {$push: {habits: req.body}});
  res.status(200);
  res.send();
});

router.put('/:username/habits/:habitName', function(req, res, next) {
  req.users.update({name: req.params.username, 'habits.name': req.params.habitName},
                   {$set: {'habits.$': req.body}});
  res.status(200);
  res.send();
});

router.delete('/:username/habits/:habitName', function(req, res, next) {
  req.users.update({name: req.params.username}, {$pull: {habits: {name: req.params.habitName}}});
  res.status(200);
  res.send();
});

router.put('/:username/habits/:habitName/timestamps', function(req, res, next) {
  req.users.update({name: req.params.username, 'habits.name': req.params.habitName}, {$set: {'habits.$.timestamps': req.body}})
    .on('error', function(err) {console.log(err)})
    .on('success', function(doc) {console.log(doc)});
  res.status(200);
  res.send();
});

router.get('/:username/habits/:habitName/edit', function(req, res, next) {
  var habit = req.user.habits.filter(function(hab) {
    return hab.name === req.params.habitName;
  })[0];
  res.render('editHabit', habit);
});

module.exports = router;

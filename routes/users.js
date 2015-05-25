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
  console.log(req.body);
  req.users.update({name: req.params.username}, {$push: {habits: req.body}});
  res.status(200);
  res.send();
});

router.delete('/:username/habits/:habitName', function(req, res, next) {
  req.users.update({name: req.params.username}, {$pull: {habits: {name: req.params.habitName}}});
  res.status(200);
  res.send();
});

router.put('/:username/habits/:habitName/habitrecord', function(req, res, next) {
  req.users.update({name: req.params.username, 'habits.name': req.params.habitName}, {$set: {'habits.$.habitRecord': req.body}})
    .on('error', function(err) {console.log(err)})
    .on('success', function(doc) {console.log(doc)});
  res.status(200);
  res.send();
});

module.exports = router;

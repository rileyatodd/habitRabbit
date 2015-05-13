var express = require('express'), 
  router = express.Router(),
  mongo = require('mongodb'),
  db = require('monk')('localhost/habitRabbitDb');


router.use('/', function(req, res, next){
  req.users = db.get('users');
  next();
});

router.param('username', function(req, res, next, username) {
  req.users.find({name: username})
    .success(function(docs) {
      req.user = docs[0];
      next();
    })
    .error(function(err) {
      console.log(err);
      next();
    });
});

/* GET users listing. */
router.get('/:username', function(req, res, next) {
  res.json(req.user);
});

router.get('/:username/index', function(req, res, next) {
  res.render('userindex', req.user);
});

router.post('/:username/habits/:habitName', function(req, res, next) {
  var habit = req.body,
    setObject = {};
  setObject['habits.' + req.params.habitName] = habit;
  req.users.update({name: req.params.username}, {$set: setObject}, {upsert: true});
  res.status(200);
});

module.exports = router;

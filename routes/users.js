var express = require('express'), 
  router = express.Router(),
  mongo = require('mongodb'),
  db = require('monk')('localhost/habitRabbitDb');


/* GET users listing. */
router.get('/:username', function(req, res, next) {
  var users = db.get('users');
  users.find({name: req.params.username})
    .success(function(docs) {
      res.json(docs[0]);
    })
    .error(function(err) {
      console.log(err);
    })
});

module.exports = router;

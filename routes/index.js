var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/users/' + req.user.name + '/index')
  } else {
    res.render('index', {req: req});
  }  
});

router.get('/about', function(req, res, next) {
  res.render('about', {req: req});
});

router.get('/habit', function(req, res, next) {
  res.render('habit');
});

router.get('/habitReminder', function(req, res, next) {
  res.render('habitReminder');
});

module.exports = router;

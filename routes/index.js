var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/about', function(req, res, next) {
  res.render('about');
});

router.get('/habit', function(req, res, next) {
  res.render('habit');
});

router.get('/habitRecord', function(req, res, next) {
  res.render('habitRecord');
});

module.exports = router;

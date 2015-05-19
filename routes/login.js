'use strict';
var express = require('express'), 
  router = express.Router(),
  mongo = require('mongodb'),
  db = require('monk')('localhost/habitRabbitDb'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;



//Authentication setup
passport.use('local-signin', new LocalStrategy(
  function(username, password, done) {
    db.get('users').find({ name: username, password: password })
      .success(function(docs) {
        done(null, docs[0]);
      });
  }
));

passport.use('local-signup', new LocalStrategy(
  function(username, password, done) {
    db.get('users').find({name: username})
      .success(function(docs){
        if (docs.length === 0) {
          db.get('users').insert({name: username, password: password, habits: []});
        }
      });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.name);
});

passport.deserializeUser(function(username, done) {
  db.get('users').find({name: username})
    .success(function(docs) {
      done(null, docs[0]);
    });
});

router.use('/', passport.initialize());
router.use('/', passport.session());

router.post('/login', 
  passport.authenticate('local-signin', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/users/' + req.user.name + '/index');
  });

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post('/signup', function(req, res, next) {
  passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
  });
});

router.get('/signup', function(req, res, next) {
  res.render('signup');
});

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/login');
});

module.exports = router;
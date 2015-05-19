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
    console.log(username, password);
    db.get('users').find({name: username})
      .success(function(docs){
        if (docs.length === 0) {
          var user = {name: username, password: password, habits: []};
          db.get('users').insert(user)
            .success(function(){
              done(null, user);
            });
        } else {
          done(new Error('User already exists'));
        }
      })
      .error(function(err){
        console.log(err);
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

router.post('/signup',
  passport.authenticate('local-signup', {failureRedirect: '/signup', failureFlash: true}),
  function(req, res) {
    res.redirect('/users/' + req.user.name + '/index');
  });

router.get('/signup', function(req, res, next) {
  res.render('signup');
});

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/login');
});

module.exports = router;
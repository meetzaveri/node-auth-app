var express = require('express');
var router = express.Router();
var User = require('../models/user');

function requiresLogin(req, res, next) {
    if (req.session && req.session.userId) {
      return next();
    } else {
      var err = new Error('You must be logged in to view this page.');
      err.status = 401;
      return next(err);
    }
}

// GET route
router.get('/', function(req, res, next){
    res.sendFile(path.join(__dirname + '/templateLogReg/index.html'));
});

// POST route
router.post('/register', function(req, res, next){

    if(req.body.password !== req.body.passwordConf){
        var err = new Error('Passwords don\'t match');
        err.status = 400;
        res.send("Passwords don't match");
        return next(err);
    }

    if (req.body.email &&
        req.body.username &&
        req.body.password &&
        req.body.passwordConf) {
        var userData = {
          email: req.body.email,
          username: req.body.username,
          password: req.body.password,
          passwordConf: req.body.passwordConf,
        }
        //use schema.create to insert data into the db
        User.create(userData, function (err, user) {
          if (err) {
            return next(err)
          } else {
            return res.redirect('/profile');
          }
        });
      } else {
            var err = new Error('All fields required.');
            err.status = 400;
            return next(err);
      }
});

// POST route for login
router.post('/', function(req, res, next){
    if (req.body.logemail && req.body.logpassword) {
        User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
          if (error || !user) {
            var err = new Error('Wrong email or password.');
            err.status = 401;
            return next(err);
          } else {
            req.session.userId = user._id;
            return res.redirect('/profile');
          }
        });
    }
    else {
        
    }
});

// GET route after registering
router.get('/profile', function (req, res, next) {
    User.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          if (user === null) {
            var err = new Error('Not authorized! Go back!');
            err.status = 400;
            return next(err);
          } else {
            return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
          }
        }
      });
  });

// GET for logout logout
router.get('/logout', function (req, res, next) {
    if (req.session) {
      // delete session object
      req.session.destroy(function (err) {
        if (err) {
          return next(err);
        } else {
          return res.redirect('/');
        }
      });
    }
  });

  module.exports = router;
  
  
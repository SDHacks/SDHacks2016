(function() {
  'use strict';
  // Module Dependencies
  require('coffee-script');
  require('coffee-script/register');

  var express = require('express');
  var http = require('http');
  var path = require('path');
  var favicon = require('serve-favicon');
  var logger = require('morgan');
  var bodyParser = require('body-parser');
  var methodOverride = require('method-override');
  var static_dir = require('serve-static');
  var errorHandler = require('errorhandler');
  var crypto = require('crypto');
  var cluster = require('cluster');
  var cookieParser = require('cookie-parser');
  var session = require('express-session');
  var MongoStore = require('connect-mongo')(session);
  var timeout = require('connect-timeout');
  var flash = require('connect-flash');
  var device = require('express-device');

  // The application
  var cpuCount, cpuNum, i = void 0;
  if (cluster.isMaster) {
    cpuCount = require("os").cpus().length;
    i = 0;
    while (i < cpuCount) {
      cluster.fork();
      i += 1;
    }
  } else {

    var app = express();
    var port = process.env.PORT || 3000;
    var server = app.listen(port);

    // env Loading
    if (process.env.NODE_ENV === 'development') {
      require('dotenv').config();
    }

    // Extras
    // Passport Logic
    var passport = require('passport'), 
        OAuth2Strategy = require('passport-oauth2').Strategy;
    var User = require('./entities/users/model');
    require('./extras/passport')(passport, OAuth2Strategy, User, process.env);

    // all environments
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    app.use(favicon(path.join(__dirname, 'static/assets/img/favicon.png')));
    app.use(logger('dev'));
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
    app.use(device.capture());
    app.use(bodyParser.urlencoded({extended: true}));

    app.use(session({
        secret: process.env.SESSION_SECRET,
        cookie: { maxAge: 24 * 60 * 60, expires: null },
        saveUninitialized: true,
        resave: true,
        store: new MongoStore({url: process.env.MONGODB_URI})
      }));

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    app.use(methodOverride('X-HTTP-Method-Override'));
    require('./extras/middleware')(app);
    app.use(static_dir(path.join(__dirname, 'static')));
    var appRoutes = require('./routes/index')(app, passport);
    app.get('/ng-partials/:name', function (req, res) {
      var name = req.params.name;
      res.render('partials/angular/' + name);
    });
    app.get('*', function(req, res){
      res.render('ng-layout');
    });


    // Error Handling
    // Development only
    if ('development' == app.get('env')) {
      app.use(errorHandler());
    } else {
      // 404
      app.use(function(req, res) {
       res.status(404).send("404: Not Found");
      });

      // 500
      app.use(function(err, req, res, next) {
       res.status(500).send(err, "500: Server Error");
      });
    }

    http.createServer(app).listen(app.get(port), function(){
      cpuNum = parseInt(cluster.worker.id);
      cpuNum = cpuNum.toString();
      console.log('Express server listening on port ' + port + ', cpu:worker:' + cpuNum);
    });
  }

  cluster.on('exit', function (worker) {
      cpuNum = parseInt(worker.id);
      cpuNum = cpuNum.toString();
      console.log('cpu:worker:' + cpuNum + ' died unexpectedly, respawning...');
      cluster.fork();
  });
}).call(this);
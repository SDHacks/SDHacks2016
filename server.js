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
  var throng = require('throng');
  var cookieParser = require('cookie-parser');
  var LocalStrategy = require('passport-local').Strategy;
  var jwt = require('express-jwt');
  var timeout = require('connect-timeout');
  var flash = require('connect-flash');
  var device = require('express-device');
  var mailer = require('nodemailer');
  var EmailTemplate = require('email-templates').EmailTemplate;
  var sslRedirect = require('heroku-ssl-redirect');

  require('dotenv').config({silent: process.env.NODE_ENV !== 'development'});

  var WORKERS = process.env.WEB_CONCURRENCY || 1;
  //Create workers on all the threads
  throng({
    workers: WORKERS,
    lifetime: Infinity
  }, start);

  // The application
  function start() {
    var app = express();
    var port = process.env.PORT || 3000;
    var server = app.listen(port);

    app.use(sslRedirect());

    // Extras
    // Rendering tools
    app.locals.moment = require('moment');

    // Passport Logic
    var passport = require('passport');
    var User = require('./entities/users/model');
    require('./extras/passport')(passport, LocalStrategy, User, process.env);

    // Node mailer
    var transporter = mailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });
    var confirmSender = transporter.templateSender(new EmailTemplate('./views/emails/confirmation'), {
      from: {
        name: 'SD Hacks 2016',
        address: process.env.MAIL_USER
      }
    });

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

    app.use(passport.initialize());
    app.use(flash());
    app.use(methodOverride('X-HTTP-Method-Override'));
    require('./extras/middleware')(app);
    app.use(static_dir(path.join(__dirname, 'static')));
    var appRoutes = require('./routes/index')(app, process.env, User);
    var apiRoutes = require('./routes/api')(app, User, confirmSender);
    app.get('*', function(req, res){
      res.render('layout');
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
      console.log('Express server listening on port ' + port + ' on ' + WORKERS + ' worker(s)');
    });
  }
}).call(this);
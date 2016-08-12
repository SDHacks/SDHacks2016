module.exports = (app, config) ->
  generatePassword = require 'password-generator'
  bcrypt = require 'bcrypt'

  # Model and Config
  Sponsor = require('./model')
  User = require('../users/model')

  passwordLength = 16
  saltRounds = 10

  auth = (req, res, next) ->
    unauthorized = (res) ->
      res.set 'WWW-Authenticate', 'Basic realm=Authorization Required'
      return res.sendStatus 401

    user = require('basic-auth')(req)

    return unauthorized res if (!user || !user.name || !user.pass)
    return next() if (user.name == config.ADMIN_USER && user.pass == config.ADMIN_PASS)
    return unauthorized res

  sponsorAuth = (req, res, next) ->
    unauthorized = (res) ->
      res.set 'WWW-Authenticate', 'Basic realm=Sponsor Authentication Required'
      return res.sendStatus 401

    user = require('basic-auth')(req)

    return unauthorized res if (!user or !user.name or !user.pass or user.name != req.params.username)
    Sponsor.findOne {'login.username': user.name}, (err, sponsor) ->
      return unauthorized res if err or !sponsor?

      bcrypt.compare user.pass, sponsor.login.password, (err, res) ->
        return unauthorized res if err or !res
        return next()

  # Index

  # Admin
  app.get '/sponsors/admin', auth, (req, res, next) ->
    #TODO Secure this endpoint
    Sponsor.find({deleted: {$ne: true}}).sort({createdAt: -1}).exec (err, sponsors) ->
      res.render "entity_views/sponsors/admin.jade", {sponsors: sponsors}

  # Create
  app.post '/sponsors/create', auth, (req, res) ->
    if !req.body.companyName? or !req.body.login?
      res.status 400
      return res.json {'error': true}

    newSponsor = new Sponsor {companyName: req.body.companyName}
    generatedPw = generatePassword(passwordLength, false) #Make a new non-memorable password

    bcrypt.hash generatedPw, saltRounds, (err, hash) ->
      if err or !hash?
        res.status 400
        return res.json {'error': true}

      username = req.body.login.toLowerCase().replace /\s+/g, ''
      newSponsor.login = {
        username: username,
        password: hash
      }
      newSponsor.save (err, sponsor) ->
        if err
          res.status 400
          return res.json {'error': true}

        return res.json {'sponsor': sponsor, 'password': generatedPw}


  app.get '/sponsors/applicants', (req, res) ->
    # Select the fields necessary for sorting and searching
    User.find({deleted: {$ne: true}, confirmed: true, shareResume: true}, 'university major year travel.outOfState').exec (err, users) ->
      if err or !users?
        res.status 401
        return res.json {'error': true}

      res.json users

  # Show
  app.get '/sponsors/:username', sponsorAuth, (req, res) ->
    Sponsor.findOne {'login.username': req.params.username}, (e, sponsor) ->
      if e or !sponsor?
        return res.redirect '/'

      res.render "entity_views/sponsors/show.jade", {sponsor: sponsor}


  # New

  # Destroy
  app.get '/sponsors/:id/delete', auth, (req, res) ->
    Sponsor.findById(req.params.id, (e, sponsor) ->
      if e
        res.status 401
        res.json {'error': 'Sponsor not found'}
      sponsor.softdelete (err, newSponsor) ->
        newSponsor.save()
        res.json {'success': true}
    )

  # Edit
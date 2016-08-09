module.exports = (app, config) ->
  moniker = require 'moniker'
  generatePassword = require 'password-generator'

  # Model and Config
  Sponsor = require('./model')

  passwordLength = 16

  auth = (req, res, next) ->
    unauthorized = (res) ->
      res.set 'WWW-Authenticate', 'Basic realm=Authorization Required'
      return res.sendStatus 401

    user = require('basic-auth')(req)

    return unauthorized res if (!user || !user.name || !user.pass)
    return next() if (user.name == config.ADMIN_USER && user.pass == config.ADMIN_PASS)
    return unauthorized res

  # Index

  # Admin
  app.get "/sponsors/admin", auth, (req, res, next) ->
    #TODO Secure this endpoint
    Sponsor.find({deleted: {$ne: true}}).sort({createdAt: -1}).exec (err, sponsors) ->
      res.render("entity_views/sponsors/admin.jade", {sponsors: sponsors})

  # Show
  app.get '/sponsors/:id', (req, res) ->
    

  # New


  # Create
  app.post '/sponsors/create', auth, (req, res) ->
    console.log req.body
    if not req.body.companyName?
      res.status 400
      return res.json {'error': true}

    newSponsor = new Sponsor {companyName: req.body.companyName}
    generatedPw = generatePassword(passwordLength)

    newSponsor.login = {
      username: moniker.choose(),
      password: generatedPw
    }
    newSponsor.save (err, sponsor) ->
      if err
        res.status 400
        console.error err
        return res.json {'error': true}

      return res.json sponsor

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
# App Routes
module.exports = (app, config) ->
  User = require('../entities/users/model')
  
  auth = require('express-jwt') {secret: config.USER_SECRET, userProperty: 'payload'}

  # Basic
  app.get '/', (req, res) ->
    res.render 'home.jade'

  # Actual confirmation (link for people who just got selected)
  app.get '/accepted', (req, res) ->
    res.render 'accepted.jade'

  # Email confirm
  app.get '/confirm/:id', (req, res) ->
    # Confirm the email
    User.update({'_id': req.params.id}, {confirmed: true}, (err, user) ->
      if err
        res.status 500
        return res.render 'error.jade', {error: 'User does not exist'}

      # Redirect to the profile
      res.redirect('/users/' + req.params.id) 
    )

  loadLivePage = (req, res) ->
    menu = { 
      'index': {
        'name': 'Updates', 
        'url': '/live'
      },
      'api': {
        'name': 'APIs',
        'url': '/live/api'
      },
      'hardware': {
        'name': 'Hardware',
        'url': '//hardware.mlh.io/',
        'target': '_blank'
      },
      'prizes': {
        'name': 'Prizes',
        'url': '/live/prizes'
      },
      'schedule': {
        'name': 'Schedule',
        'url': '/live/schedule'
      },
      'slack': {
        'name': 'Slack',
        'url': '//slack.sdhacks.io',
        'target': '_blank'
      },
      'devpost': {
        'name': 'Devpost',
        'url': '#',
        'target': '_blank'
      }
    }
    res.render 'live/' + req.params.page + '.jade', {page: req.params.page, menu: menu}

  # Live site (index)
  app.get '/live', (req, res) ->
    req.params.page = 'index'
    loadLivePage req, res

  # Live site (other pages)
  app.get '/live/:page', loadLivePage
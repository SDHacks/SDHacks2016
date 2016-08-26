# App Routes
module.exports = (app, config) ->
  User = require('../entities/users/model')
  
  auth = require('express-jwt') {secret: config.USER_SECRET, userProperty: 'payload'}

  # Basic
  app.get '/', (req, res) ->
    res.render 'home.jade'

  mentorRedirect = (req, res) ->
    res.redirect 'http://bit.ly/SDHacks2016Volunteer'

  app.get '/volunteer', mentorRedirect
  app.get '/mentor', mentorRedirect

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
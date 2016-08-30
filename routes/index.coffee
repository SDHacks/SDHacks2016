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

  # So far have just added this between here
  giveRedirect = (req, res) ->
    res.redirect 'https://crowdsurf.ucsd.edu/project/2780'

  app.get '/give', giveRedirect
  # And here

  # Issue is when you go to sdhacks.io/give from a blank/incognito window it redirects
  # to sdhacks.io. But THEN afterwards from sdhacks.io go to /give then it works.
  # Can't seem to reproduce this locally cosistently.

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
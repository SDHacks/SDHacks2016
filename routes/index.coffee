# App Routes
module.exports = (app, config, User) ->
  auth = require('express-jwt') {secret: config.USER_SECRET, userProperty: 'payload'}

  # Basic
  app.get '/', (req, res) ->
    res.render 'home.jade'

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
# App Routes

module.exports = (app, passport) ->

  # Basic
  app.get '/', (req, res) ->
    res.render("home.jade")

  # Passport Auth
  app.get '/login', passport.authenticate('oauth2')

  app.get '/logout', (req, res) ->
    req.logout()
    req.flash('passport-success-logout', 'Logged out successfully!')
    res.redirect '/'

  app.get '/auth/callback/', passport.authenticate('oauth2', {failureRedirect: '/'}), (req, res) ->
    res.redirect '/'

  # Imports
  require('../entities/users/controller')(app)

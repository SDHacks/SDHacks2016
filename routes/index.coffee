# App Routes

module.exports = (app, passport) ->

  isAuthenticated = (req, res, next) ->
    if req.user
      return next()
    res.redirect '/'

  # Basic
  app.get '/', (req, res) ->
    res.render("home.jade")

  # User Profile and Settings
  app.get '/profile', (req, res) ->
    res.render("profile.jade")

  # Passport Auth
  app.get '/login', passport.authenticate('oauth2')

  app.get '/logout', (req, res) ->
    req.logout()
    req.flash('passport-success-logout', 'Logged out successfully!')
    res.redirect '/'

  app.get '/auth/callback/', passport.authenticate('oauth2', {
    successRedirect: '/profile',
    failureRedirect: '/'
  }), (req, res) ->
    res.redirect '/'

  # Imports
  require('../entities/users/controller')(app)

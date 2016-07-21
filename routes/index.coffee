# App Routes
module.exports = (app, config) ->
  auth = require('express-jwt') {secret: config.USER_SECRET, userProperty: 'payload'}

  # Basic
  app.get '/', (req, res) ->
    res.render("home.jade")

  # Imports
  require('../entities/users/controller')(app)

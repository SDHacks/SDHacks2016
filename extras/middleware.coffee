# Your own middleware goes here...

express = require('express')

module.exports = (app) ->
  app.use((req, res, next) ->
    if req.user?
      res.locals.user = {
        id: req.user._id,
        name: req.user.name
      }
    else
      res.locals.user = null
    next())

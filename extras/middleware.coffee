# Your own middleware goes here...

express = require('express')

module.exports = (app) ->
  app.use((req, res, next) ->
    if req.user?
      res.locals.current_user = req.user["username"]
    else
      res.locals.current_user = 'guest'
    next())

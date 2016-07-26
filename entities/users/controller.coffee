module.exports = (app) ->

  # Model and Config
  User = require('./model')
  # Index


  # Show
  app.get '/users/:id', (req, res) ->
    User.findById(req.params.id, (e, user) ->
      if e
        res.redirect '/'
      res.render 'entity_views/users/show', {user: user}
    )

  # New


  # Create


  # Edit


  # Update


  # Destroy


  # Admin

  app.get "/users/admin", (req, res, next) ->
    #TODO Secure this endpoint
    User.find().exec (err, users) ->
      return next(err)  if err
      res.render("entity_views/users/admin.jade", {users: users})

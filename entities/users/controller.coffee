module.exports = (app) ->

  # Model and Config
  User = require('./model')
  # Index


  # Show
  app.get '/users/:id', (req, res) ->
    User.findById(req.params.id, (e, user) ->
      if e or user is null
        res.redirect '/'
      res.render 'entity_views/users/show', {user: user}
    )

  # New


  # Create


  # Edit
  app.post '/users/:id/edit', (req, res) ->
    User.findById(req.params.id, (e, user) ->
      if e or user is null
        res.status 400
        return res.json {'error': 'User not found'}
      if !req.body.id
        res.status 500
        return res.json {'error': 'Something went wrong in the request'}
      
      # Make rules for certain fields
      # Teammates
      if req.body.id == 'teammates'
        req.body.value = req.body.value.replace /\s/g, ''
        req.body.value = req.body.value.split ','

      if req.body.id == 'travel'
        user.travel.outOfState = true if req.body.value != 'San Diego'
        user.travel.city = req.body.value
      else
        user[req.body.id] = req.body.value        

      user.save (err) ->
        if err
          res.status 500
          console.err 'Error editing user data'
          console.err err
          return res.json {'error': 'Something went wrong in the database'}

        res.send req.body.value
    )

  # Update


  # Destroy


  # Admin

  app.get "/users/admin", (req, res, next) ->
    #TODO Secure this endpoint
    User.find().exec (err, users) ->
      return next(err)  if err
      res.render("entity_views/users/admin.jade", {users: users})

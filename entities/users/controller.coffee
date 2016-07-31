module.exports = (app, config) ->

  # Model and Config
  User = require('./model')
  # Index

  # Admin

  basicAuth = require('basic-auth')
  auth = (req, res, next) ->
    unauthorized = (res) ->
      res.set 'WWW-Authenticate', 'Basic realm=Authorization Required'
      return res.send 401

    user = basicAuth(req)

    return unauthorized res if (!user || !user.name || !user.pass)
    return next() if (user.name == config.ADMIN_USER && user.pass == config.ADMIN_PASS)
    return unauthorized res

  app.get "/users/admin", auth, (req, res, next) ->
    #TODO Secure this endpoint
    User.find (err, users) ->
      res.render("entity_views/users/admin.jade", {users: users})

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
    trackEdit = (user, field, from, to) ->
      console.log('/users/edit: User "' + user.firstName + ' ' + user.lastName + 
        '" changed field "' + field + ' from "' + 
        from + '" to "' + to + '"')
    User.findById(req.params.id, (e, user) ->
      if e or user is null
        res.status 400
        return res.json {'error': 'User not found'}
      if !req.body.id
        res.status 500
        return res.json {'error': 'Something went wrong in the request'}
      
      # Make rules for certain fields
      originalValue = req.body.value
      # Teammates
      if req.body.id == 'teammates'
        req.body.value = req.body.value.replace /\s/g, ''
        req.body.value = req.body.value.split ','

      if req.body.id == 'travel'
        user.travel.outOfState = (req.body.value != 'San Diego')
        trackEdit(user, 'city', user.travel.city, req.body.value)
        user.travel.city = req.body.value
      else
        trackEdit(user, req.body.id, user[req.body.id], req.body.value)
        user[req.body.id] = req.body.value        

      user.save (err) ->
        if err
          res.status 500
          console.err 'Error editing user data'
          console.err err
          return res.json {'error': 'Something went wrong in the database'}

        res.send originalValue
    )

  # Update


  # Destroy

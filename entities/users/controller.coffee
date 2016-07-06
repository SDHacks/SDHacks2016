module.exports = (app) ->

  # Model & YAML Loading
  User = require('./model')
  URLSafeBase64 = require('urlsafe-base64');
  # Index


  # Show
  app.get '/profile/:secret', (req, res) ->
    db = req.db;
    User.find({"id": req.params["secret"]},{}, (e, docs) ->
      res.json(docs);
    );

  # New


  # Create
  app.post '/register', (req, res) ->
    db = req.db;
    newUser = new User({
      id: URLSafeBase64.encode(req.body.email.toString() + req.body.firstname.toString() + Math.random().toString(36)),
      email: req.body.email,
      name: req.body.firstname,
    });
    newUser.save();
    res.send(newUser.id)

  # Edit


  # Update


  # Destroy


  # Admin

  app.get "/users/admin", (req, res, next) ->
    if req.user? and req.user.is_admin is true
      User.find().exec (err, users) ->
        return next(err)  if err
        res.render("entity_views/users/admin.jade", {users: users})
    else
      res.render('login.jade')

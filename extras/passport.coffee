# PassportJS

module.exports = (passport, OAuth2Strategy, User, settings) ->
  passport.serializeUser (user, done) ->
    done null, user._id

  passport.deserializeUser (id, done) ->
    User.findById id, (err, user) ->
      done err, user

  passport.use new OAuth2Strategy({
      authorizationURL: 'https://my.mlh.io/oauth/authorize',
      tokenURL: 'https://my.mlh.io/oauth/token',
      clientID: settings.MLH_CLIENT_ID,
      clientSecret: settings.MLH_CLIENT_SECRET,
      callbackURL: settings.MLH_CALLBACK
    }, (accessToken, refreshToken, profile, cb) ->
      # Make an API call to get user data
      request = require 'request'
      request 'https://my.mlh.io/api/v1/user?access_token=' + accessToken, (err, res, body) ->
        mlhUser = JSON.parse body
        mlhUser = mlhUser.data

        newUser = {
          id: mlhUser.id,
          email: mlhUser.email,
          name: mlhUser.first_name + " " + mlhUser.last_name,
          accessToken: accessToken
        }
        User.findOneAndUpdate {id: newUser.id}, newUser, {upsert: true}, cb
  )

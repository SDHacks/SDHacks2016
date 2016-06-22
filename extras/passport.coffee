# PassportJS

module.exports = (passport, OAuth2Strategy, User, settings) ->

  passport.serializeUser (user, done) ->
    done null, user.id
    return
  passport.deserializeUser (id, done) ->
    User.findById id, (err, user) ->
      done err, user
      return
    return

  passport.use new OAuth2Strategy({
    authorizationURL: 'https://my.mlh.io/oauth/authorize',
    tokenURL: 'https://my.mlh.io/oauth/token',
    clientID: settings.MLH_CLIENT_ID,
    clientSecret: settings.MLH_CLIENT_SECRET,
    callbackURL: settings.MLH_CALLBACK
  }, (accessToken, refreshToken, profile, cb) ->
    User.findOrCreate({exampleId: profile.id}, (err, user) ->
      cb err, user
    )
  )

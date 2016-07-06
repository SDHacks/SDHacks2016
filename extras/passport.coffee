# PassportJS

module.exports = (passport, LocalStrategy, User, settings) ->
  passport.use new LocalStrategy({usernameField: '_id'}, 
    (username, password, done) -> 
      User.findOne {_id: username}, (err, user) ->
        return done(err) if err;
        return done(null, false, {message: 'User not found'}) if !user
        done(null, user)
  )
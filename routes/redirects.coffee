# Redirect Routes
module.exports = (app) ->
  mentorRedirect = (req, res) ->
    res.redirect 'http://bit.ly/SDHacks2016Volunteer'

  app.get '/volunteer', mentorRedirect
  app.get '/mentor', mentorRedirect
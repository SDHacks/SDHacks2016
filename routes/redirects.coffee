# Redirect Routes
module.exports = (app) ->
  mentorRedirect = (req, res) ->
    res.redirect 'http://bit.ly/SDHacks2016Volunteer'

  expoRedirect = (req, res) ->
    res.redirect 'http://expo.sdhacks.io'

  expoRedirect = (req, res) ->
    res.redirect 'http://tables.sdhacks.io'

  app.get '/volunteer', mentorRedirect
  app.get '/mentor', mentorRedirect
  app.get '/expo', expoRedirect
  app.get '/tables', tablesRedirect

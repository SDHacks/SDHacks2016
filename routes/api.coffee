#Api Routes

module.exports = (app, passport, User) ->
  app.post '/api/register', (req, res) ->
    console.log req.body
    user = new User

    #TODO
    #Form validation

    user.firstName = req.body.firstName
    user.lastName = req.body.lastName
    user.birthdate = req.body.birthdate
    user.gender = req.body.gender
    user.email = req.body.email
    user.phone = req.body.phone
    user.university = req.body.university
    user.major = req.body.major
    user.year = req.body.year
    user.github = req.body.github
    user.website = req.body.website
    #TODO: Resume
    user.diet = req.body.diet
    user.shirtSize = req.body.shirtSize
    user.travel = req.body.travel
    user.hackathons = req.body.hackathons
    user.outcomeStmt = req.body.outcomeStmt
    user.referred = req.body.referred

    user.save (err) ->
      token = user.generateJwt()
      res.status 200
      res.json {'token': token}
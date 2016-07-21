#Api Routes
multer = require('multer')
upload = multer({dest: 'public/uploads/', limits: {fileSize: 5 * 1024 * 1024}}) #5MB file size

module.exports = (app, User, sendConfirm) ->
  app.post '/api/register', upload.single('resume'), (req, res) =>
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
    user.diet = req.body.diet
    user.shirtSize = req.body.shirtSize
    user.travel = req.body.travel
    user.hackathons = req.body.hackathons
    user.outcomeStmt = req.body.outcomeStmt
    user.referred = req.body.referred

    userError = () =>
      res.status 500
      res.json {'error': true}

    saveUser = (error) =>
      if error
        #Throw an error
        console.error 'Failed to upload resume: ' + error
        return userError()
      
      user.save (err) ->
        if err
          return userError()

        sendConfirm {
          to: user.email,
          subject: 'SD Hacks 2016'
        }, {'user': user}, 
        (err, info) ->
          if err
            return userError()

          res.status 200
          res.json {'token': user.generateJwt()}

    if req.file
      user.attach 'resume', {path: req.file.path}, saveUser
    else
      saveUser null
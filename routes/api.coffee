#Api Routes
multer = require('multer')
crypto = require('crypto')
mime = require('mime')

storage = multer.diskStorage {
  dest: 'public/uploads/',
  filename: (req, file, cb) ->
    crypto.pseudoRandomBytes 16, (err, raw) ->
      cb null, raw.toString('hex') + '.' + mime.extension(file.mimetype);
}
upload = multer({
  storage: storage,
  #5MB file size
  limits: { fileSize: 5 * 1024 * 1024 }
}) 

module.exports = (app, User, sendConfirm) ->
  app.post '/api/register', upload.single('resume'), (req, res) =>
    user = new User

    #TODO
    #Form validation

    req.body.phone = req.body.phone.replace /\D/g, ''

    User.count {email: req.body.email}, (err, count) ->
      if count > 0
        res.status 400
        return res.json {'error': 'This email has already been used'}

      user.firstName = req.body.firstName
      user.lastName = req.body.lastName
      user.birthdate = req.body.birthdate_year + "-" + req.body.birthdate_month + "-" + req.body.birthdate_day + "T00:00:00.000Z" # Timezone agnostic
      user.gender = req.body.gender
      user.email = req.body.email
      user.phone = req.body.phone
      user.university = req.body.university
      user.major = req.body.major
      user.year = req.body.year
      user.github = req.body.github
      user.website = req.body.website
      user.shareResume = req.body.shareResume
      user.diet = req.body.diet
      user.shirtSize = req.body.shirtFit + req.body.shirtSize
      user.travel = {
        outOfState: req.body.outOfState,
        city: req.body.city
      }
      user.firstHackathon = req.body.firstHackathon
      user.outcomeStmt = req.body.outcomeStmt
      user.teammates = []
      
      user.teammates.push(req.body.team1) if req.body.team1
      user.teammates.push(req.body.team2) if req.body.team2
      user.teammates.push(req.body.team3) if req.body.team3

      userError = (errorMessage, code = 500) =>
        res.status code
        res.json {'error': errorMessage}

      saveUser = (error) =>
        if error
          #Throw an error
          console.error 'Failed to upload resume: ' + error
          return userError 'Failed to upload resume'
        
        user.save (err) ->
          if err
            if err.name == 'ValidationError'
              for field of err.errors
                return userError err.errors[field].message, 400
            return userError 'Failed due to database error'

          sendConfirm {
            to: user.email,
            subject: 'SD Hacks 2016'
          }, {
            'user': user,
            'confirmUrl': req.protocol + '://' + req.get('host') + '/confirm/' + user._id
          }, 
          (err, info) ->
            if err
              return userError 'Failed to send email confirmation'

            res.status 200
            res.json {'success': true}

      if req.file
        user.attach 'resume', {path: req.file.path}, saveUser
      else
        saveUser null

#Api Routes
multer = require('multer')
crypto = require('crypto')
mime = require('mime')
EmailTemplate = require('email-templates').EmailTemplate

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

module.exports = (app, config, transporter) ->
  User = require('../entities/users/model')

  confirmSender = transporter.templateSender new EmailTemplate('./views/emails/confirmation'), {
      from: {
        name: 'SD Hacks Team',
        address: process.env.MAIL_USER
      }
    }

  referSender = transporter.templateSender new EmailTemplate('./views/emails/refer'), {
      from: {
        name: 'SD Hacks Team',
        address: process.env.MAIL_USER
      }
    }

  referTeammates = (user, req) ->
    # Queue up the referall emails
    for referral in user.teammates
      do (referral) ->
        User.count {email: referral}, (err, c) ->
          if err is null and c < 1
            referSender {
              to: referral,
              subject: user.firstName + '\'s invitation to SD Hacks 2016'
            }, {
              'user': user,
              'referUrl': req.protocol + '://' + req.get('host')
            }

  app.post '/api/upload', upload.single('resume'), (req, res) =>
    userError = () ->
      res.status 400
      res.json {'error': true}

    if not req.body.user_id or not req.file
      return userError()

    User.findById req.body.user_id, (e, user) =>
      if e or user is null
        return userError()

      user.attach 'resume', {path: req.file.path}, (error) ->
        if error
          console.error error
          console.error 'Failed to upload new user resume'
          userError()

        user.save()
        res.json {'url': user.resume.url}

  app.post '/api/register', upload.single('resume'), (req, res) =>
    user = new User

    #TODO
    #Form validation

    req.body.phone = req.body.phone.replace /\D/g, ''
    if req.body.phone.length != 10
      res.status 400
      return res.json {'error': 'Your phone number must be exactly 10 digits'}

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
      user.majors = [req.body.major]
      user.year = req.body.year
      user.github = req.body.github
      user.website = req.body.website
      user.shareResume = req.body.shareResume
      user.food = req.body.food
      user.diet = req.body.diet
      user.shirtSize = req.body.shirtFit + req.body.shirtSize
      user.travel = {
        outOfState: req.body.outOfState,
        city: req.body.city
      }
      user.firstHackathon = req.body.firstHackathon
      user.outcomeStmt = req.body.outcomeStmt
      user.teammates = []
      
      user.teammates.push(req.body.team1.toLowerCase()) if req.body.team1
      user.teammates.push(req.body.team2.toLowerCase()) if req.body.team2
      user.teammates.push(req.body.team3.toLowerCase()) if req.body.team3

      userError = (errorMessage, code = 500) =>
        res.status code
        res.json {'error': errorMessage}

      saveUser = (error) =>
        if error
          #Throw an error
          console.error 'Failed to upload resume'
          console.log error
          return userError 'Failed to upload resume'
        
        user.save (err) ->
          if err
            if err.name == 'ValidationError'
              for field of err.errors
                return userError err.errors[field].message, 400
            return userError 'Failed due to database error'

          confirmSender {
            to: user.email,
            subject: 'Thank you for your application!'
          }, {
            'user': user,
            'confirmUrl': req.protocol + '://' + req.get('host') + '/confirm/' + user._id
          }, 
          (err, info) ->
            if err
              return userError 'Failed to send email confirmation'

            res.status 200
            res.json {'email': user.email}

            referTeammates user, req

      if req.file
        user.attach 'resume', {path: req.file.path}, saveUser
      else
        saveUser null

  # Imports
  require('../entities/users/controller')(app, config, referTeammates)
  require('../entities/sponsors/controller')(app, config)
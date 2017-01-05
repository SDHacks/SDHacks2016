module.exports = (app, config) ->
  generatePassword = require 'password-generator'
  bcrypt = require 'bcrypt'
  moment = require 'moment'
  path = require 'path'
  uuid = require 'node-uuid'
  s3Archiver = require 's3-archiver'
  fs = require 'fs'
  csv = require 'fast-csv'

  zipper = new s3Archiver {
    accessKeyId: config.S3_KEY,
    secretAccessKey: config.S3_SECRET,
    region: "us-west-1",
    bucket: config.S3_BUCKET
  }, {
    folder: "resumes",
    filePrefix: "resumes/"
  }

  # Model and Config
  Sponsor = require('./model')
  User = require('../users/model')

  passwordLength = 16
  saltRounds = 10

  exportApplicantInfo = (users, archive, finalize) ->
    csvStream = csv.format {headers: true}

    fileName = __dirname + "/" + process.hrtime()[1] + ".csv"
    #Create a new CSV with the timestamp to store the user information
    writableStream = fs.createWriteStream fileName
    csvStream.pipe writableStream

    csvStream.write({
      firstName: user.firstName,
      lastName: user.lastName,
      graduationYear: user.year,
      university: user.university,
      gender: user.gender,
      status: user.status,
      website: user.website,
      github: user.github,
      resumeFile: user.resume.name,
      resumeLink: user.resume.url
    }) for user in users

    #Wait until the CSV file is written
    writableStream.on "finish", () ->
      console.log "Wrote user CSV file";

      #Append file to the zip
      archive.append fs.createReadStream(fileName), {name: "applicants.csv"}

      #Finish the process
      finalize()
      fs.unlink(fileName);

    csvStream.end()

  auth = (req, res, next) ->
    unauthorized = (res) ->
      res.set 'WWW-Authenticate', 'Basic realm=Authorization Required'
      return res.sendStatus 401

    user = require('basic-auth')(req)

    return unauthorized res if (!user || !user.name || !user.pass)
    return next() if (user.name == config.ADMIN_USER && user.pass == config.ADMIN_PASS)
    return unauthorized res

  sponsorAuth = (req, res, next) ->
    unauthorized = (res) ->
      res.set 'WWW-Authenticate', 'Basic realm=Sponsor Authentication Required'
      return res.sendStatus 401

    user = require('basic-auth')(req)

    return unauthorized res if (!user or !user.name or !user.pass)
    req.params.username = user.name #Store the sponsor name in params

    Sponsor.findOne {'login.username': user.name, deleted: {$ne: true}}, (err, sponsor) ->
      return unauthorized res if err or !sponsor?

      bcrypt.compare user.pass, sponsor.login.password, (err, result) ->
        return unauthorized res if err or !result
        req.sponsor = sponsor
        return next()

  # Index

  # Show
  app.get '/sponsors', sponsorAuth, (req, res) ->
    Sponsor.findOne {'login.username': req.params.username}, (e, sponsor) ->
      if e or !sponsor?
        return res.redirect '/'

      res.render "entity_views/sponsors/show.jade", {sponsor: sponsor}

  # Admin
  app.get '/sponsors/admin', auth, (req, res, next) ->
    Sponsor.find({deleted: {$ne: true}}).sort({createdAt: -1}).exec (err, sponsors) ->
      res.render "entity_views/sponsors/admin.jade", {sponsors: sponsors}

  # Create
  app.post '/sponsors/create', auth, (req, res) ->
    if !req.body.companyName? or !req.body.login?
      res.status 400
      return res.json {'error': true}

    newSponsor = new Sponsor {companyName: req.body.companyName}
    generatedPw = generatePassword(passwordLength, false) #Make a new non-memorable password

    bcrypt.hash generatedPw, saltRounds, (err, hash) ->
      if err or !hash?
        res.status 400
        return res.json {'error': true}

      username = req.body.login.toLowerCase().replace /\s+/g, ''
      newSponsor.login = {
        username: username,
        password: hash
      }
      newSponsor.save (err, sponsor) ->
        if err
          res.status 400
          return res.json {'error': true}

        return res.json {'sponsor': sponsor, 'password': generatedPw}


  app.get '/sponsors/applicants', sponsorAuth, (req, res) ->
    # Get the most recent date for sanitized users
    sanitizedDate = config.RESUME_SANITIZED
    # Select the fields necessary for sorting and searching
    User.find(
      {
        deleted: {$ne: true}, 
        confirmed: true, 
        shareResume: true, 
        categories: {$exists: true},
        resume: {$exists: true}, 
        'resume.size': {$gt: 0}, 
        createdAt: {$lte: sanitizedDate},
        checkedIn: true
      }, 'university categories year gender status').exec (err, users) ->
      if err or !users?
        res.status 401
        return res.json {'error': true}

      res.json users

  app.post '/sponsors/applicants/download', sponsorAuth, (req, res) ->
    # Get the list of applicant IDs
    User.find({ _id: {$in: req.body.applicants} }).exec (err, users) ->
      return res.json {'error': true} if err or users.length == 0

      # Create a list of file names to filter by
      fileNames = users.filter (user) ->
        # Ensure a resume has been uploaded
        return user.resume? and user.resume.name?

      .map (user) ->
        # Map the names of the resumes
        'resumes/' + user.resume.name

      fileName = req.params.username + "-" + moment().format("YYYYMMDDHHmmss") + "-" + generatePassword(12, false, /[\dA-F]/) + ".zip"

      downloadId = uuid.v1()
      res.json {'zipping': downloadId}
      console.log "Zipping started for ", fileNames.length, "files"

      zipper.localConfig.finalizing = (archive, finalize) ->
        exportApplicantInfo(users, archive, finalize)

      zipper.zipFiles  fileNames, 'downloads/' + fileName, {
        ACL: "public-read"
      }, (err, result) ->
        download = {download_id: downloadId}
        if err
          console.error err
          download.error = true
        else
          download.url = result.Location
        req.sponsor.downloads.push download
        req.sponsor.save()

  app.get '/sponsors/download/:id', sponsorAuth, (req, res) ->
    download = req.sponsor.downloads.filter((download) ->
      return download.download_id == req.params.id
    ).pop()
    return res.json {'error': true} if download is undefined
    res.json {url: download.url}

  # New

  # Destroy
  app.get '/sponsors/:id/delete', auth, (req, res) ->
    Sponsor.findById(req.params.id, (e, sponsor) ->
      if e
        res.status 401
        res.json {'error': 'Sponsor not found'}
      sponsor.softdelete (err, newSponsor) ->
        newSponsor.save()
        res.json {'success': true}
    )

  # Edit
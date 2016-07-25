mongoose = require('mongoose')
findOrCreate = require('mongoose-findorcreate')
timestamps = require('mongoose-timestamp')
crate = require('mongoose-crate')
S3 = require('mongoose-crate-s3')
jwt = require('jsonwebtoken')

require('dotenv').config();
Schema = mongoose.Schema
db = mongoose.createConnection(process.env.MONGODB_URI)

UsersSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "You must have a first name"]
  },
  lastName: {
    type: String,
    required: [true, "You must have a last name"]
  },
  birthdate: {
    type: Date,
    required: [true, "You must have a birthdate"]
  },
  gender: {
    type: String,
    required: [true, "You must have a gender"]
  },
  email: {
    type: String,
    required: [true, "You must have an email"]
  },
  phone: {
    type: Number,
    required: [true, "You must have a phone number"]
  },
  university: {
    type: String,
    required: [true, "You must have a university"]
  },
  major: {
    type: String,
    required: [true, "You must have a major"]
  },
  year: {
    type: Number,
    required: [true, "You must have a school year"]
  },
  github: {
    type: String,
    required: false,
  },
  website: {
    type: String,
    required: false,
  },
  shareResume: {
    type: Boolean,
    default: false
  },
  diet: {
    type: String,
  },
  shirtSize: {
    type: String,
    required: [true, "You must have a first name"]
  },
  travel: {
    outOfState: {
      type: Boolean,
      default: false
    },
    county: {
      type: String
    }
  },
  firstHackathon: Boolean,
  outcomeStmt: String, #What they hope their outcome of the hackathon will be
  referred: [String], #The emails of the people they referred
  confirmed: {type: Boolean, default: false}
})

UsersSchema.plugin(findOrCreate)
UsersSchema.plugin(timestamps)
UsersSchema.plugin(crate, {
  storage: new S3({
    key: process.env.S3_KEY,
    secret: process.env.S3_SECRET,
    bucket: process.env.S3_BUCKET,
    acl: 'public-read',
    region: 'us-west-1',
    path: (attachment) ->
      '/' + attachment.name
  }),
  fields: {
    resume: {}
  }
})

UsersSchema.methods.generateJwt = () ->
  expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign({
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    birthdate: this.birthdate,
    gender: this.gender,
    email: this.email,
    phone: this.phone,
    university: this.university,
    major: this.major,
    year: this.year,
    github: this.github,
    website: this.website,
    diet: this.diet,
    shirtSize: this.shirtSize,
    travel: this.travel,
    hackathons: this.hackathons,
    outcomeStmt: this.outcomeStmt,
    referred: this.referred,
    exp: parseInt(expiry.getTime() / 1000),
  }, process.env.USER_SECRET);

module.exports = db.model('User', UsersSchema)
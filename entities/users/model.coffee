mongoose = require('mongoose')
findOrCreate = require('mongoose-findorcreate')
timestamps = require('mongoose-timestamp')
crate = require('mongoose-crate')
S3 = require('mongoose-crate-s3')
jwt = require('jsonwebtoken')
softDelete = require('mongoose-softdelete')

require('dotenv').config();
Schema = mongoose.Schema
db = mongoose.createConnection(process.env.MONGODB_URI)

UsersSchema = new Schema({
  firstName: {
    type: String,
    trim: true,
    required: [true, "You must have a first name"]
  },
  lastName: {
    type: String,
    trim: true,
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
    required: [true, "You must have an email"],
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "You must use a valid email"]
  },
  phone: {
    type: Number,
    required: [true, "You must have a phone number"]
  },
  university: {
    type: String,
    trim: true,
    required: [true, "You must have a university"]
  },
  major: {
    type: String,
    trim: true,
    required: [true, "You must have a major"]
  },
  year: {
    type: Number,
    required: [true, "You must have a graduation year"],
    min: [2016, "You would have already graduated"],
    max: [2030, "You are graduating too late"]
  },
  github: {
    type: String,
    trim: true,
    required: false,
  },
  website: {
    type: String,
    trim: true,
    required: false,
  },
  shareResume: {
    type: Boolean,
    default: false
  },
  diet: {
    type: String,
    trim: true,
  },
  shirtSize: {
    type: String,
    required: [true, "You must have a shirt size"]
  },
  travel: {
    outOfState: {
      type: Boolean,
      default: false
    },
    city: {
      type: String
    }
  },
  firstHackathon: Boolean,
  outcomeStmt: String, #What they hope their outcome of the hackathon will be
  teammates: [String],
  confirmed: {type: Boolean, default: false}
})

UsersSchema.plugin(findOrCreate)
UsersSchema.plugin(timestamps)
UsersSchema.plugin(softDelete)
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
    shareResume: this.shareResume,
    diet: this.diet,
    shirtSize: this.shirtSize,
    travel: this.travel,
    hackathons: this.hackathons,
    outcomeStmt: this.outcomeStmt,
    teammates: this.teammates,
    exp: parseInt(expiry.getTime() / 1000),
  }, process.env.USER_SECRET);

module.exports = db.model('User', UsersSchema)
mongoose = require('mongoose')
findOrCreate = require('mongoose-findorcreate')
timestamps = require('mongoose-timestamp')
jwt = require('jsonwebtoken')

require('dotenv').config();
Schema = mongoose.Schema
db = mongoose.createConnection(process.env.MONGODB_URI)

UsersSchema = new Schema({
  firstName: String,
  lastName: String,
  birthdate: Date,
  gender: String,
  email: String,
  phone: Number,
  university: String,
  major: String,
  year: Number,
  github: String,
  website: String,
  #TODO: Resume
  diet: String,
  shirtSize: String,
  travel: {
    outOfState: Boolean,
    county: String
  },
  hackathons: [String],
  outcomeStmt: String,
  referred: [String]
})

UsersSchema.plugin(findOrCreate)
UsersSchema.plugin(timestamps)

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
    #TODO: Resume
    diet: this.diet,
    shirtSize: this.shirtSize,
    travel: this.travel,
    hackathons: this.hackathons,
    outcomeStmt: this.outcomeStmt,
    referred: this.referred,
    exp: parseInt(expiry.getTime() / 1000),
  }, process.env.USER_SECRET);

module.exports = db.model('User', UsersSchema)
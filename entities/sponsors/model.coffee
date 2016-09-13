mongoose = require('mongoose')
timestamps = require('mongoose-timestamp')
softDelete = require('mongoose-softdelete')

require('dotenv').config();
Schema = mongoose.Schema
db = mongoose.createConnection(process.env.MONGODB_URI)

SponsorsSchema = new Schema({
  companyName: {
    type: String,
    trim: true,
    required: [true, "You must have a company name"]
  },
  login: {
    username: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      required: [true, "You must have a username"]
    },
    password: {
      type: String,
      trim: true,
      required: [true, "You must have a password"]
    }
  },
  downloads: [{
    download_id: {
      type: String,
      trim: true,
      required: [true, "You must have an associated ID"]
    },
    url: {
      type: String,
      trim: true,
      required: false
    },
    error: {
      type: Boolean,
      required: false
    }
  }]
})

SponsorsSchema.plugin(require('mongoose-sanitizer'))
SponsorsSchema.plugin(timestamps)
SponsorsSchema.plugin(softDelete)

module.exports = db.model('Sponsor', SponsorsSchema)
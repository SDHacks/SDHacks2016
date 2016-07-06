mongoose = require('mongoose')
findOrCreate = require('mongoose-findorcreate')
timestamps = require('mongoose-timestamp')

require('dotenv').config();
Schema = mongoose.Schema
db = mongoose.createConnection(process.env.MONGODB_URI)

UsersSchema = new Schema({
  id: String,
  email: String,
  name: String
})

UsersSchema.plugin(findOrCreate)
UsersSchema.plugin(timestamps)
module.exports = db.model('User', UsersSchema)

mongoose = require('mongoose')

require('dotenv').config();
Schema = mongoose.Schema
db = mongoose.createConnection(process.env.MONGODB_URI)

UsersSchema = new Schema({
  username: String,
  password: String,
  is_admin: Boolean
})

module.exports = db.model('User', UsersSchema)

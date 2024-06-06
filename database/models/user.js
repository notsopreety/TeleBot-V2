const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  userID: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  first_name: {
    type: String,
    trim: true,
  },
  last_name: {
    type: String,
    trim: true,
  },
  banned: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;

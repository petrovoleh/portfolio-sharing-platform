const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  about: { type: String, default: 'description is not specified yet' },
  contacts: { type: String, default: 'contacts are not specified yet' },
  avatar: { type: String, default: 'empty.jpg' },
  type: { type: String, default: 'user' },
});

const User = mongoose.model('User', userSchema);

module.exports = User;

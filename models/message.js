const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chat_id: { type: String, required: true },
  user_id: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: Date, required: true },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;

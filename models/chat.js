const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user1_id: { type: String, required: true },
  user2_id: { type: String, required: true },
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;

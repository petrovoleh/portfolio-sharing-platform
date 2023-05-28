const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  image: { type: String, required: true },
  text: { type: String, required: true },
  link: { type: String },
  time: { type: Date, required: true },
});
const Post = mongoose.model('Post', postSchema);

module.exports = Post;

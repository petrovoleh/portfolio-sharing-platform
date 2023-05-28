const mongoose = require('mongoose');

async function connectToDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/portfolioDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
  }
}


const User = require('./user');
const Chat = require('./chat');
const Message = require('./message');
const Post = require('./post');

// Create indexes
async function createIndexes() {
  try {
    await User.createIndexes();
    await Chat.createIndexes();
    await Message.createIndexes();
    await Post.createIndexes();
    console.log('Indexes created successfully');
  } catch (err) {
    console.error('Failed to create indexes:', err);
  }
}



module.exports = { connectToDatabase, createIndexes };
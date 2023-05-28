const mongoose = require('mongoose');
const { create } = require('xmlbuilder2');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolioDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
  .then(() => {
    console.log('Connected to MongoDB');
    generateXML();
  })
  .catch(err => console.error('Failed to connect to MongoDB:', err));


// Database schema and model
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
  
  const chatSchema = new mongoose.Schema({
    user1_id: { type: String, required: true },
    user2_id: { type: String, required: true },
  });
  
  const messageSchema = new mongoose.Schema({
    chat_id: { type: String, required: true },
    user_id: { type: String, required: true },
    text: { type: String, required: true },
    time: { type: Date, required: true },
  });
  
  const postSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    image: { type: String, required: true },
    text: { type: String, required: true },
    link: { type: String },
    time: { type: Date, required: true },
  });
  
  const User = mongoose.model('User', userSchema);
  const Chat = mongoose.model('Chat', chatSchema);
  const Message = mongoose.model('Message', messageSchema);
  const Post = mongoose.model('Post', postSchema);
  
async function generateXML() {
  try {
    // Retrieve data from the tables
    const users = await User.find().lean();
    const chats = await Chat.find().lean();
    const messages = await Message.find().lean();
    const posts = await Post.find().lean();

    // Create XML document
    const xml = create({ version: '1.0' }).ele('data');

    // Add users to XML
    const usersElement = xml.ele('users');
    for (const user of users) {
        const userElement = usersElement.ele('user');
      
        userElement.ele('name').txt(user.name);
        userElement.ele('email').txt(user.email);
        userElement.ele('phone').txt(user.phone);
        userElement.ele('password').txt(user.password);
        userElement.ele('about').txt(user.about);
        userElement.ele('contacts').txt(user.contacts);
        userElement.ele('avatar').txt(user.avatar);
        userElement.ele('type').txt(user.type);
      }

    // Add chats to XML
    const chatsElement = xml.ele('chats');
    for (const chat of chats) {
        const chatElement = chatsElement.ele('chat');
        chatElement.ele('user1_id').txt(chat.user1_id);
        chatElement.ele('user2_id').txt(chat.user2_id);
    }

// Add messages to XML
const messagesElement = xml.ele('messages');
for (const message of messages) {
  const messageElement = messagesElement.ele('message');
  messageElement.ele('chat_id').txt(message.chat_id);
  messageElement.ele('user_id').txt(message.user_id);
  messageElement.ele('text').txt(message.text);
  messageElement.ele('time').txt(message.time.toISOString());
}

// Add posts to XML
const postsElement = xml.ele('posts');
for (const post of posts) {
  const postElement = postsElement.ele('post');
  postElement.ele('user_id').txt(post.user_id);
  postElement.ele('image').txt(post.image);
  postElement.ele('text').txt(post.text);
  if (post.link) {
    postElement.ele('link').txt(post.link);
  }
  postElement.ele('time').txt(post.time.toISOString());
}

    // Convert XML document to string
    const xmlString = xml.end({ prettyPrint: true });

    // Save XML to file
    const fs = require('fs');
    fs.writeFileSync('data.xml', xmlString, 'utf-8');

    console.log('XML file generated successfully.');
  } catch (error) {
    console.error('Failed to generate XML file:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
  }
}

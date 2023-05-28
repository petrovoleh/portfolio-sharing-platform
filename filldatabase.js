// Import required modules
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const fs = require('fs');
const axios = require('axios');


// Database connection
mongoose.connect('mongodb://localhost:27017/portfolioDB', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
  .then(() => {
    console.log('Connected to MongoDB');
    createIndexes();
    generateData();
  })
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// Database schema and model (assuming they are already defined)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true},
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  about: { type: String, default: 'description is not specified yet' },
  contacts: { type: String, default: 'contacts are not specified yet' },
  avatar: { type: String, default: 'empty.jpg' },
  type: { type: String, default: 'user' },
});
const chatSchema = new mongoose.Schema({
  user1_id: { type: String, required: true},
  user2_id: { type: String, required: true},
});
const messageSchema = new mongoose.Schema({
  chat_id: { type: String, required: true},
  user_id: { type: String, required: true},
  text:  { type: String, required: true},
  time: { type: Date, required: true},
});
const postSchema = new mongoose.Schema({
  user_id: { type: String, required: true},
  image:  { type: String, required: true},
  text:  { type: String, required: true},
  link:  { type: String},
  time: { type: Date, required: true},
});
const User = mongoose.model('User', userSchema);
const Chat = mongoose.model('Chat', chatSchema);
const Message = mongoose.model('Message', messageSchema);
const Post = mongoose.model('Post', postSchema);
// Create indexes
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

async function downloadImage(url,uniqueSuffix) {
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(fs.createWriteStream('public/images/'+uniqueSuffix));
  console.log('Image downloaded!');
}

// Generate data
async function generateData() {
  try {
    // Generate 10 users
    const users = [];
    for (let i = 0; i < 10; i++) {
      const password = faker.internet.password();
       const hashedPassword = await bcrypt.hash(password, 10);
       const email = faker.internet.email();
      const user = new User({
        name: faker.person.fullName(),
        email: email,
        phone: faker.phone.number(),
        password: hashedPassword,
        about: faker.lorem.sentence(),
        contacts: faker.lorem.sentence(),
        avatar: 'empty.jpg'
      });
      console.log(`Login: ${email} ${password}`);
      users.push(await user.save());
    }
    // Generate 10 posts for each user
    for (let user of users) {
  for (let i = 0; i < 10; i++) {
    image = faker.image.url();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+'.jpg';
    downloadImage(image,uniqueSuffix);
    const post = new Post({
      user_id: user._id,
      image: uniqueSuffix,
      text: faker.lorem.paragraph(),
      link: faker.internet.url(),
      time: faker.date.recent()
    });
    const savedPost = await post.save();
  }
}

    // Generate 10 chats with random users
    const chats = [];
    for (let i = 0; i < 10; i++) {
      const user1 = getRandomUser(users);
      const user2 = getRandomUser(users, user1);
      const chat = new Chat({
        user1_id: user1._id,
        user2_id: user2._id
      });
      chats.push(await chat.save());
      const messages = [];
      // Generate 20 messages for each chat
      for (let i = 0; i < 20; i++) {
        const user = i % 2 === 0 ? user1._id : user2._id;
        const message = new Message({
          chat_id: chat._id,
          user_id: user._id,
          text: faker.lorem.sentence(),
          time: faker.date.recent()
        });
        messages.push(await message.save());
      }
    }
  

   
    console.log('Data generated successfully');
  } catch (err) {
    console.error('Failed to generate data:', err);
  }
}

// Helper function to get a random user
function getRandomUser(users, excludeUser = null) {
  const filteredUsers = users.filter(user => user !== excludeUser);
  const randomIndex = Math.floor(Math.random() * filteredUsers.length);
  return filteredUsers[randomIndex];
}

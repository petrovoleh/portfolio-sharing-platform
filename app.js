const express = require('express');
const bodyParser = require('body-parser');
const engine = require('ejs-locals');
const session = require('express-session');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const { PORT = 3000, SECRET } = process.env;

// Middleware
app.set('view engine', 'ejs');
app.engine('ejs', engine);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: false,
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Database connection and indexing
const { connectToDatabase, createIndexes } = require('./models/database');
connectToDatabase();
createIndexes();

// Routes
const routes = [
  require('./routes/registerRoute'),
  require('./routes/loginRoute'),
  require('./routes/uploadRoute'),
  require('./routes/postRoute'),
  require('./routes/profileRoutes'),
  require('./routes/deleteAccountRoute'),
  require('./routes/deleteChatRoute'),
  require('./routes/deleteMessageRoute'),
  require('./routes/chatRoute'),
  require('./routes/searchRoute'),
  require('./routes/homeRoute')
];

const router = express.Router();
routes.forEach(route => router.use(route));

app.use(router);

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port: http://localhost:${PORT}`);
});

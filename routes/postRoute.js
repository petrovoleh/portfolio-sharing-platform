const express = require('express');
const router = express.Router();
const multer = require('multer');
const Post = require('../models/post');

// File upload configuration
const storage = multer.diskStorage({
  destination: 'public/images/',
  filename: (req, file, cb) => {
    const originalExtension = require('path').extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = file.fieldname + '-' + uniqueSuffix + originalExtension;
    cb(null, fileName);
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});
router.post('/addpost', upload.single('image'), (req, res, next) => {
  if (!req.file) {
    return res.render('addpost', {
      session: req.session,
      error: 'Please select an image for the post.'
    });
  }

  const { text, link } = req.body;
  const imageFileName = req.file.filename;
  const userId = req.session.user._id;
  const time = new Date();

  // Validate text length
  if (text.length < 6 || text.length > 300) {
    return res.render('addpost', {
      session: req.session,
      error: 'Text should be between 6 and 300 characters long.'
    });
  }

  const newPost = new Post({
    user_id: userId,
    image: imageFileName,
    text: text,
    link: link,
    time: time,
  });

  newPost.save((err, savedPost) => {
    if (err) {
      console.error('Failed to save post:', err);
      return res.render('addpost', {
        session: req.session,
        error: 'Failed to create the post.'
      });
    }

    res.redirect('/myaccount');
  });
});

router.post('/deletepost', (req, res) => {
  const { id } = req.body;

  // Find the user in the database based on the email
  Post.findOne({ _id: id }, (err, user) => {
    if (err) {
      console.error(err);
      return res.render('errorpage', { session: req.session, errorcode: "Error finding post" });
    }

    // Delete the user from the database
    Post.deleteOne({ _id: id }, (err) => {
      if (err) {
        console.error(err);
        return res.render('errorpage', { session: req.session, errorcode: "Error deleting post" });
      }
      // Redirect to the home page or any other appropriate page
      res.redirect("/admin/posts");
    });
  });
});
router.get('/admin/posts', (req, res) => {
  if (req.session.isLoggedIn !== true || req.session.user.type !== "admin") {
    res.redirect('/');
  }
  Post.find({}, '_id text image', (err, posts) => {
    if (err) {
      console.error('Failed to fetch usernames and avatars:', err);
      return res.status(500).send('Failed to fetch usernames and avatars.');
    }


    // Render the usernames view and pass the usernames data
    res.render('allposts', {
      session: req.session,
      posts: posts
    });
  });
});

module.exports = router;
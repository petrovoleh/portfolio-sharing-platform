const express = require('express');
const router = express.Router();
const validator = require('validator');
const User = require('../models/user');
const Post = require('../models/post');

router.get('/portfolios', (req, res) => {
    User.find({}, '_id name avatar about', (err, users) => {
      if (err) {
        console.error('Failed to fetch usernames and avatars:', err);
        return res.status(500).send('Failed to fetch usernames and avatars.');
      }
  
      // Extract the usernames from the users array
      const usernames = users.map(user => user.name);
  
      // Render the usernames view and pass the usernames data
      res.render('portfolios', {
        session: req.session,
        users: users
      });
    });
  });

router.post('/saveeditprofile', (req, res) => {
    const { about, contacts, name } = req.body;
    const userEmail = req.session.user.email;

    // Validate about
    if (!validator.isLength(about, { max: 200 })) {
        return res.redirect('/myaccount?status=About+must+be+shorter+than+200+characters');
    }

    // Validate contacts
    if (!validator.isLength(contacts, { max: 200 })) {
        return res.redirect('/myaccount?status=Contacts+must+be+shorter+than+200+characters');
    }

    // Validate name
    if (!validator.isLength(name, { min: 6, max: 30 })) {
        return res.redirect('/myaccount?status=Name+must+be+longer+than+6+and+shorter+than+30+characters.');
    }

    User.findOneAndUpdate(
        { email: userEmail },
        { $set: { about, contacts, name } },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                return res.redirect('/myaccount?status=Error+updating+user+profile.');
            }

            req.session.user = updatedUser;
            return res.redirect('/myaccount?status=User+profile+updated+successfully.');
        }
    );
});



router.get('/editprofile', function (req, res) {
    res.render('editprofile', {
        session: req.session
    });
});

router.get('/addpost', (req, res) => {
    res.render('addpost', { session: req.session, error: null });
});


router.get('/myaccount', function (req, res) {
    const status = req.query.status || "";
    if (req.session.isLoggedIn === true) {
        Post.find({ user_id: req.session.user._id }, (err, posts) => {
            if (err) {
                console.error('Failed to fetch posts:', err);
                return res.render('myaccount', {
                    session: req.session,
                    status: 'Failed to fetch posts.'
                });
            }

            res.render('myaccount', {
                session: req.session,
                status: status,
                posts: posts
            });
        });
    } else {
        res.redirect('/signin');
    }
});

router.get('/user/:id', (req, res) => {
    const { id } = req.params;
    // Find the user in the database based on the username
    User.findOne({ _id: id }, (err, user) => {
      if (err) {
        console.error(err);
        return res.render('errorpage', { session: req.session, errorcode: "Internal Server Error" });
      }
  
      if (!user) {
        // User not found in the database
        // Handle the situation appropriately (e.g., render a "User not found" page)
        return res.render('errorpage', { session: req.session, errorcode: "User " + id + " not found" });
      }
      Post.find({ user_id: id }, (err, posts) => {
        if (err) {
          console.error('Failed to fetch posts:', err);
          return res.render('myaccount', {
            session: req.session,
            status: 'Failed to fetch posts.'
          });
        }
        res.render('user', { session: req.session, user: user, posts: posts });
      });
    });
  });

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.post('/deleteaccount', (req, res) => {
  const id = req.session.user._id;

  // Find the user in the database based on the email
  User.findOne({ _id: id }, (err, user) => {
    if (err) {
      console.error(err);
      return res.redirect('/myaccount?status=Error+finding+user.');
    }

    // Delete the user from the database
    User.deleteOne({ _id: id }, (err) => {
      if (err) {
        console.error(err);
        return res.redirect('/myaccount?status=Error+deleting+user.');
      }

      // Logout the user
      req.session.isLoggedIn = false;
      req.session.user = null;

      // Redirect to the home page or any other appropriate page
      res.redirect("/");
    });
  });
});

router.post('/deleteuser', (req, res) => {
  const { id } = req.body;

  // Find the user in the database based on the email
  User.findOne({ _id: id }, (err, user) => {
    if (err) {
      console.error(err);
      return res.render('errorpage', { session: req.session, errorcode: "Error finding user." });
    }

    // Delete the user from the database
    User.deleteOne({ _id: id }, (err) => {
      if (err) {
        console.error(err);
        return res.render('errorpage', { session: req.session, errorcode: "Error deleting user." });
      }
      // Redirect to the home page or any other appropriate page
      res.redirect("/portfolios");
    });
  });
});
module.exports = router;
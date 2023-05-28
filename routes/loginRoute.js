const express = require('express');
const router = express.Router();
const validator = require('validator');
const bcrypt = require('bcrypt');
const User = require('../models/user');


router.get('/signin', function (req, res) {
    res.render('signin', {
      session: req.session,
      loginstatus: ""
    });
  });

router.post('/login', async (req, res) => {
  const { login, password } = req.body;

  // Validate email or phone
  if (!validator.isEmail(login) && !validator.isMobilePhone(login)) {
    res.render("signin", { session: req.session, loginstatus: "Invalid email or phone number" });
    return;
  }

  try {
    const user = await User.findOne({ $or: [{ phone: login }, { email: login }] });
    if (!user) {
      res.render("signin", { session: req.session, loginstatus: "User not found" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.render("signin", { session: req.session, loginstatus: "Invalid password" });
      return;
    }

    req.session.isLoggedIn = true;
    req.session.user = user;
    res.redirect('/myaccount');
  } catch (err) {
    res.render("signin", { session: req.session, loginstatus: "Error"+ err });
  }
});

router.get('/logout', (req, res) => {
    // Clear the session data
    req.session.isLoggedIn = false;
    req.session.user = null;
  
    // Redirect to the home page
    res.redirect('/');
});

module.exports = router;

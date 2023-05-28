const express = require('express');
const router = express.Router();
const validator = require('validator');
const bcrypt = require('bcrypt');
const User = require('../models/user');


router.get('/signup', function (req, res) {
    res.render('signup', {
      session: req.session,
      loginstatus: ""
    });
  });

router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Validate name
  if (!validator.isLength(name, { min: 6 }, { max: 30 })) {
    res.render("signup", { session: req.session, loginstatus: "Name must be longer than 6 and shorter than 30 symbols." });
    return;
  }

  // Validate email
  if (!validator.isEmail(email)) {
    res.render("signup", { session: req.session, loginstatus: "Invalid email" });
    return;
  }

  // Validate phone
  if (!validator.isMobilePhone(phone)) {
    res.render("signup", { session: req.session, loginstatus: "Invalid phone number" });
    return;
  }

  // Validate password
  if (!validator.isLength(password, { min: 6 })) {
    res.render("signup", { session: req.session, loginstatus: "Password should be longer than 6 symbols" });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, phone, password: hashedPassword });
    await newUser.save();
    req.session.isLoggedIn = true;
    req.session.user = newUser;
    res.render("signup", { session: req.session, loginstatus: "User account created successfully" });
  } catch (err) {
    console.error(err);
    res.render("signup", { session: req.session, loginstatus: "Error creating user account" });
  }
});

module.exports = router;

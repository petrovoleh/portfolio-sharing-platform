const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');

router.post('/deletechat', (req, res) => {
  if (req.session.isLoggedIn !== true) {
    return res.redirect('/');
  }
  const { _id } = req.body;

  // Delete the message with the given _id
  Chat.deleteOne({ _id: _id }, (err) => {
    if (err) {
      console.error(err);
      return res.render('chat', { session: req.session, errorcode: "Internal Server Error" });
    }
    // Message deleted successfully
    return res.redirect('back');
  });
});

  
module.exports = router;
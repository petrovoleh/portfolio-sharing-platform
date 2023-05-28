const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/user');

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
router.post('/upload', (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer error occurred (e.g., file too large)
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.redirect('/myaccount?status=File+size+should+be+less+then+2MB.');
        }
        // Handle other Multer errors if needed
      } else if (err) {
        // Other errors occurred during upload
        console.error('Failed to upload file:', err);
        return res.status(500).send('Failed to upload file.');
      }
  
      // No error, continue with the logic
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }
  
      // Access the uploaded file through req.file
      console.log('Uploaded file:', req.file);
  
      // Update the user's avatar field with the file name
      const avatarFileName = req.file.filename;
      const userEmail = req.session.user.email;
  
      User.findOneAndUpdate(
        { email: userEmail },
        { avatar: avatarFileName },
        { new: true },
        (err, updatedUser) => {
          if (err) {
            console.error('Failed to update user avatar:', err);
            return res.redirect('/myaccount?status=Failed+to+update+user+avatar.');
          }
  
          // Update the user data in the session
          req.session.user = updatedUser;
          return res.redirect('/myaccount?status=File+uploaded+and+user+avatar+updated+successfully.');
        }
      );
    });
});

module.exports = router;
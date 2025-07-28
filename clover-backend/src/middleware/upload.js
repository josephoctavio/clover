// src/middleware/upload.js

const multer  = require('multer');
const path    = require('path');

// Storage engine: store in /uploads/profilePics with filename = <userId><ext>
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(
      null,
      path.join(__dirname, '../../uploads/profilePics')
    );
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // use user ID plus timestamp to avoid collisions
    const filename = `${req.user.id}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// File filter: only allow JPEG or PNG images
const fileFilter = (req, file, cb) => {
  const mimetype = file.mimetype.toLowerCase();
  if (mimetype === 'image/jpeg' || mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024  // 2 MB
  }
});

module.exports = upload;

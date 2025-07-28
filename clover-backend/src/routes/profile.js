// src/routes/profile.js

const express         = require('express');
const router          = express.Router();

const upload          = require('../middleware/upload');
const ensureAuth      = require('../middleware/authMiddleware');

const {
  updateAvatar,
  getMyProfile,
  updateProfileData,
  getPublicProfile,
  getUserSnippets,
  getUserFavorites
} = require('../controllers/profileController');

// — AVATAR UPLOAD —  
router.post(
  '/me/profile-pic',
  ensureAuth,
  upload.single('profilePic'),
  updateAvatar
);

// — CURRENT USER —  
router.get('/me', ensureAuth, getMyProfile);
router.put('/me', ensureAuth, updateProfileData);

// — PUBLIC PROFILE & CONTENT —  
router.get('/:username', getPublicProfile);
router.get('/:username/snippets', getUserSnippets);
router.get('/:username/favorites', ensureAuth, getUserFavorites);

module.exports = router;

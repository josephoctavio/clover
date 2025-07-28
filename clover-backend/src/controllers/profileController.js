// src/controllers/profileController.js

const path    = require('path');
const User    = require('../../models/User');
const Snippet = require('../models/Snippet');    // ← make sure this path is correct

// POST /api/profile/me/profile-pic
exports.updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const url = `${req.protocol}://${req.get('host')}/uploads/profilePics/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: url },
      { new: true, select: 'profilePic' }
    );
    res.json({ profilePic: user.profilePic });
  } catch (err) {
    next(err);
  }
};

// GET /api/profile/me
exports.getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -tokens -__v');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// PUT /api/profile/me
 exports.updateProfileData = async (req, res, next) => {
   try {
     // allow changing username now, plus bio and other profile fields
     const allowed = ['username','bio','socialLinks','location','birthday'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f] });

    // stamp edit times for cooldowns
     if (updates.username)            updates.lastUsernameEdit = Date.now();
     if (updates.bio)                 updates.lastBioEdit      = Date.now();
     if (updates.socialLinks)         updates.lastSocialEdit   = Date.now();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, select: '-passwordHash -tokens -__v' }
    );
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// GET /api/profile/:username
exports.getPublicProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username })
      .select('username displayName profilePic bio socialLinks location');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// GET /api/profile/:username/snippets
exports.getUserSnippets = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('_id');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const page  = Math.max(parseInt(req.query.page,10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit,10) || 10, 50);
    const skip  = (page - 1)*limit;

    const [ snippets, total ] = await Promise.all([
      Snippet.find({ author: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-content')
        .lean(),
      Snippet.countDocuments({ author: user._id })
    ]);

    res.json({
      page,
      totalPages: Math.ceil(total/limit),
      total,
      snippets
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/profile/:username/favorites
exports.getUserFavorites = async (req, res, next) => {
  try {
    const { username } = req.params;

    // 1) Find the user by username
    const user = await User.findOne({ username })
      .select('favorites _id')
      .lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 2) Only allow owners to view their own favorites
    if (req.user.id !== user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: cannot view others’ favorites.' });
    }

    // 3) Paginate the favorites array safely
    const favs = Array.isArray(user.favorites) ? user.favorites : [];
    const page  = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip  = (page - 1) * limit;
    const slice = favs.slice(skip, skip + limit);

    // 4) Fetch snippet documents
    const favSnippets = await Snippet.find({ _id: { $in: slice } })
      .sort({ createdAt: -1 })
      .lean();

    // 5) Return paginated response
    res.json({
      page,
      totalPages: Math.ceil(favs.length / limit),
      total: favs.length,
      favorites: favSnippets
    });

  } catch (err) {
    console.error('getUserFavorites error:', err);
    res.status(500).json({ error: err.message });
  }
};

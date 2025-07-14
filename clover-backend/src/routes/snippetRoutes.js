// src/routes/snippetRoutes.js
const Snippet = require('../models/Snippet');
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.post('/upload', authMiddleware, async (req, res) => {
  const { title, code, language } = req.body;

  try {
    const newSnippet = new Snippet({
      title,
      code,
      language,
      uploadedBy: req.user.id,
    });

    await newSnippet.save();

    res.status(201).json({
      message: 'Snippet saved to database ✅',
      snippet: newSnippet,
    });
  } catch (err) {
    console.error('❌ Failed to save snippet:', err);
    res.status(500).json({ message: 'Server error while saving snippet' });
  }
});
// @route   GET /api/snippets
// @desc    Get all snippets (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const snippets = await Snippet.find()
      .sort({ createdAt: -1 }) // latest first
      .populate('uploadedBy', 'email'); // show who posted it (just email)

    res.json(snippets);
  } catch (err) {
    console.error('❌ Failed to fetch snippets:', err);
    res.status(500).json({ message: 'Server error while fetching snippets' });
  }
});

// @route   GET /api/snippets/:id
// @desc    Get a single snippet by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id)
      .populate('uploadedBy', 'email');

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found ❌' });
    }

    res.json(snippet);
  } catch (err) {
    console.error('❌ Failed to fetch snippet:', err);
    res.status(500).json({ message: 'Server error while fetching snippet' });
  }
});


module.exports = router;

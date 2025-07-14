const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// ✅ Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/cloverdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Use absolute path to public directory
const publicPath = path.resolve(__dirname, '../public');
app.use(express.static(publicPath));

// ✅ Snippet schema and model
const snippetSchema = new mongoose.Schema({
  title: String,
  code: String,
  language: String,
  uploadedBy: {
    email: String
  }
});
const Snippet = mongoose.model('Snippet', snippetSchema);

// ✅ API route
app.get('/api/snippets', async (req, res) => {
  try {
    const snippets = await Snippet.find();
    res.json(snippets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch snippets' });
  }
});

// ✅ Serve index.html on root
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

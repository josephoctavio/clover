// seedSnippets.js
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/cloverdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const snippetSchema = new mongoose.Schema({
  title: String,
  code: String,
  language: String,
  uploadedBy: {
    email: String,
  },
});

const Snippet = mongoose.model('Snippet', snippetSchema);

const snippets = [
  {
    title: 'Basic Button',
    code: `<button style="padding: 0.5rem 1rem; background: #837484; color: white; border: none; border-radius: 5px;">Click Me</button>`,
    language: 'Buttons',
    uploadedBy: { email: 'alice@example.com' },
  },
  {
    title: 'Simple Card',
    code: `<div style="padding: 1rem; background: #222; color: white; border-radius: 8px;">This is a card</div>`,
    language: 'Cards',
    uploadedBy: { email: 'bob@example.com' },
  },
  {
    title: 'Login Form',
    code: `<form><input type="email" placeholder="Email"><input type="password" placeholder="Password"><button>Login</button></form>`,
    language: 'Forms',
    uploadedBy: { email: 'carol@example.com' },
  },
  {
    title: 'Navbar',
    code: `<nav style="display: flex; gap: 1rem;"><a href="#">Home</a><a href="#">About</a></nav>`,
    language: 'Navigation',
    uploadedBy: { email: 'dave@example.com' },
  },
  {
    title: 'Hero Section',
    code: `<section style="padding: 2rem; background: #010201; color: white;"><h1>Welcome</h1><p>Start building now.</p></section>`,
    language: 'Hero',
    uploadedBy: { email: 'eve@example.com' },
  },
];

async function seed() {
  try {
    await Snippet.deleteMany(); // Optional: Clear old data
    await Snippet.insertMany(snippets);
    console.log('✅ Snippets seeded successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    mongoose.connection.close();
  }
}

seed();

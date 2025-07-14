document.addEventListener("DOMContentLoaded", () => {
  const title = document.getElementById("category-title");
  const grid = document.getElementById("snippet-grid");
  const noResults = document.getElementById("no-results");

  // 1. Get the ?category= value from the URL
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category")?.toLowerCase() || "all";

  // 2. Update the header title
  title.textContent = category === "all" ? "All Snippets" : `Showing: ${category}`;

  // 3. Get all snippets from the DOM or generate them
  fetch("/api/snippets")
    .then(res => res.json())
    .then(data => {
      let filtered = category === "all"
        ? shuffleArray(data)
        : data.filter(snippet => snippet.category.toLowerCase() === category);

      // 4. If none match, show fallback
      if (filtered.length === 0) {
        noResults.style.display = "block";
        return;
      }

      // 5. Build each snippet card
      filtered.forEach(snippet => {
        const card = document.createElement("div");
        card.className = "snippet-card";
        card.setAttribute("data-category", snippet.category.toLowerCase());

        card.innerHTML = `
          <div class="snippet-preview">${snippet.previewHTML}</div>
          <div class="snippet-meta">
            <p class="snippet-title">${snippet.title}</p>
            <p class="snippet-author">By ${snippet.author}</p>
          </div>
        `;
        grid.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Failed to load snippets:", err);
      noResults.textContent = "Error loading snippets. Please try again.";
      noResults.style.display = "block";
    });
});

// Utility function to shuffle array
function shuffleArray(arr) {
  return arr
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}
// explore.js — Mock Snippets Display for Testing Explore Page

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('snippet-section');
  const heading = document.getElementById('page-heading');

  // Get category from query string (?category=buttons)
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category') || 'All';

  heading.textContent = `Showing: ${category}`;

  // MOCK SNIPPETS — TEMPORARY DATA
  const mockSnippets = [
    { title: 'Glassmorphic Button', category: 'buttons', html: '<button class="btn-glass">Click Me</button>' },
    { title: 'Pulse Loader', category: 'loaders', html: '<div class="loader-pulse"></div>' },
    { title: 'Frosted Card', category: 'cards', html: '<div class="card-frosted">Card Content</div>' },
    { title: 'Soft Checkbox', category: 'checkboxes', html: '<input type="checkbox" class="soft-check">' },
    { title: 'Color Swatch Grid', category: 'color palette', html: '<div class="palette-grid">🎨</div>' },
  ];

  // FILTER SNIPPETS BASED ON CATEGORY
  const filtered = category.toLowerCase() === 'all'
    ? mockSnippets
    : mockSnippets.filter(snippet => snippet.category.toLowerCase() === category.toLowerCase());

  if (filtered.length === 0) {
    container.innerHTML = `<div class="no-results">No snippets found for "${category}".</div>`;
    return;
  }

  // RENDER SNIPPETS
  container.innerHTML = '';
  filtered.forEach(snippet => {
    const card = document.createElement('div');
    card.className = 'snippet-card';
    card.innerHTML = `
      <h4>${snippet.title}</h4>
      <div class="preview-box">${snippet.html}</div>
    `;
    container.appendChild(card);
  });
});

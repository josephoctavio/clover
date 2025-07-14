// scripts/component-preview.js

// Component Registry
const SNIPPETS = {
  button: {
    html: `<button class="live-btn">Click Me</button>`,
    css: `
.live-btn {
  padding: 0.75rem 1.5rem;
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  background: #0066ff;
  border: none;
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
  transition: background 0.2s ease;
}
.live-btn:hover {
  background: #cc0000;
}
    `,
    description: "A simple blue button that turns red on hover.",
    category: "Buttons",
    author: "leina west",     // ✅ fixed
    label: "Classic"
  },

  search: {
    html: `<input type="text" class="preview-search" 
    placeholder="Search..." />`,
    css: `
.preview-search {
  width: 100%;
  max-width: 400px;
  padding: 0.75rem 1rem;
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  border: 1px solid #555;
  border-radius: 8px;
  background: #1a1a1a;
  color: #fff;
}
.preview-search::placeholder {
  color: #777;
}
    `,
    description: "A dark-themed search input styled to blend with Clover’s UI.",
    category: "Inputs",
    author: "Matrix",          // ✅ fixed
    label: "Classic"
  },

  loader: {
    html: `<div class="spinner"></div>`,
    css: `
.spinner {
  width: 48px;
  height: 48px;
  border: 5px solid #333;
  border-top-color: #6cd5ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to 
{ transform: rotate(360deg); } }
    `,
    description: "A rotating loader wheel.",
    category: "Loaders",
    author: "Reginald",        // ✅ fixed
    label: "Premium"
  },

  form: {
    html: `<form><!-- Coming soon --></form>`,
    css: `form { display: none; }`,
    description: "Form component coming soon.",
    category: "Forms",
    author: "CloverTeam",      // ✅ fixed
    label: "Upcoming"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const key = params.get("component") || "button";
  const snippet = SNIPPETS[key];

  if (!snippet) {
    document.getElementById("description").textContent = "Component not found.";
    return;
  }

  // 1. Inject Component CSS
  const styleTag = document.createElement("style");
  styleTag.textContent = snippet.css;
  document.head.appendChild(styleTag);

  // 2. Inject Live Preview HTML
  document.getElementById("preview-box").innerHTML = snippet.html;

  // 3. Tabs and Code Output
  const htmlTab = document.getElementById("html-tab");
  const cssTab = document.getElementById("css-tab");
  const codeBox = document.getElementById("code-box");
  const slider = document.getElementById("tab-slider");

  function showHTML() {
    codeBox.className = "hljs language-xml";
    codeBox.textContent = snippet.html.trim();
    hljs.highlightElement(codeBox);
    updateSlider("html");
  }

  function showCSS() {
    codeBox.className = "hljs language-css";
    codeBox.textContent = snippet.css.trim();
    hljs.highlightElement(codeBox);
    updateSlider("css");
  }

  function updateSlider(tab) {
    if (tab === "html") {
      slider.style.left = "4px";
    } else if (tab === "css") {
      slider.style.left = "50%";
    }
  }

  htmlTab.addEventListener("click", () => {
    showHTML();
    htmlTab.classList.add("active");
    cssTab.classList.remove("active");
  });

  cssTab.addEventListener("click", () => {
    showCSS();
    cssTab.classList.add("active");
    htmlTab.classList.remove("active");
  });

  // 4. Default View
  showHTML();

  // Update author info right here ✅
  document.getElementById("author-info").textContent = `${snippet.category} by ${snippet.author}`;

  // Metadata and description
  document.getElementById("description").textContent = snippet.description;
  document.getElementById("metadata").innerHTML = `
    <span>Category: ${snippet.category}</span>
    <span>Author: ${snippet.author}</span>
    <span>${snippet.label}</span>
  `;
});

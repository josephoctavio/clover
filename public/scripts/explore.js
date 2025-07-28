document.addEventListener("DOMContentLoaded", () => {
  const title = document.getElementById("category-title");
  const grid = document.getElementById("snippet-grid");
  const noResults = document.getElementById("no-results");

  const params = new URLSearchParams(window.location.search);
  const category = params.get("category")?.toLowerCase() || "all";
// ✅ Set checked state before animation starts
const radioToCheck = document.getElementById(`radio-${category}`);
if (radioToCheck) {
  radioToCheck.checked = true;
}
  // Now set the header title
  title.textContent = category === "all" ? "All Snippets" : capitalize(category);
  
  // ...rest of your code remains the same
});

// ✅ NEW: Visually check the correct radio button
const radioToCheck = document.getElementById(`radio-${category}`);
if (radioToCheck) {
  radioToCheck.checked = true;
}

  // 2. Update the header title to show selected category
  title.textContent =
    category === "all"
      ? "All Snippets"
      : capitalize(category);

  // 3. Fetch all snippets from the backend
  fetch("/api/snippets")
    .then(res => res.json())
    .then(data => {
      // 4. Filter snippets based on selected category
      const filtered = category === "all"
        ? shuffleArray(data)
        : data.filter(snippet => snippet.category.toLowerCase() === category);

      // 5. Handle empty results
      if (filtered.length === 0) {
        noResults.style.display = "block";
        return;
      }

      // 6. Render snippet cards
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
  console.error("❌ Failed to load snippets:", err);
  noResults.textContent = "Error loading snippets. Please try again.";
  noResults.style.display = "block";
});

// Utility: Capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Utility: Shuffle array randomly
function shuffleArray(arr) {
  return arr
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

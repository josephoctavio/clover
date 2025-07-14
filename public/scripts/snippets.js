// scripts/snippets.js

// ✅ This file now ONLY handles behavior (like Preview button click)
// Actual fetching/rendering is done in main.js AFTER injection

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.preview-button').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const card = e.currentTarget.closest('.snippet-card');
      if (!card) return;

      const data = {
        title: card.querySelector('h3')?.textContent,
        language: card.querySelector('p')?.textContent.replace('Language: ', ''),
        publisher: card.querySelector('.publisher')?.textContent.replace('By: ', ''),
        html: card.querySelector('.snippet-code')?.innerHTML,
        link: btn.getAttribute('href')
      };

      sessionStorage.setItem('cloverPreviewData', JSON.stringify(data));
      window.location.href = data.link;
    });
  });
});
function spinAndReload(button) {
  button.classList.add('clicked');
  setTimeout(() => {
    location.reload();
  }, 2200);
}
const searchInput = document.querySelector('.input');

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  const snippetCards = document.querySelectorAll('.snippet-card');

  let matches = 0;

  snippetCards.forEach(card => {
    const category = card.getAttribute('data-category')?.toLowerCase() || '';
    const previewText = card.querySelector('.snippet-preview')?.textContent.toLowerCase() || '';

    const matchesCategory = category.includes(query);
    const matchesPreview = previewText.includes(query);

    const shouldShow = query === '' || matchesCategory || matchesPreview;

    card.style.display = shouldShow ? 'block' : 'none';

    if (shouldShow) matches++;
  });

  const noResults = document.querySelector('#no-results-message');
  if (noResults) {
    noResults.style.display = matches === 0 ? 'flex' : 'none';
  }
});
document.addEventListener('DOMContentLoaded', () => {
  const searchField = document.querySelector('.input');
  const suggestions = [
    "Try 'Buttons'",
    "Search UI snippets",
    "Find login forms",
    "Try 'Hero section'",
    "Explore cards & loaders",
  ];

  if (!searchField) return;

  let index = 0;
  let typing = false;

  searchField.addEventListener('input', () => {
    typing = searchField.value.length > 0;
  });

  setInterval(() => {
    if (!typing) {
      // Fade out placeholder
      searchField.classList.add('fade-placeholder');

      setTimeout(() => {
        // Change text, then fade back in
        searchField.placeholder = suggestions[index];
        index = (index + 1) % suggestions.length;

        searchField.classList.remove('fade-placeholder');
      }, 400);
    }
  }, 3500);
});

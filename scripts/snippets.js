// scripts/snippets.js
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a.snippet-card').forEach(card => {
    let clickCount = 0;
    let timer;

    card.addEventListener('click', e => {
      clickCount++;
      // Always prevent the default single‑click navigation
      e.preventDefault();

      if (clickCount === 1) {
        // Reset count after 400ms
        timer = setTimeout(() => {
          clickCount = 0;
        }, 400);
      }

      if (clickCount === 2) {
        clearTimeout(timer);
        // On second click, actually navigate
        window.location.href = card.getAttribute('href');
      }
    });
  });
});

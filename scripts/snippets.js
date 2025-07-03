// scripts/snippets.js

// Single-click on the “Preview” button handles navigation.
// (We no longer need double-click on the card—just click on the button.)

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.preview-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      // Prevent any bubbling
      e.stopPropagation();
      // Navigate
      window.location.href = btn.getAttribute('href');
    });
  });
});

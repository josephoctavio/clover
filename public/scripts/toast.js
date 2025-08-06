// public/scripts/toast.js

function showToastError(msg) {
  const t = document.createElement('div');
  t.className = 'dynamic-toast error';
  t.textContent = msg;
  document.body.append(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.add('fade-out');
    setTimeout(() => t.remove(), 400);
  }, 5000);
}

function showToastSuccess(msg) {
  const t = document.createElement('div');
  t.className = 'dynamic-toast success';
  t.textContent = msg;
  document.body.append(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.add('fade-out');
    setTimeout(() => t.remove(), 400);
  }, 5000);
}

// Expose them globally so any other script can call them:
window.showToastError   = showToastError;
window.showToastSuccess = showToastSuccess;

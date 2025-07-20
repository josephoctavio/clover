// public/scripts/forgot.js

document.addEventListener('DOMContentLoaded', () => {
  const phase1 = document.getElementById('request-code');
  const phase2 = document.getElementById('verify-code');
  const phase3 = document.getElementById('reset-pass');

  const err1 = document.getElementById('fp-error-1');
  const err2 = document.getElementById('fp-error-2');
  const err3 = document.getElementById('fp-error-3');

  let savedEmail = '';
  let savedCode  = '';

  // — Toast helper
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    // Fade out & remove
    setTimeout(() => toast.classList.add('fade-out'), 2000);
    toast.addEventListener('transitionend', () => toast.remove());
  }

  // Helper: fetch + JSON error handling
  async function safeFetch(url, opts) {
    const res = await fetch(url, opts);
    let payload = null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) payload = await res.json();
    if (!res.ok) {
      const msg = (payload && (payload.error || payload.message)) || res.statusText;
      throw new Error(msg);
    }
    return payload;
  }

  // — Phase 1: Request reset code
  phase1.addEventListener('submit', async e => {
    e.preventDefault();
    err1.textContent = '';
    const email = document.getElementById('fp-email').value.trim();
    if (!email) {
      err1.textContent = 'Please enter your email.';
      return;
    }
    try {
      await safeFetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      savedEmail = email;
      phase1.style.display = 'none';
      phase2.style.display = '';
      showToast('✅ Reset code sent! Check your email.', 'success');
    } catch (err) {
      err1.textContent = err.message;
    }
  });

  // — Phase 2: Verify the 6‑digit code
  phase2.addEventListener('submit', async e => {
    e.preventDefault();
    err2.textContent = '';
    const code = document.getElementById('fp-code').value.trim();
    if (!code) {
      err2.textContent = 'Enter the 6‑digit code.';
      return;
    }
    try {
      await safeFetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: savedEmail, code })
      });
      savedCode = code;
      phase2.style.display = 'none';
      phase3.style.display = '';
      showToast('✅ Code verified—set your new password.', 'success');
    } catch (err) {
      err2.textContent = err.message;
    }
  });

  // — Phase 3: Submit new password
  phase3.addEventListener('submit', async e => {
    e.preventDefault();
    err3.textContent = '';
    const pw1 = document.getElementById('fp-new').value;
    const pw2 = document.getElementById('fp-confirm').value;
    if (!pw1 || !pw2) {
      err3.textContent = 'Both password fields are required.';
      return;
    }
    if (pw1 !== pw2) {
      err3.textContent = 'Passwords do not match.';
      return;
    }
    try {
      await safeFetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: savedEmail,
          code: savedCode,
          newPassword: pw1
        })
      });
      showToast('🎉 Password reset! Redirecting to login…', 'success');
      setTimeout(() => window.location.href = 'login.html', 2500);
    } catch (err) {
      err3.textContent = err.message;
    }
  });
});
// Password‑show/hide toggles for all .toggle-password spans
document.querySelectorAll('.toggle-password').forEach(span => {
  span.addEventListener('click', () => {
    const input = document.getElementById(span.dataset.target);
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    span.textContent = isHidden ? 'Hide' : 'Show';
  });
});
(async () => {
  const messageEl = document.getElementById('status-message');
  const params    = new URLSearchParams(window.location.search);
  const token     = params.get('token');

  if (!token) {
    messageEl.textContent = '❌ Invalid verification link.';
    return;
  }

  try {
    // Call the API directly
    const res  = await fetch(`http://localhost:5000/api/verify?token=${token}`);
    const data = await res.json();

    if (res.ok) {
      messageEl.textContent = ' Email verified successfully!You can log in now Redirecting…';
      // Give the user a moment to read, then navigate:
      setTimeout(() => {
        window.location.href = 'login.html?verified=true';
      }, 2000);
    } else {
      messageEl.textContent = `❌ ${data.error || 'Verification failed.'}`;
    }
  } catch (err) {
    console.error('Verification fetch error:', err);
    messageEl.textContent = '❌ An error occurred during verification.';
  }
})();

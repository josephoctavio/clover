document.addEventListener('DOMContentLoaded', () => {
  // Only run this script on login/signup pages
  const hasLoginForm    = document.getElementById('login-form');
  const hasSignupForm   = document.getElementById('signup-form-element');
  if (!hasLoginForm && !hasSignupForm) return;  // Exit if not on login/signup page

  // UI elements
  const rightPane       = document.querySelector('.right-pane');
  const mascotBox       = document.getElementById('mascot-box');
  const signupFormBox   = document.getElementById('signup-form');
  const signinFormBox   = document.getElementById('signin-form');
  const signupForm      = document.getElementById('signup-form-element');
  const loginForm       = document.getElementById('login-form');
  const emailToggleBtn  = document.getElementById('show-login-form');
  const footerLink      = document.getElementById('switch-to-signin');

  const emailInput      = document.getElementById('email');
  const passInput       = document.getElementById('password');
  const loginError      = document.getElementById('login-error');

  let currentForm = null; // Tracks which form is active

  // Show specified form pane
  function showForm(form) {
    currentForm = form;
    if (rightPane) rightPane.classList.add('form-visible');
    if (mascotBox) mascotBox.style.opacity = '0';
    if (signupFormBox) signupFormBox.classList.remove('active');
    if (signinFormBox) signinFormBox.classList.remove('active');
    if (form === 'signin') {
      signinFormBox?.classList.add('active');
      emailToggleBtn.textContent = 'Cancel';
    } else {
      signupFormBox?.classList.add('active');
      emailToggleBtn.textContent = 'Cancel';
    }
  }

  // Hide all forms
  function hideForms() {
    currentForm = null;
    if (rightPane) rightPane.classList.remove('form-visible');
    if (mascotBox) mascotBox.style.opacity = '1';
    signupFormBox?.classList.remove('active');
    signinFormBox?.classList.remove('active');
    emailToggleBtn.textContent = 'Log in with Email';
  }

  // Toggle email login pane
  if (emailToggleBtn) {
    emailToggleBtn.addEventListener('click', () => {
      if (currentForm === 'signin') hideForms();
      else showForm('signin');
    });
  }

  // Toggle between signup/signin via footer link
  if (footerLink) {
    footerLink.addEventListener('click', e => {
      e.preventDefault();
      if (currentForm === 'signup') hideForms();
      else showForm('signup');
    });
  }

  // --- Signup handler ---
  if (signupForm) {
    signupForm.addEventListener('submit', async e => {
      e.preventDefault();
      const username = signupForm.querySelector('input[name="username"]').value.trim();
      const email    = signupForm.querySelector('input[name="email"]').value.trim();
      const password = signupForm.querySelector('input[name="password"]').value;

      if (!username || !email || !password) {
        alert('Please fill out all fields');
        return;
      }
      try {
        const res = await fetch('http://localhost:5000/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body:   JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          signupForm.reset();
          hideForms();
        } else {
          alert(data.error || 'Signup failed');
        }
      } catch (err) {
        console.error('Signup error:', err);
        alert('Something went wrong.');
      }
    });
  }

  // --- Signin handler ---
  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      if (loginError) loginError.style.display = 'none';

      const emailVal = emailInput?.value.trim();
      const passVal  = passInput?.value;
      if (!emailVal || !passVal) {
        if (loginError) {
          loginError.textContent = 'Please fill out both fields.';
          loginError.style.display = 'block';
        }
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body:   JSON.stringify({ email: emailVal, password: passVal })
        });
        const data = await res.json();
        console.log('Login response:', data);

        if (res.ok) {
          loginForm.reset();
          hideForms();

       // Store session state
localStorage.setItem('cloverUser', 'true');
// Store username if available
if (data.user?.username) {                    
  localStorage.setItem('username', data.user.username);
}

// DEBUG: log immediately so we can see in DevTools
console.log('🐞 After login, storage:', {
  cloverUser: localStorage.getItem('cloverUser'),
  username:   localStorage.getItem('username')
});

// Pause redirect for 8 seconds so you can inspect
setTimeout(() => {
  window.location.href = 'index.html';
}, 2000);

        } else {
          if (loginError) {
            loginError.textContent = data.error || data.message || 'Login failed.';
            loginError.style.display = 'block';
          }
        }
      } catch (err) {
        console.error('Login error:', err);
        if (loginError) {
          loginError.textContent = 'Server error. Please try again.';
          loginError.style.display = 'block';
        }
      }
    });
  }

  // --- Protections ---
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('selectstart', e => e.preventDefault());
  document.addEventListener('dragstart', e => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });
});

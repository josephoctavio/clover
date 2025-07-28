// public/scripts/login.js


document.addEventListener('DOMContentLoaded', () => {
  // Only run on login/signup pages
  const hasLoginForm  = document.getElementById('login-form');
  const hasSignupForm = document.getElementById('signup-form-element');
  if (!hasLoginForm && !hasSignupForm) return;

  // UI elements
  const rightPane      = document.querySelector('.right-pane');
  const mascotBox      = document.getElementById('mascot-box');
  const signupFormBox  = document.getElementById('signup-form');
  const signinFormBox  = document.getElementById('signin-form');
  const signupForm     = document.getElementById('signup-form-element');
  const loginForm      = document.getElementById('login-form');
  const loginError     = document.getElementById('login-error');
  const signupBtn      = document.getElementById('signup-btn');

  // Toggles
  const emailToggleBtn = document.getElementById('show-login-form')
                      || document.querySelector('.email-btn');
  const signupToggle   = document.getElementById('switch-to-signin')
                      || document.querySelector('.footer-link a');

  let currentForm = null; // 'signin' | 'signup' | null

  // --- Clear Old Validation on Open ---
  function clearValidation() {
    ['signup-username','signup-email','signup-password','signup-confirm-password']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('valid','invalid');
      });
  }

  // --- Toggle Logic (separate) ---
  function showForm(type) {
    currentForm = type;
    clearValidation();
    rightPane.classList.add('form-visible');
    mascotBox.style.opacity = '0';
    signupFormBox.classList.remove('active');
    signinFormBox.classList.remove('active');
    if (type === 'signin') signinFormBox.classList.add('active');
    else signupFormBox.classList.add('active');
     emailToggleBtn.textContent = 'Cancel';
    
  }

  function hideForms() {
    currentForm = null;
    rightPane.classList.remove('form-visible');
    mascotBox.style.opacity = '1';
    signupFormBox.classList.remove('active');
    signinFormBox.classList.remove('active');
    emailToggleBtn.textContent = 'Log in with Email';
  }

  emailToggleBtn?.addEventListener('click', () => {
    // If either form is open, just close both
   if (currentForm === 'signin' || currentForm === 'signup') {
      hideForms();
  } else {
      // Otherwise show the login form
      showForm('signin');
    }
  });

  signupToggle?.addEventListener('click', e => {
    e.preventDefault();
    if (currentForm === 'signup') hideForms();
   else showForm('signup');
  });

  // --- Field Validation & Tooltips ---
  const fieldRules = {
    'signup-username': {
      validate: v => /^(?=.{5,15}$)(?=(?:.*\d){3,})[A-Za-z0-9_-]+$/.test(v),
      tooltip:  document.getElementById('tooltip-signup-username')
    },
    'signup-email': {
      validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      tooltip:  document.getElementById('tooltip-signup-email')
    },
     'signup-password': {
    validate: v => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,25}$/.test(v),
    tooltip:  document.getElementById('tooltip-signup-password')
  }
};
  const confirmInput  = document.getElementById('signup-confirm-password');
  const passwordInput = document.getElementById('signup-password');

  Object.entries(fieldRules).forEach(([id, { validate, tooltip }]) => {
    const input = document.getElementById(id);
    if (!input || !tooltip) return;

    input.addEventListener('focus', () => {
      if (!validate(input.value)) tooltip.classList.add('tooltip--visible');
    });

    input.addEventListener('input', () => {
      const val = input.value;
      const ok  = validate(val);
      // Only invalid if non-empty + failing
      if (val.length > 0 && !ok) {
        input.classList.add('invalid');
        input.classList.remove('valid');
      } else if (ok) {
        input.classList.add('valid');
        input.classList.remove('invalid');
      } else {
        // empty
        input.classList.remove('valid','invalid');
      }
      tooltip.classList.toggle('tooltip--visible', val.length > 0 && !ok);
    });

    input.addEventListener('blur', () => {
      tooltip.classList.remove('tooltip--visible');
      // if empty, clear classes
      if (input.value.length === 0) {
        input.classList.remove('valid','invalid');
      }
    });
  });

  // Confirm‑password logic
  if (confirmInput) {
    confirmInput.addEventListener('input', () => {
      const val = confirmInput.value;
      const match = val === passwordInput.value;
      if (val.length > 0 && !match) {
        confirmInput.classList.add('invalid');
        confirmInput.classList.remove('valid');
      } else if (match) {
        confirmInput.classList.add('valid');
        confirmInput.classList.remove('invalid');
      } else {
        confirmInput.classList.remove('valid','invalid');
      }
    });
    confirmInput.addEventListener('blur', () => {
      if (confirmInput.value.length === 0) {
        confirmInput.classList.remove('valid','invalid');
      }
    });
  }

  // --- Toast helper ---
  function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast toast--error';
    t.textContent = msg;
    document.body.append(t);
    setTimeout(() => {
      t.classList.add('fade-out');
      setTimeout(() => t.remove(), 400);
    }, 5000);
  }

  // --- Signup Handler ---
  signupForm?.addEventListener('submit', async e => {
    e.preventDefault();

    // Validate all
    const u = document.getElementById('signup-username').value;
    const em= document.getElementById('signup-email').value;
    const p = passwordInput.value;
    const c = confirmInput.value;
    const allOK = fieldRules['signup-username'].validate(u)
               && fieldRules['signup-email'].validate(em)
               && fieldRules['signup-password'].validate(p)
               && (c === p);

    if (!allOK) {
      return showToast('Please fix errors before creating your account');
    }

    // Proceed as before
    try {
      const res  = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ username: u, email: em, password: p })
      });
      const data = await res.json();
      if (res.ok) {
        // Success toast
        const t = document.createElement('div');
        t.className = 'toast toast--success';
        t.textContent = data.message;
        document.body.append(t);
        setTimeout(() => {
          t.classList.add('fade-out');
          setTimeout(() => t.remove(), 400);
        }, 5000);

        signupForm.reset();
        hideForms();
      } else {
        showToast(data.error || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      showToast('Something went wrong.');
    }
  });

  // --- Verification Loading Animation ---
function showVerificationLoading() {
  // Remove any existing loader
  const oldLoader = document.getElementById('verification-loader');
  if (oldLoader) oldLoader.remove();

  // Create loader overlay
  const loader = document.createElement('div');
  loader.id = 'verification-loader';
  loader.style.position = 'fixed';
  loader.style.top = '0';
  loader.style.left = '0';
  loader.style.width = '100vw';
  loader.style.height = '100vh';
  loader.style.background = 'rgba(11,11,34,0.85)';
  loader.style.display = 'flex';
  loader.style.alignItems = 'center';
  loader.style.justifyContent = 'center';
  loader.style.zIndex = '10000';
  loader.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div class="verification-spinner"></div>
      <div style="color:#fff;font-family:'Poppins',sans-serif;font-size:1.1rem;margin-top:1.2rem;">Verifying your login...</div>
    </div>
  `;
  document.body.append(loader);
}
function hideVerificationLoading() {
  const loader = document.getElementById('verification-loader');
  if (loader) loader.remove();
}

// --- Login Handler (unchanged) ---
loginForm?.addEventListener('submit', async e => {
  e.preventDefault();
  loginError.style.display = 'none';
  const emailVal = loginForm.querySelector('#email').value.trim();
  const passVal  = loginForm.querySelector('#password').value;
  if (!emailVal || !passVal) {
    loginError.textContent = 'Please fill out both fields.';
    loginError.style.display = 'block';
    return;
  }
  try {
    showVerificationLoading();
    const res  = await fetch('http://localhost:5000/api/login', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ email: emailVal, password: passVal })
    });
    const data = await res.json();
    hideVerificationLoading();
    if (res.ok) {
      loginForm.reset();
      hideForms();
      localStorage.setItem('cloverUser','true');
      if (data.user?.username) localStorage.setItem('username', data.user.username);
      if (data.token) localStorage.setItem('cloverToken', data.token); // this line adds

      // First verify, then show animation, then redirect (do NOT hide loader before redirect)
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000); // 5 seconds animation after verification
    } else {
      hideVerificationLoading();
      loginError.textContent = data.error || 'Login failed.';
      loginError.style.display = 'block';
    }
  } catch (err) {
    hideVerificationLoading();
    console.error('Login error:', err);
    loginError.textContent = 'Server error. Please try again.';
    loginError.style.display = 'block';
  }
  });

  // --- Misc protections ---
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('selectstart', e => e.preventDefault());
  document.addEventListener('dragstart', e => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.toggle-password').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const targetId = toggle.getAttribute('data-target');
      const input = document.getElementById(targetId);

      if (!input) return;

      if (input.type === 'password') {
        input.type = 'text';
        toggle.textContent = 'Hide';
      } else {
        input.type = 'password';
        toggle.textContent = 'Show';
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const ghBtn = document.querySelector('.oauth-btn.github');
  const gBtn  = document.querySelector('.oauth-btn.google-btn');

  if (ghBtn) {
    ghBtn.addEventListener('click', e => {
      e.preventDefault();
      console.log('👉 GitHub button clicked, redirecting to API…');
      window.location.href = 'http://localhost:5000/api/auth/github';
    });
  } else {
    console.warn('⚠️ .oauth-btn.github not found in DOM');
  }

  if (gBtn) {
    gBtn.addEventListener('click', e => {
      e.preventDefault();
      console.log('👉 Google button clicked, redirecting to API…');
      window.location.href = 'http://localhost:5000/api/auth/google';
    });
  } else {
    console.warn('⚠️ .oauth-btn.google-btn not found in DOM');
  }
});

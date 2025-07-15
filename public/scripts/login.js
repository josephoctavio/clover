document.addEventListener('DOMContentLoaded', () => {
  const rightPane       = document.querySelector('.right-pane');
  const mascotBox       = document.getElementById('mascot-box');
  const signupFormBox   = document.getElementById('signup-form');
  const signinFormBox   = document.getElementById('signin-form');

  const emailToggleBtn  = document.getElementById('show-login-form');
  const footerLink      = document.getElementById('switch-to-signin');

  let currentForm = null; // 'signup', 'signin', or null

  function showForm(form) {
    currentForm = form;
    rightPane.classList.add('form-visible');
    mascotBox.style.opacity = '0';

    // Hide both forms
    signupFormBox.classList.remove('active');
    signinFormBox.classList.remove('active');

    if (form === 'signin') {
      signinFormBox.classList.add('active');
      emailToggleBtn.textContent = 'Cancel';
    } else if (form === 'signup') {
      signupFormBox.classList.add('active');
      emailToggleBtn.textContent = 'Cancel';
    }
  }

  function hideForms() {
    currentForm = null;
    rightPane.classList.remove('form-visible');
    mascotBox.style.opacity = '1';

    signupFormBox.classList.remove('active');
    signinFormBox.classList.remove('active');

    emailToggleBtn.textContent = 'Log in with Email';
  }

  // Primary "Log in with Email" button toggles the signin form
  emailToggleBtn.addEventListener('click', () => {
    if (currentForm === 'signin') {
      hideForms();
    } else {
      showForm('signin');
    }
  });

  // Footer link toggles the sign-up form
  footerLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentForm === 'signup') {
      hideForms();
    } else {
      showForm('signup');
    }
  });

  // --- Protections ---
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('selectstart', e => e.preventDefault());
  document.addEventListener('dragstart', e => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });
});

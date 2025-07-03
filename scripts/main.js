// scripts/main.js

// ─── Initialization Functions ──────────────────────────────────────────────
function initSidebar() {
  const hamburger = document.querySelector('.hamburger');
  const sidebar   = document.querySelector('.sidebar');
  const closeBtn  = document.querySelector('.close-sidebar');
  const body      = document.body;

  if (!hamburger || !sidebar || !closeBtn) return;

  hamburger.addEventListener('click', () => {
    sidebar.classList.add('open');
    body.classList.add('sidebar-open');
  });

  closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('open');
    body.classList.remove('sidebar-open');
  });

  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
      sidebar.classList.remove('open');
      body.classList.remove('sidebar-open');
    }
  });

  document.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON') e.target.blur();
  });
}

function animatePlaceholder(input, phrases, typingSpeed = 450, pauseDelay = 2500) {
  let phraseIndex = 0;
  let charIndex   = 0;
  let typing      = true;

  function tick() {
    const text = phrases[phraseIndex];
    if (typing) {
      charIndex++;
      input.placeholder = text.slice(0, charIndex);
      if (charIndex === text.length) {
        typing = false;
        return setTimeout(tick, pauseDelay);
      }
    } else {
      charIndex--;
      input.placeholder = text.slice(0, charIndex);
      if (charIndex === 0) {
        typing = true;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    setTimeout(tick, typingSpeed);
  }

  input.addEventListener('focus', () => input.placeholder = '');
  input.addEventListener('blur', () => {
    charIndex = 0;
    typing = true;
    tick();
  });

  tick();
}

function initSearchPlaceholder() {
  const phrases = [
    "Search buttons, navbars, cards...",
    "Try 'login form' or 'dashboard card'",
    "Type to find a component",
    "Need a hero section?"
  ];

  const mobileInput  = document.getElementById('mobileSearchInput');
  const desktopInput = document.getElementById('desktopSearchInput');

  if (mobileInput) animatePlaceholder(mobileInput, phrases, 600, 3500);
  if (desktopInput) animatePlaceholder(desktopInput, phrases, 600, 3500);
}

function initSeeMoreToggle() {
  const btn = document.getElementById('seeMoreBtn');
  const extra = document.getElementById('extra-links');
  if (!btn || !extra) return;

  let expanded = false;
  btn.addEventListener('click', () => {
    expanded = !expanded;
    extra.classList.toggle('expanded', expanded);
    btn.textContent = expanded ? 'See Less' : 'See More';
  });
}

function initMobilePopup() {
  if (window.innerWidth > 767 || localStorage.getItem('popupDismissed')) return;

  const popup  = document.getElementById('mobile-popup');
  const closeX = document.getElementById('closePopup');
  const gotIt  = document.getElementById('gotItBtn');
  if (!popup || !closeX || !gotIt) return;

  function showPopup() {
    popup.classList.add('active');
    document.body.classList.add('no-scroll');
  }

  function hidePopup() {
    popup.classList.remove('active');
    document.body.classList.remove('no-scroll');
    localStorage.setItem('popupDismissed', 'true');
  }

  setTimeout(showPopup, 20000);
  closeX.addEventListener('click', hidePopup);
  gotIt.addEventListener('click', hidePopup);
}

function initExploreDropdown() {
  const wrapper = document.querySelector('.explore-dropdown');
  if (!wrapper) return;

  const btn  = wrapper.querySelector('.explore-btn');
  const menu = wrapper.querySelector('.dropdown-menu');
  let hoverTimeout;
  let isClicked = false;

  btn.addEventListener('click', e => {
    e.stopPropagation();
    isClicked = !wrapper.classList.contains('open');
    wrapper.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    if (isClicked) {
      wrapper.classList.remove('open');
      isClicked = false;
    }
  });

  menu.addEventListener('click', e => e.stopPropagation());

  wrapper.addEventListener('mouseenter', () => {
    if (!isClicked) {
      clearTimeout(hoverTimeout);
      wrapper.classList.add('open');
    }
  });

  wrapper.addEventListener('mouseleave', () => {
    if (!isClicked) {
      hoverTimeout = setTimeout(() => wrapper.classList.remove('open'), 200);
    }
  });
}

function initCategoryNav() {
  const links = document.querySelectorAll('.category-nav .nav-link');
  if (!links.length) return;

  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const category = link.textContent.trim();
      filterSnippetsByCategory(category);
    });
  });
}

function filterSnippetsByCategory(category) {
  const snippets = document.querySelectorAll('.snippet-card');
  snippets.forEach(card => {
    const cardCat = card.dataset.category || 'All';
    card.style.display = (category === 'All' || cardCat === category) ? '' : 'none';
  });
}

function initSnippetInjection() {
  const container = document.getElementById('snippet-section');
  if (!container) return;

  fetch('snippets.html')
    .then(response => {
      if (!response.ok) throw new Error(`Network response was not ok (${response.status})`);
      return response.text();
    })
    .then(html => {
      container.innerHTML = html;
      // After injection, ensure category nav is functional
      initCategoryNav();
    })
    .catch(err => console.error('Error loading snippets:', err));
}

// ─── Main DOMContentLoaded ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initSearchPlaceholder();
  initSeeMoreToggle();
  initMobilePopup();
  initExploreDropdown();
  // Ensure nav is wired before injection too
  initCategoryNav();
  initSnippetInjection();
  lucide.createIcons();
});


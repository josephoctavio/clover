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

// ─── Load and Render Snippets Section ──────────────────────────────────────

function loadSnippetsSection() {
  const container = document.getElementById('snippet-section');
  if (!container) return;

  const errorEl = document.getElementById('snippets-error');
if (errorEl) errorEl.style.display = 'none';

  fetch('snippets.html')
    .then(response => {
      if (!response.ok) throw new Error(`Network error (${response.status})`);
      return response.text();
    })
    .then(html => {
      container.innerHTML = html;

      const grid = document.getElementById('snippets-grid');
      if (!grid) {
        console.error('❌ Grid element not found after injection.');
        return;
      }

      return fetch('http://localhost:5000/api/snippets')
        .then(res => res.json())
        .then(snippets => {
          grid.innerHTML = '';
          snippets.forEach(snippet => {
            const card = document.createElement('div');
            card.className = 'snippet-card';
            card.dataset.category = snippet.language || 'All';
            card.innerHTML = `
              <div class="snippet-preview">${snippet.code}</div>
              <button class="preview-button">Preview</button>
              <p class="publisher">${snippet.uploadedBy?.email || 'Unknown'}</p>
            `;

            // Navigate to preview on double click
            card.addEventListener('dblclick', () => {
              window.location.href = `component-preview.html?id=${snippet._id}`;
            });

            // Store preview data on click
            const btn = card.querySelector('.preview-button');
            btn.addEventListener('click', e => {
              e.stopPropagation();
              sessionStorage.setItem('cloverPreviewData', JSON.stringify({
                title: snippet.title,
                html: snippet.code,
                category: snippet.language,
                publisher: snippet.uploadedBy?.email,
                link: `component-preview.html?id=${snippet._id}`
              }));
              window.location.href = `component-preview.html?id=${snippet._id}`;
            });

            grid.appendChild(card);
          });

          // Re-initialize category filter after loading
          initCategoryNav();
        });
    })
.catch(err => {
  console.error('❌ Error loading snippets section or data:', err);

  const container = document.getElementById('snippet-section');
  if (container) {
    container.innerHTML = ''; // optional: clear any remnants
    container.innerHTML = `
      <div class="error-wrapper">
        <div class="error-container">
          <h2>⚠️ Failed to Load Snippets</h2>
          <p>Please check your internet connection or try refreshing the page.</p>
        </div>
        <div class="refresh-wrapper">
          <button class="refresh-btn" onclick="spinAndReload(this)">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
              <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>
    `;
  }
});

}

// ─── DOM Ready ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initSearchPlaceholder();
  initSeeMoreToggle();
  initMobilePopup();
  initExploreDropdown();
  initCategoryNav();
  loadSnippetsSection();
  lucide.createIcons();
});
function goToExplore(category) {
  window.location.href = `explore.html?category=${encodeURIComponent(category)}`;
}
document.addE



window.addEventListener('DOMContentLoaded', () => {
  const joinBtn = document.getElementById('join-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const isLoggedIn = localStorage.getItem('cloverUser');

  if (isLoggedIn) {
    if (joinBtn) joinBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
  } else {
    if (joinBtn) joinBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('cloverUser');
      window.location.href = 'index.html';
    });
  }
});
window.addEventListener('DOMContentLoaded', () => {
  const joinBtn = document.getElementById('join-btn');
  const userMenuContainer = document.getElementById('user-menu-container');

  const isLoggedIn = localStorage.getItem('cloverUser');
  const username   = localStorage.getItem('username');
console.log('🛠️ user-menu init:', {
  isLoggedIn: localStorage.getItem('cloverUser'),
  username: localStorage.getItem('username'),
});

  if (isLoggedIn && username) {
    // hide join button
    if (joinBtn) joinBtn.style.display = 'none';

userMenuContainer.innerHTML = `
  <div class="user-menu" id="user-menu">
    <div class="user-menu-box">
      <div class="username-box">
        <span class="dropdown-toggle">${username}</span>
        <span class="dropdown-caret" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"
               xmlns="http://www.w3.org/2000/svg">
            <path d="M5 7L10 12L15 7" stroke="white" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </div>
      <div class="dropdown-content" id="dropdown-content">
        <button id="logout-btn">Logout</button>
      </div>
    </div>
  </div>
`;


// dropdown toggle logic
const userMenu      = document.getElementById('user-menu');
const dropdownPanel = document.getElementById('dropdown-content');

// Toggle dropdown on click
userMenu.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevent window click event from firing
  const isOpen = dropdownPanel.style.display === 'block';

  // Toggle dropdown visibility
  dropdownPanel.style.display = isOpen ? 'none' : 'block';

  // Toggle `.open` class for caret rotation
  userMenu.classList.toggle('open', !isOpen);
});

// Close dropdown when clicking outside
window.addEventListener('click', (e) => {
  if (!userMenu.contains(e.target)) {
    dropdownPanel.style.display = 'none';
    userMenu.classList.remove('open'); // Reset caret rotation
  }
});


    // logout logic
    document.getElementById('logout-btn').addEventListener('click', () => {
      localStorage.removeItem('cloverUser');
      localStorage.removeItem('username');
      window.location.href = 'index.html';
    });

    // click outside to close
    document.addEventListener('click', e => {
      if (!userMenu.contains(e.target)) {
        dropdownPanel.style.display = 'none';
      }
    });
  } else {
    // not logged in → ensure logout menu is hidden
    if (userMenuContainer) userMenuContainer.innerHTML = '';
    if (joinBtn) joinBtn.style.display = 'inline-block';
  }
});

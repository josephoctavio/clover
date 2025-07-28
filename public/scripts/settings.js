// settings.js

document.addEventListener('DOMContentLoaded', () => {
  //
  // 1. User‑menu & Logout
  //
  const joinBtn           = document.getElementById('join-btn');
  const userMenuContainer = document.getElementById('user-menu-container');
  const isLoggedIn        = localStorage.getItem('cloverUser');
  const username          = localStorage.getItem('username');

  if (isLoggedIn && username) {
    if (joinBtn) joinBtn.style.display = 'none';

    const profilePic = localStorage.getItem('profilePic')
      || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=000&bold=true`;

    userMenuContainer.innerHTML = `
      <div class="user-menu" id="user-menu">
        <div class="user-menu-box">
          <div class="username-box">
            <img src="${profilePic}" alt="${username}" class="user-avatar" />
            <span class="dropdown-toggle">${username}</span>
            <span class="dropdown-caret" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"
                   xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7L10 12L15 7" stroke="white" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </div>
          <div class="dropdown-content hidden" id="dropdown-content">
            <button id="profile-btn">Your Profile</button>
            <button id="logout-btn">Logout</button>
          </div>
        </div>
      </div>
    `;

    // Toggle dropdown
    const userMenu     = document.getElementById('user-menu');
    const dropdownMenu = document.getElementById('dropdown-content');
    userMenu.addEventListener('click', e => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('hidden');
      userMenu.classList.toggle('open');
    });
    window.addEventListener('click', e => {
      if (!userMenu.contains(e.target)) {
        dropdownMenu.classList.add('hidden');
        userMenu.classList.remove('open');
      }
    });

    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      localStorage.removeItem('cloverUser');
      localStorage.removeItem('username');
      localStorage.removeItem('profilePic');
      sessionStorage.setItem('logoutStatus', 'success');
      window.location.href = 'index.html';
    });
  } else {
    if (joinBtn) joinBtn.style.display = 'inline-block';
  }

  //
  // 2. Toast (for logout feedback)
  //
  function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast show';
    if (isError) toast.classList.add('error');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
  const path         = window.location.pathname;
  const logoutStatus = sessionStorage.getItem('logoutStatus');
  sessionStorage.removeItem('logoutStatus');
  if (logoutStatus && (path === '/' || path.endsWith('index.html'))) {
    showToast(
      logoutStatus === 'success'
        ? 'You have been logged out successfully'
        : 'Logout failed. Please try again later.',
      logoutStatus !== 'success'
    );
  }

  //
  // 3. Cnote Modal
  //
  const cnoteBtn   = document.getElementById('cnote-btn');
  const cnoteModal = document.getElementById('cnote-modal');
  const closeCnote = document.getElementById('close-cnote');
  const cnoteBadge = document.getElementById('cnote-badge');
  const cnoteList  = document.getElementById('cnote-list');

  if (cnoteBtn && cnoteModal && closeCnote && cnoteBadge && cnoteList) {
    cnoteBadge.classList.add('hidden');
    cnoteList.innerHTML = '<p>You have no notifications.</p>';
    cnoteBtn.addEventListener('click', () => {
      cnoteModal.classList.remove('hidden');
    });
    closeCnote.addEventListener('click', () => {
      cnoteModal.classList.add('hidden');
    });
  }

  //
  // 4. Sidebar Toggle + Responsive
  //
  const sidebar     = document.getElementById('sidebar');
  const toggleBtn   = document.getElementById('sidebar-toggle');
  const mainContent = document.getElementById('main-content');
  const mobileBtn   = document.getElementById('mobile-menu-btn');
  const overlay     = document.getElementById('mobile-overlay');

  if (sidebar && toggleBtn && mainContent) {
    // Ensure starting state
    mainContent.classList.add('with-sidebar');

    // Toggle collapse/expand
    toggleBtn.addEventListener('click', () => {
      const collapsed = sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('sidebar-collapsed', collapsed);
      mainContent.classList.toggle('with-sidebar', !collapsed);
    });

    // Responsive init
    const initSidebar = () => {
      const w = window.innerWidth;
      if (w >= 1024) {
        sidebar.classList.remove('collapsed');
        mainContent.classList.add('with-sidebar');
        mainContent.classList.remove('sidebar-collapsed');
      } else if (w >= 768) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('sidebar-collapsed');
        mainContent.classList.remove('with-sidebar');
      } else {
        sidebar.classList.remove('collapsed','open');
        mainContent.classList.remove('with-sidebar','sidebar-collapsed');
      }
    };
    window.addEventListener('resize', initSidebar);
    initSidebar();

    // Mobile menu
    if (mobileBtn && overlay) {
      mobileBtn.addEventListener('click', () => {
        const open = sidebar.classList.toggle('open');
        overlay.classList.toggle('visible', open);
        mobileBtn.setAttribute('aria-expanded', open);
      });
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('visible');
        mobileBtn.setAttribute('aria-expanded', 'false');
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          sidebar.classList.remove('open');
          overlay.classList.remove('visible');
          mobileBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

}); // end DOMContentLoaded

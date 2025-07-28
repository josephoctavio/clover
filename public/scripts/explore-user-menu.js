// explore-user-menu.js
// Handles showing the user menu or join button in the explore page header, just like index.html

document.addEventListener('DOMContentLoaded', function() {
  var joinBtn = document.getElementById('join-btn');
  var userMenuContainer = document.getElementById('user-menu-container');
  // Check login status
  var token = localStorage.getItem('cloverToken');
  var user = localStorage.getItem('cloverUser');
  var username = localStorage.getItem('username');
  var isLoggedIn = (
    (token && typeof token === 'string' && token.trim() !== '' && token !== 'null' && token !== 'undefined') ||
    (user && typeof user === 'string' && user.trim() !== '' && user !== 'null' && user !== 'undefined')
  );
  if (isLoggedIn && username) {
    if (userMenuContainer) {
      userMenuContainer.style.display = '';
      userMenuContainer.innerHTML = `
        <div class="user-menu" id="user-menu">
          <div class="user-menu-box">
            <div class="username-box">
              <span class="dropdown-toggle">${username}</span>
              <span class="dropdown-caret" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 7L10 12L15 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </div>
            <div class="dropdown-content" id="dropdown-content">
              <button id="logout-btn">Logout</button>
            </div>
          </div>
        </div>
      `;
      if (joinBtn) joinBtn.style.display = 'none';
      // Dropdown logic
      var userMenu = document.getElementById('user-menu');
      var dropdownPanel = document.getElementById('dropdown-content');
      userMenu.addEventListener('click', function(e) {
        e.stopPropagation();
        var isOpen = dropdownPanel.style.display === 'block';
        dropdownPanel.style.display = isOpen ? 'none' : 'block';
        userMenu.classList.toggle('open', !isOpen);
      });
      window.addEventListener('click', function(e) {
        if (!userMenu.contains(e.target)) {
          dropdownPanel.style.display = 'none';
          userMenu.classList.remove('open');
        }
      });
      document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('cloverUser');
        localStorage.removeItem('username');
        localStorage.removeItem('cloverToken');
        window.location.href = 'index.html';
      });
    }
  } else {
    if (userMenuContainer) {
      userMenuContainer.innerHTML = '';
      userMenuContainer.style.display = 'none';
    }
    if (joinBtn) joinBtn.style.display = '';
  }
});

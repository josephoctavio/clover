// settings.js
// settings.js

// Always-available avatar helper
const AVATAR_FG = 'ffffff';
function makeAvatarUrl(name, bgHex) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`
       + `&background=${bgHex}&color=${AVATAR_FG}&bold=true`;
}
// settings.js (very top)

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h/30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1,
      Math.min(k(n) - 3,
        Math.min(9 - k(n), 1)
      )
    );
  return [f(0), f(8), f(4)]
    .map(x => Math.round(x * 255)
      .toString(16)
      .padStart(2, '0')
    )
    .join('');
}


document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('ready');

  // Immediately wire up the appearance toggles in case we're already on #appearance
initAppearanceToggle();



  //
  // 0) User & sidebar-footer setup
  //
  const username = localStorage.getItem('username');
  if (localStorage.getItem('cloverUser') && username) {
    const joinBtn = document.getElementById('join-btn');
    joinBtn?.style.setProperty('display', 'none', 'important');

    // Avatar background generator
    const USER_KEY = `avatarBg_${username}`;
    let avatarBg = localStorage.getItem(USER_KEY);
    if (!avatarBg) {
      const h = Math.floor(Math.random() * 360);
      const s = 30 + Math.random() * 20;
      const l = 25 + Math.random() * 10;
      function hslToHex(h,s,l) {
        s/=100; l/=100;
        const k = n=> (n + h/30)%12;
        const a = s * Math.min(l,1-l);
        const f = n => l - a * Math.max(-1,
          Math.min(k(n)-3, Math.min(9-k(n),1)));
        return [f(0),f(8),f(4)]
          .map(x=> Math.round(x*255).toString(16).padStart(2,'0'))
          .join('');
      }
      avatarBg = hslToHex(h,s,l);
      localStorage.setItem(USER_KEY, avatarBg);
    }
  const profilePic = makeAvatarUrl(username, avatarBg);

    
    // Render sidebar-footer

    // Fetch from storage
const storedEmail = localStorage.getItem('email');

// Build the HTML (empty string if no email)
const emailHtml = storedEmail
  ? `<span class="user-email">${storedEmail}</span>`
  : '';
    const userMenuContainer = document.getElementById('user-menu-container');
    if (userMenuContainer) {
      userMenuContainer.innerHTML = `
        <div class="user-menu" id="user-menu" data-tooltip="${username}">
          <div class="user-info" id="user-info">
            <img src="${profilePic}" alt="${username}" class="user-avatar" />
            <div class="user-details">
             <h3>${username}</h3>
        ${emailHtml}
            </div>
          </div>
          <div class="dropdown-content hidden" id="dropdown-content">
            <button id="profile-btn">Your Profile</button>
            <button id="back-to-home-btn">Back to Home</button>
            <button id="logout-btn">Logout</button>
          </div>
        </div>`;
    }

    document.getElementById('back-to-home-btn')?.addEventListener('click', e => {
  e.stopPropagation();              // ← prevents the “click-outside” listener from immediately hiding the menu
  window.location.href = 'index.html';
});

document.getElementById('logout-btn')?.addEventListener('click', e => {
  e.stopPropagation();              // ← same here
  localStorage.removeItem('cloverUser');
  localStorage.removeItem('username');
  localStorage.removeItem('profilePic');
 localStorage.removeItem('email');
 localStorage.removeItem('fullName');
  sessionStorage.setItem('logoutStatus','success');
  window.location.href = 'index.html';
});
    document.getElementById('profile-btn')?.addEventListener('click', e => {
      e.stopPropagation();              // ← same here
      window.location.href = 'settings.html#general';
    });

    // Re-wire avatars in the sidebar footer
    document.querySelectorAll('.user-avatar').forEach(img => {
      img.src = profilePic;
      img.alt = username;
    });
  } else {
    document.getElementById('join-btn')
      ?.style.setProperty('display','inline-block','important');
  }
// Sidebar‐footer dropdown
const footer = document.querySelector('.sidebar__footer');
const userMenu = document.getElementById('user-menu');
const dropdownMenu = document.getElementById('dropdown-content');

if (footer && userMenu && dropdownMenu) {
  footer.addEventListener('click', e => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('hidden');
    userMenu.classList.toggle('open');
    userMenu.classList.toggle('tooltip-disabled', !userMenu.classList.contains('open'));
  });
  window.addEventListener('click', e => {
    if (!userMenu.contains(e.target)) {
      dropdownMenu.classList.add('hidden');
      userMenu.classList.remove('open');
      userMenu.classList.add('tooltip-disabled');
    }
  });
  userMenu.addEventListener('mouseleave', () => {
    userMenu.classList.remove('tooltip-disabled');
  });
}

  //
  // 2) Logout-toast helper
  //
  (function(){
    function showToast(msg, isError=false) {
      const t = document.getElementById('toast');
      if (!t) return;
      t.textContent = msg;
      t.className = `toast show${isError ? ' error' : ''}`;
      setTimeout(() => t.classList.remove('show'), 3000);
    }
    const path   = window.location.pathname;
    const status = sessionStorage.getItem('logoutStatus');
    sessionStorage.removeItem('logoutStatus');
    if (status && (path === '/' || path.endsWith('index.html'))) {
      showToast(
        status==='success'
          ? 'You have been logged out successfully'
          : 'Logout failed. Please try again later.',
        status!=='success'
      );
    }
  })();

  //
  // 3) Cnote modal
  //
  (function(){
    const btn   = document.getElementById('cnote-btn'),
          modal = document.getElementById('cnote-modal'),
          close = document.getElementById('close-cnote'),
          badge = document.getElementById('cnote-badge'),
          list  = document.getElementById('cnote-list');
    if (btn && modal && close && badge && list) {
      badge.classList.add('hidden');
      list.innerHTML = '<p>You have no notifications.</p>';
      btn.addEventListener('click',  ()=> modal.classList.remove('hidden'));
      close.addEventListener('click',()=> modal.classList.add('hidden'));
    }
  })();

  //
  // 4) Sidebar toggle & responsive
  //
  (function(){
    const sidebar     = document.getElementById('sidebar'),
          toggleBtn   = document.getElementById('sidebar-toggle'),
          mainContent = document.getElementById('main-content'),
          mobileBtn   = document.getElementById('mobile-menu-btn'),
          overlay     = document.getElementById('mobile-overlay');
    if (!sidebar || !toggleBtn || !mainContent) return;

    // restore persisted
    const stored = localStorage.getItem('sidebarCollapsed');
    if (stored !== null) {
      const c = stored === 'true';
      sidebar.classList.toggle('collapsed', c);
      mainContent.classList.toggle('sidebar-collapsed', c);
      mainContent.classList.toggle('with-sidebar', !c);
    } else {
      mainContent.classList.add('with-sidebar');
    }

    toggleBtn.addEventListener('click', () => {
      const c = sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('sidebar-collapsed', c);
      mainContent.classList.toggle('with-sidebar', !c);
      localStorage.setItem('sidebarCollapsed', c);
    });

    function initSidebar() {
      if (localStorage.getItem('sidebarCollapsed') !== null) return;
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
    }
    window.addEventListener('resize', initSidebar);
    initSidebar();

    // mobile menu
    if (mobileBtn && overlay) {
      mobileBtn.addEventListener('click',()=> {
        const open = sidebar.classList.toggle('open');
        overlay.classList.toggle('visible', open);
        mobileBtn.setAttribute('aria-expanded', `${open}`);
      });
      overlay.addEventListener('click',()=> {
        sidebar.classList.remove('open');
        overlay.classList.remove('visible');
        mobileBtn.setAttribute('aria-expanded','false');
      });
      window.addEventListener('keydown', e=> {
        if (e.key==='Escape') {
          sidebar.classList.remove('open');
          overlay.classList.remove('visible');
          mobileBtn.setAttribute('aria-expanded','false');
        }
      });
    }
  })();


 

  //
   //
  // 5. Sidebar Nav & AJAX loading
  //
  const sidebarItems = document.querySelectorAll('.sidebar__item[data-section]');

  function setActiveSection(section) {
  sidebarItems.forEach(i => {
    i.classList.toggle('active', i.dataset.section === section);
  });
}


sidebarItems.forEach(item => {
  item.addEventListener('click', async e => {
    console.log('Sidebar click →', item.dataset.section);  // ← add this log for debugging
    const sec = item.dataset.section;
    setActiveSection(sec);
    await loadSection(sec);
    history.pushState({ section: sec }, '', `#${sec}`);
  });
});

window.addEventListener('popstate', e => {
  const sec = e.state?.section || 'general';
  setActiveSection(sec);
  loadSection(sec);
});

  async function loadSection(section) {
    const main = document.getElementById('main-content');
    if (!main) return;
    try {
      // → fixed path: load from the “settings/” subfolder next to settings.html
      const res = await fetch(`settings/${section}.html`);
      if (!res.ok) throw new Error(`Failed to load ${section}`);
      main.innerHTML = await res.text();

       // — Immediately re-wire the avatars in the newly injected HTML:
   if (section === 'general') {
 // grab (or generate) the right bg for this user:
  const bg = localStorage.getItem(`avatarBg_${username}`);
const pic = makeAvatarUrl(username, bg);
document.querySelectorAll('#overview-avatar-img, #profile-avatar-img')
        .forEach(img => img.src = pic);

  initGeneralSection();
  initAppearanceToggle();   // ← wire up Light/Dark buttons in the General view


}

      if (section === 'appearance') initAppearanceToggle();
     
      // …and so on for snippets, notifications, etc.
    } catch (err) {
      console.error(err);
      main.innerHTML = `<p class="error">Could not load the ${section} page.</p>`;
    }
  }







// Initial
const initial = location.hash.slice(1) || 'general';
setActiveSection(initial);
loadSection(initial);
history.replaceState({ section: initial }, '', `#${initial}`);




  //
  // 6) Misc protections
  //
  document.addEventListener('selectstart', e => e.preventDefault());
  document.addEventListener('dragstart',  e => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });

}); 


//
// Section-specific initializers
//

// — General Section —  
function initGeneralSection() {
  // — Overview wiring —
  const username = localStorage.getItem('username') || '';
  const USER_KEY = `avatarBg_${username}`;
  let avatarBg = localStorage.getItem(USER_KEY);
  if (!avatarBg) {
    // ← copy your hslToHex/h,s,l code here
    const h = Math.floor(Math.random()*360);
    const s = 30 + Math.random()*20;
    const l = 25 + Math.random()*10;
    avatarBg = hslToHex(h,s,l);         // use your existing helper
    localStorage.setItem(USER_KEY, avatarBg);
  }
  const avatarUrl = makeAvatarUrl(username, avatarBg);

  // — Now paint both overview & profile cards —
  document.querySelectorAll(
    '#overview-avatar-img, #profile-avatar-img'
  ).forEach(img => img.src = avatarUrl);

  const bio      = localStorage.getItem('bio')      || 'No bio found.';
  const joined   = localStorage.getItem('joined')   || 'Date not available';

  
  // text
  const ovUser = document.getElementById('overview-username');
  const ovBio  = document.getElementById('overview-bio');
  const ovJoin = document.getElementById('overview-joined');
  if (ovUser) ovUser.textContent = username;
  if (ovBio ) ovBio .textContent = bio;
  if (ovJoin) ovJoin.textContent = `Joined Clover on ${joined}`;

  // form
  const fn = document.getElementById('full-name'),
        un = document.getElementById('username'),
        em = document.getElementById('email');
  if (fn) fn.value = localStorage.getItem('fullName') || '';
  if (un) un.value = localStorage.getItem('username') || '';
  if (em) em.value = localStorage.getItem('email')    || '';

  // **NEW: if no email, hide the entire profile card and exit**

const profileCard = document.getElementById('card-profile');
if (!em.value) {
  profileCard.style.display = 'none';
}

const emailRow   = document.getElementById('email-row');
if (emailRow) {
  if (em.value) {
    emailRow.style.display = '';
  } else {
    emailRow.style.display = 'none';
  }
}

 // notification modal wiring
const notificationModalElem = document.getElementById('notification-modal');
const notificationOpenBtn   = document.getElementById('open-notification-modal');
const notificationCloseBtn  = document.getElementById('close-notification-modal');
if (notificationModalElem && notificationOpenBtn && notificationCloseBtn) {
  notificationOpenBtn.addEventListener('click', () => {
    notificationModalElem.style.display = 'flex';
  });
  notificationCloseBtn.addEventListener('click', () => {
    notificationModalElem.style.display = 'none';
  });
  notificationModalElem.addEventListener('click', (e) => {
    if (e.target === notificationModalElem) {
      notificationModalElem.style.display = 'none';
    }
  });
}





  const platforms = [
    { name: "GitHub", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
    { name: "Figma", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
    { name: "CodePen", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/codepen/codepen-plain.svg" },
    { name: "Dribbble", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dribbble/dribbble-original.svg" },
    { name: "Twitter", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/twitter/twitter-original.svg" }
  ];

  const modal             = document.getElementById("modal-connected-accounts");
  const closeBtn          = document.getElementById("close-connected-modal");
  const availableList     = document.getElementById("available-platforms");
  const connectedList     = document.getElementById("connected-platforms");
  const connectedContainer= document.getElementById("connected-accounts-container");
  let   connected         = [];

  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

  function renderModalLists() {
    availableList.innerHTML = "";
    connectedList.innerHTML = "";

    platforms.forEach(platform => {
      if (!connected.find(c => c.name === platform.name)) {
        const li = document.createElement("li");
        li.className = "platform-item";
        li.innerHTML = `
          <div class="platform-left">
            <img src="${platform.icon}" alt="${platform.name}">
            <span>${platform.name}</span>
          </div>
          <div class="platform-actions">
            <button onclick="showInputForm('${platform.name}')">+</button>
          </div>
        `;
        availableList.appendChild(li);
      }
    });

    connected.forEach(({ name, icon, url }) => {
      const li = document.createElement("li");
      li.className = "platform-item";
      li.innerHTML = `
        <div class="platform-left">
          <img src="${icon}" alt="${name}">
          <a href="${url}" target="_blank">${name}</a>
        </div>
        <div class="platform-actions">
          <button onclick="removePlatform('${name}')">−</button>
        </div>
      `;
      connectedList.appendChild(li);
    });
  }

  window.showInputForm = function(name) {
    const platform = platforms.find(p => p.name === name);
    const li = document.createElement("li");
    li.className = "platform-item";
    li.innerHTML = `
      <div class="platform-left">
        <img src="${platform.icon}" alt="${platform.name}">
        <span>${platform.name}</span>
      </div>
      <div class="url-input-form">
        <input type="url" placeholder="Enter ${platform.name} URL" required id="url-input-${name}">
        <div class="actions">
          <button class="cancel-btn" onclick="renderModalLists()">Cancel</button>
          <button class="save-btn" onclick="savePlatform('${name}')">Save</button>
        </div>
      </div>
    `;
    availableList.innerHTML = "";
    availableList.appendChild(li);
  };

  window.savePlatform = function(name) {
    const input = document.getElementById(`url-input-${name}`);
    if (!input || !input.value) return alert("Please enter a valid URL");
    const platform = platforms.find(p => p.name === name);
    if (connected.length >= 3)     return alert("You can only connect up to 3 accounts");
    connected.push({ ...platform, url: input.value });
    renderModalLists();
    renderConnectedCard();
  };

  window.removePlatform = function(name) {
    connected = connected.filter(p => p.name !== name);
    renderModalLists();
    renderConnectedCard();
  };

  function renderConnectedCard() {
    connectedContainer.innerHTML = "";

    if (connected.length === 0) {
      const div = document.createElement("div");
      div.className = "empty-state";
      div.textContent = "Connect your social account";
      // re-attach the click handler here
      div.addEventListener("click", () => {
        renderModalLists();
        modal.classList.remove("hidden");
      });
      connectedContainer.appendChild(div);
      return;
    }

    connected.forEach(({ name, icon, url }) => {
      const div = document.createElement("div");
      div.className = "connected-account";
      div.innerHTML = `
        <img src="${icon}" alt="${name}">
        <a href="${url}" target="_blank">${name}</a>
      `;
      connectedContainer.appendChild(div);
    });
  }

  // **INITIALIZE**
  renderModalLists();
  renderConnectedCard();


  

  // Sub-nav
  const subnavButtons = document.querySelectorAll('.general-subnav .subnav-btn');
  subnavButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      subnavButtons.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const related = document.getElementById(`card-${btn.dataset.card}`);
      if (related) related.scrollIntoView({behavior:'auto',block:'start'});
    });
  });


  // Elements & state

  const btnEdit       = document.getElementById('btn-edit-profile');
  const btnSave       = document.getElementById('btn-save-profile');
  const btnCancel     = document.getElementById('btn-cancel-profile');
  // const btnAvatar     = document.getElementById('btn-edit-avatar'); // Removed unused variable
  const fullNameInput = document.getElementById('full-name');
  const usernameInput = document.getElementById('username');
  const emailInput    = document.getElementById('email');
  const inputs        = [fullNameInput, usernameInput, emailInput];
  let originalValues  = {};
 

  // 2) For OAuth-only users, mirror username into full name
  //    (i.e. whenever full-name is blank)
  if (!fullNameInput.value) {
    fullNameInput.value = usernameInput.value;
  }
  // Cancel-modal buttons
  const cancelModal    = document.getElementById('cancel-modal');
  const confirmDiscard = document.getElementById('confirm-discard');
  const cancelDiscard  = document.getElementById('cancel-discard');

  // Validation rules
  const editRules = {
    'full-name': {
      validate: v => v.trim().length >= 5,
      message:  'Full name must be at least 5 characters'
    },
    'username': {
      validate: v => /^(?=.{5,25}$)(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9_-]+$/.test(v),
      message:  'Username must be 5–25 chars, include at least one letter & number'
    },
    'email': {
      validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message:  'Must be a valid email address'
    }
  };
  function validateField(e) {
    const rule = editRules[e.target.id];
    if (!rule) return true;
    const ok = rule.validate(e.target.value);
    e.target.classList.toggle('invalid', !ok);
    e.target.classList.toggle('valid', ok);
    return ok;
  }
  function allValid() {
    return inputs.every(i => validateField({ target: i }));
  }

  // Toast helper
  function showToast(msg, type = 'success') {
    const t = document.createElement('div');
    t.className = `toast show ${type}`;
    t.textContent = msg;
    document.body.append(t);
    setTimeout(() => t.classList.remove('show'), 2500);
    setTimeout(() => t.remove(), 3000);
  }

  // Loader element (one‐time creation)
  let loaderOverlay = document.getElementById('general-loader');
  if (!loaderOverlay) {
    loaderOverlay = document.createElement('div');
    loaderOverlay.id = 'general-loader';
    loaderOverlay.innerHTML = `
      <div class="loader-circle"></div>
      <p>Profile changes are saving…</p>
    `;
    Object.assign(loaderOverlay.style, {
      position:      'fixed',
      top:           0,
      left:          0,
      width:         '100vw',
      height:        '100vh',
      background:    'rgba(255,255,255,0.8)',
      display:       'none',
      alignItems:    'center',
      justifyContent:'center',
      flexDirection: 'column',
      zIndex:        9999
    });
    loaderOverlay.classList.add('flex');
    document.body.append(loaderOverlay);
  }

  // Spinner CSS injection (once)
  if (!document.getElementById('general-loader-style')) {
    const style = document.createElement('style');
    style.id = 'general-loader-style';
    style.textContent = `
      .loader-circle {
        border: 6px solid #eee;
        border-top-color: var(--color-blue);
        border-radius: 50%;
        width: 48px;
        height: 48px;
        animation: spin 1s linear infinite;
        margin-bottom: 0.5rem;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    `;
    document.head.append(style);
  }

  // Helper to refresh avatars in the UI
  // (used after profile save) only
  // → this is a separate function to avoid duplication
function refreshAvatars(name) {
  const USER_KEY = `avatarBg_${name}`;
  let avatarBg   = localStorage.getItem(USER_KEY);

  if (!avatarBg) {
    // generate a brand-new hue for this new username…
    const h = Math.floor(Math.random() * 360);
    const s = 30 + Math.random() * 20;
    const l = 25 + Math.random() * 10;
    avatarBg = hslToHex(h, s, l);
    localStorage.setItem(USER_KEY, avatarBg);
  }

  const url = makeAvatarUrl(name, avatarBg);
  document.querySelectorAll(
    '#overview-avatar-img, #profile-avatar-img, .user-avatar'
  ).forEach(img => img && (img.src = url));

  // also update the sidebar footer at once
  localStorage.setItem('profilePic', url);
}


  // EDIT MODE
  btnEdit.addEventListener('click', () => {
    profileCard.classList.add('editing');
    inputs.forEach(i => {
      originalValues[i.id] = i.value;
      i.removeAttribute('readonly');
      i.addEventListener('input', validateField);
      i.addEventListener('blur',  validateField);
    });
    btnEdit.classList.add('hidden');
    btnSave.classList.remove('hidden');
    btnCancel.classList.remove('hidden');
  });

  // CANCEL FLOW
  btnCancel.addEventListener('click', () => {
    const changed = inputs.some(i => i.value !== originalValues[i.id]);
    if (!changed) return exitEdit();
    cancelModal.style.display = 'flex';
  });
  cancelModal.addEventListener('click', e => {
    if (e.target === cancelModal) cancelModal.style.display = 'none';
  });
  cancelDiscard.addEventListener('click', () => {
    cancelModal.style.display = 'none';
  });
  confirmDiscard.addEventListener('click', () => {
    inputs.forEach(i => i.value = originalValues[i.id]);
    exitEdit();
    cancelModal.style.display = 'none';
  });

  // SAVE FLOW

  
  btnSave.addEventListener('click', async () => {
    if (!allValid()) {
      showToast('Please fix the highlighted fields', 'error');
      return;
    }
    const payload = {
      fullName: fullNameInput.value.trim(),
      username: usernameInput.value.trim(),
      email:    emailInput.value.trim()
    };

    loaderOverlay.style.display = 'flex';
    const start = Date.now();
    let success = false;
console.log('Attempting profile save with token:', localStorage.getItem('cloverToken'));
    // Attempt to save profile
    try {
      const saveRes = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${localStorage.getItem('cloverToken')}`
        },
        body: JSON.stringify(payload)
      });

      
      if (!saveRes.ok) throw new Error('Save failed');

      // Re-fetch fresh profile
      const meRes = await fetch('/api/profile/me', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('cloverToken')}` }
      });
      if (!meRes.ok) throw new Error('Fetch failed');
      const updated = await meRes.json();

      // Update UI & storage
      fullNameInput.value             = updated.fullName;
      usernameInput.value             = updated.username;
      emailInput.value                = updated.email;
      document.getElementById('overview-username').textContent    = updated.username;
      document.querySelector('.user-menu h3').textContent          = updated.username;
      document.querySelector('.user-menu .user-email').textContent = updated.email;
      localStorage.setItem('fullName', updated.fullName);
      localStorage.setItem('username', updated.username);
      localStorage.setItem('email',    updated.email);

      refreshAvatars(updated.username);
      success = true;
    } catch (err) {
      console.error(err);
    }

    const elapsed = Date.now() - start;
    const MIN     = 4000;
    setTimeout(() => {
      loaderOverlay.style.display = 'none';
      exitEdit();
      showToast(success ? 'Profile saved!' : 'Could not save profile. Please try again later.', success ? 'success' : 'error');
    }, Math.max(0, MIN - elapsed));
  });

  // EXIT EDIT MODE
  function exitEdit() {
    profileCard.classList.remove('editing');
    inputs.forEach(i => {
      i.setAttribute('readonly','');
      i.removeEventListener('input',  validateField);
      i.removeEventListener('blur',   validateField);
      i.classList.remove('valid','invalid');
    });
    btnEdit.classList.remove('hidden');
    btnSave.classList.add('hidden');
    btnCancel.classList.add('hidden');
  }
}

// — Appearance Toggle —  
function initAppearanceToggle() {
  console.log('Initializing appearance toggle… ()',)
  const lightBtn = document.getElementById('theme-light');
  const darkBtn  = document.getElementById('theme-dark');
  if (!lightBtn || !darkBtn) return;

  const htmlEl = document.documentElement;
  const PREF_KEY = 'cloverTheme';
  const saved = localStorage.getItem(PREF_KEY);
  if (saved === 'dark') {
    htmlEl.setAttribute('data-theme','dark');
    darkBtn.classList.add('active');
  } else {
    htmlEl.removeAttribute('data-theme');
    lightBtn.classList.add('active');
  }
  function setTheme(mode) {
    console.log(' setTheme called with', mode);

    if (mode === 'dark') {
      htmlEl.setAttribute('data-theme','dark');
      darkBtn.classList.add('active');
      lightBtn.classList.remove('active');
    } else {
      htmlEl.removeAttribute('data-theme');
      lightBtn.classList.add('active');
      darkBtn.classList.remove('active');
    }
    localStorage.setItem(PREF_KEY, mode);
  }
  lightBtn.addEventListener('click', ()=> setTheme('light'));
  darkBtn.addEventListener('click',  ()=> setTheme('dark'));
}

 
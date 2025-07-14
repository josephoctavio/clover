// filter.js — Clover Advanced Filter Sidebar & Accordion System

document.addEventListener('DOMContentLoaded', () => {
  const filterIcon   = document.getElementById('filter-icon');
  const filterPanel  = document.getElementById('advanced-filters');
  const applyBtn     = document.getElementById('apply-filters');
  const clearBtn     = document.getElementById('clear-filters');
  const snippetCards = document.querySelectorAll('.snippet-card');

  if (!filterIcon || !filterPanel || !applyBtn || !clearBtn) {
    console.warn('❌ Filter panel elements not found. Skipping init.');
    return;
  }

  console.log('🌿 Filter system initialized');

  // 1. Toggle sidebar
  filterIcon.addEventListener('click', e => {
    e.stopPropagation();
    filterPanel.classList.toggle('visible');
  });

  // 2. Close on outside click + collapse accordions
  document.addEventListener('click', e => {
    if (!filterPanel.contains(e.target) && !filterIcon.contains(e.target)) {
      filterPanel.classList.remove('visible');
      collapseAllAccordions();
    }
  });

  function collapseAllAccordions() {
    filterPanel.querySelectorAll('.accordion-body').forEach(body => {
      body.style.maxHeight = null;
    });
    filterPanel.querySelectorAll('.accordion-header').forEach(header => {
      header.classList.remove('active');
    });
  }

  // 3. Apply filters
  applyBtn.addEventListener('click', () => {
    const checkedBoxes = filterPanel.querySelectorAll('input[type="checkbox"]:checked');

    const selectedCategories = [];
    const selectedTypes = [];

    checkedBoxes.forEach(cb => {
      const val = cb.value.toLowerCase();
      if (val === 'free' || val === 'premium') {
        selectedTypes.push(val);
      } else {
        selectedCategories.push(val);
      }
    });

    snippetCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category')?.toLowerCase();
      const cardType = card.getAttribute('data-type')?.toLowerCase();

      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(cardCategory);
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(cardType);

      card.style.display = matchesCategory && matchesType ? 'block' : 'none';
    });

    filterPanel.classList.remove('visible');
  });

  // 4. Clear all filters
  clearBtn.addEventListener('click', () => {
    filterPanel.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = false;
    });

    snippetCards.forEach(card => {
      card.style.display = 'block';
    });

    filterPanel.classList.remove('visible');
    collapseAllAccordions();
    console.log('🧹 Cleared all filters');
  });

  // 5. Accordion toggle logic
  const headers = filterPanel.querySelectorAll('.accordion-header');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      header.classList.toggle('active');
      const body = header.nextElementSibling;
      if (header.classList.contains('active')) {
        body.style.maxHeight = body.scrollHeight + 'px';
      } else {
        body.style.maxHeight = null;
      }
    });
  });
});

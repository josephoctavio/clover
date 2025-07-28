// Wait for DOM to load
window.addEventListener('DOMContentLoaded', () => {
  const htmlInput       = document.getElementById('html-code');
  const cssInput        = document.getElementById('css-code');
  const iframe          = document.getElementById('live-preview');
  const resetBtn        = document.getElementById('reset-btn');
  const saveBtn         = document.getElementById('save-draft-btn');
  const loadBtn         = document.getElementById('load-draft-btn');
  const colorBtn        = document.getElementById('color-picker-btn');
  const modal           = document.getElementById('reset-confirm-modal');
  const cancelReset     = document.getElementById('cancel-reset');
  const confirmReset    = document.getElementById('confirm-reset');
  const toast           = document.getElementById('toast');
  const colorContainer  = document.getElementById('color-picker-container');
  const toggle          = document.getElementById('tailwind-toggle');
  const htmlLabel       = document.getElementById('html-label');

  let usingTailwind = false;
  let pickerVisible = false;

  const colorPicker = new iro.ColorPicker(colorContainer, {
    width: 140,
    color: "#ffffff",
    layoutDirection: 'horizontal',
    layout: [
      { component: iro.ui.Box, options: { borderRadius: 0, boxHeight: 160 } },
      { component: iro.ui.Slider, options: { sliderType: 'hue', borderRadius: 0, sliderSize: 8 } }
    ]
  });

  function updatePreview() {
    const html = htmlInput.value;
    const css  = `<style>${cssInput.value}</style>`;
    const tailwindScript = usingTailwind ? `<script src="https://cdn.tailwindcss.com"></script>` : '';
    const head = `
      <meta charset="utf-8">
      ${css}
      ${tailwindScript}
      <style>body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh;}</style>
    `;
    const content = `<!DOCTYPE html><html><head>${head}</head><body>${html}</body></html>`;
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open(); doc.write(content); doc.close();
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // Auto-load draft
  (function loadAuto() {
    const raw = localStorage.getItem('cloverCreateDraft');
    if (raw) {
      try {
        const draft = JSON.parse(raw);
        htmlInput.value  = draft.html || '';
        cssInput.value   = draft.css  || '';
        usingTailwind    = draft.tailwind || false;
        toggle.checked   = usingTailwind;
        toggle.dispatchEvent(new Event('change'));
      } catch {}
    }
    updatePreview();
  })();

  htmlInput.addEventListener('input', updatePreview);
  cssInput.addEventListener('input', updatePreview);
  toggle.addEventListener('change', () => {
    usingTailwind = toggle.checked;
    updatePreview();
    htmlLabel.innerHTML = usingTailwind
      ? `<img src=\"assets/icons/html5.svg\" class=\"editor-icon\"> HTML + <img src=\"assets/icons/tailwind.png\" class=\"editor-icon\"> Tailwind`
      : `<img src=\"assets/icons/html5.svg\" class=\"editor-icon\"> HTML`;
  });

  // Reset confirmation
  resetBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  cancelReset.addEventListener('click', () => modal.classList.add('hidden'));
  confirmReset.addEventListener('click', () => {
    htmlInput.value = '';
    cssInput.value  = '';
    updatePreview();
    modal.classList.add('hidden');
    showToast('🧹 Editor reset!');
  });
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.add('hidden'); });

  // Save draft
  saveBtn.addEventListener('click', () => {
    const h = htmlInput.value.trim();
    const c = cssInput.value.trim();
    if (!h && !c) {
      showToast('❌ Nothing to save');
      return;
    }
    const draft = { html: h, css: c, tailwind: usingTailwind };
    localStorage.setItem('cloverCreateDraft', JSON.stringify(draft));
    showToast('✅ Draft saved!');
  });

  // Load draft
  loadBtn.addEventListener('click', () => {
    const raw = localStorage.getItem('cloverCreateDraft');
    if (!raw) {
      showToast('⚠️ No drafts found');
      return;
    }
    try {
      const draft = JSON.parse(raw);
      htmlInput.value  = draft.html || '';
      cssInput.value   = draft.css  || '';
      usingTailwind    = draft.tailwind || false;
      toggle.checked   = usingTailwind;
      toggle.dispatchEvent(new Event('change'));
      updatePreview();
      showToast('✅ Draft loaded!');
    } catch {
      showToast('⚠️ Failed to load drafts');
    }
  });

  // Auto-save every 10s
  setInterval(() => {
    const draft = { html: htmlInput.value, css: cssInput.value, tailwind: usingTailwind };
    localStorage.setItem('cloverCreateDraft', JSON.stringify(draft));
  }, 10000);

  // Color picker
  colorBtn.addEventListener('click', e => {
    e.stopPropagation(); pickerVisible = !pickerVisible;
    colorContainer.classList.toggle('visible', pickerVisible);
  });
  document.addEventListener('click', e => {
    if (!colorContainer.contains(e.target) && !colorBtn.contains(e.target)) {
      pickerVisible = false; colorContainer.classList.remove('visible');
    }
  });
  colorPicker.on('color:change', color => { iframe.style.backgroundColor = color.hexString; });
  colorContainer.addEventListener('wheel', e => e.stopPropagation(), { passive: false });
  colorContainer.addEventListener('touchmove', e => e.stopPropagation(), { passive: false });

  updatePreview();
});

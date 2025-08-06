// create.js
// Main functionality for Clover Create Snippet page with CodeMirror integration

// Wait for DOM to load
window.addEventListener('DOMContentLoaded', () => {
   // Original textarea elements
   const htmlTextarea = document.getElementById('html-code');
   const cssTextarea  = document.getElementById('css-code');
   const iframe       = document.getElementById('live-preview');

   // Toolbar buttons
   const resetBtn  = document.getElementById('reset-btn');
   const saveBtn   = document.getElementById('save-draft-btn');
   const loadBtn   = document.getElementById('load-draft-btn');
   const colorBtn  = document.getElementById('color-picker-btn');

   // Labels
   const toggle         = document.getElementById('tailwind-toggle');
   const toggleLabel    = document.querySelector('.toggle-label');
   const htmlLabel      = document.getElementById('html-label');

   // State
   let usingTailwind = false;
   let pickerVisible = false;
   let isDirty       = false;

  // Keyboard shortcut handling
  let isCtrlPressed = false;
  const shortcutPanel = document.getElementById('shortcut-panel');

  // Show shortcut panel when Ctrl is pressed
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Control' || e.key === 'Meta') {
      isCtrlPressed = true;
      if (shortcutPanel) {
        shortcutPanel.classList.remove('hidden');
      }
    }
    
    // Ctrl + S - Save Snippet
    if ((e.ctrlKey || e.metaKey) && e.key === 's' && !e.shiftKey) {
      e.preventDefault();
      saveBtn.click();
    }
    
    // Ctrl + K - Toggle Color Picker
    if ((e.ctrlKey || e.metaKey) && e.key === 'k' && !e.shiftKey) {
      e.preventDefault();
      colorBtn.click();
    }
    
    // Ctrl + / - Comment Code
    if ((e.ctrlKey || e.metaKey) && e.key === '/' && !e.shiftKey) {
      e.preventDefault();
      
      // Determine which editor has focus
      let activeEditor = null;
      if (htmlEditor.hasFocus()) {
        activeEditor = htmlEditor;
      } else if (cssEditor.hasFocus()) {
        activeEditor = cssEditor;
      }
      
      if (activeEditor) {
        const selection = activeEditor.getSelection();
        if (selection) {
          // Check if selection is already commented
          let isCommented = false;
          let uncommentedSelection = selection;
          
          if (activeEditor === htmlEditor) {
            // Check for HTML comments
            const trimmedSelection = selection.trim();
            if (trimmedSelection.startsWith('<!--') && trimmedSelection.endsWith('-->')) {
              isCommented = true;
              uncommentedSelection = trimmedSelection.substring(4, trimmedSelection.length - 3).trim();
            }
          } else if (activeEditor === cssEditor) {
            // Check for CSS comments
            const trimmedSelection = selection.trim();
            if (trimmedSelection.startsWith('/*') && trimmedSelection.endsWith('*/')) {
              isCommented = true;
              uncommentedSelection = trimmedSelection.substring(2, trimmedSelection.length - 2).trim();
            }
          }
          
          // Toggle comment
          if (isCommented) {
            // Uncomment
            if (activeEditor === htmlEditor) {
              activeEditor.replaceSelection(uncommentedSelection);
            } else if (activeEditor === cssEditor) {
              activeEditor.replaceSelection(uncommentedSelection);
            }
          } else {
            // Comment
            if (activeEditor === htmlEditor) {
              activeEditor.replaceSelection('<!-- ' + selection + ' -->');
            } else if (activeEditor === cssEditor) {
              activeEditor.replaceSelection('/* ' + selection + ' */');
            }
          }
        } else {
          // If no selection, comment the current line
          const cursor = activeEditor.getCursor();
          const line = activeEditor.getLine(cursor.line);
          
          if (activeEditor === htmlEditor) {
            // Check if line is already commented
            if (line.trim().startsWith('<!--') && line.trim().endsWith('-->')) {
              // Uncomment the line
              const uncommentedLine = line.replace(/<!--\s*(.*?)\s*-->/, '$1');
              activeEditor.replaceRange(uncommentedLine, 
                {line: cursor.line, ch: 0}, 
                {line: cursor.line, ch: line.length});
            } else {
              // Comment the line
              const commentedLine = '<!-- ' + line + ' -->';
              activeEditor.replaceRange(commentedLine, 
                {line: cursor.line, ch: 0}, 
                {line: cursor.line, ch: line.length});
            }
          } else if (activeEditor === cssEditor) {
            // Check if line is already commented
            if (line.trim().startsWith('/*') && line.trim().endsWith('*/')) {
              // Uncomment the line
              const uncommentedLine = line.replace(/\/\*\s*(.*?)\s*\*\//, '$1');
              activeEditor.replaceRange(uncommentedLine, 
                {line: cursor.line, ch: 0}, 
                {line: cursor.line, ch: line.length});
            } else {
              // Comment the line
              const commentedLine = '/* ' + line + ' */';
              activeEditor.replaceRange(commentedLine, 
                {line: cursor.line, ch: 0}, 
                {line: cursor.line, ch: line.length});
            }
          }
        }
      }
    }
    
    // Ctrl + Shift + S - Open Settings Panel (using existing save draft button as placeholder)
    if ((e.ctrlKey || e.metaKey) && e.key === 'S' && e.shiftKey) {
      e.preventDefault();
      // This could be expanded to open a real settings panel if one exists
      saveBtn.click();
    }
    
    // Ctrl + B - Toggle Tailwind On/Off
    if ((e.ctrlKey || e.metaKey) && e.key === 'b' && !e.shiftKey) {
      e.preventDefault();
      // Directly toggle the state instead of clicking the element
      usingTailwind = !usingTailwind;
      toggle.checked = usingTailwind;
      updateToggleLabel();
      updateHtmlLabel();
      persistTools();
      isDirty = true;
      updatePreview();
    }
    
    // Ctrl + Shift + X - Reset Snippet
    if ((e.ctrlKey || e.metaKey) && e.key === 'X' && e.shiftKey) {
      e.preventDefault();
      resetBtn.click();
    }
  });

  // Hide shortcut panel when Ctrl is released
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Control' || e.key === 'Meta') {
      isCtrlPressed = false;
      // Don't hide the panel immediately, let it stay visible for a short time
      setTimeout(() => {
        if (shortcutPanel && !isCtrlPressed) {
          shortcutPanel.classList.add('hidden');
        }
      }, 500);
    }
  });

  // Initialize CodeMirror on HTML textarea
  const htmlEditor = CodeMirror.fromTextArea(htmlTextarea, {
    mode: 'htmlmixed',
    lineNumbers: true,
    theme: 'material',
    autoCloseTags: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    lineWrapping: true,
  });
  htmlEditor.getWrapperElement().classList.add('CodeMirror-scrollbar-fancy');
  htmlEditor.getScrollerElement().style.overflow = 'auto';

  // Initialize CodeMirror on CSS textarea
  const cssEditor = CodeMirror.fromTextArea(cssTextarea, {
    mode: 'css',
    lineNumbers: true,
    theme: 'material',
    autoCloseBrackets: true,
    matchBrackets: true,
    lineWrapping: true,
  });
  cssEditor.getWrapperElement().classList.add('CodeMirror-scrollbar-fancy');
  cssEditor.getScrollerElement().style.overflow = 'auto';

  // Helper functions
  function updateToggleLabel() {
    toggleLabel.textContent = usingTailwind
      ? 'Tailwind Activated'
      : 'Tailwind Deactivated';
  }

  function updateHtmlLabel() {
    htmlLabel.innerHTML = usingTailwind
      ? `<img src="assets/icons/html5.svg" class="editor-icon"> HTML + <img src="assets/icons/tailwind.png" class="editor-icon"> Tailwind`
      : `<img src="assets/icons/html5.svg" class="editor-icon"> HTML`;
  }

  function sanitizeInput(input) {
    input = input.replace(/<!DOCTYPE[\s\S]*?>/gi, '');
    input = input.replace(/<script\b[\s\S]*?<\/script>/gi, '');
    input = input.replace(/<\s*\/?\s*(style|iframe|object|embed|link|meta)[^>]*?>/gi, '');
    return input;
  }

  function enforceLengthLimit(input, maxLength = 20000) {
    return input.length > maxLength
      ? input.slice(0, maxLength)
      : input;
  }

  // — Toggle color picker panel on/off with floating button —
  const pickerBtn   = document.getElementById('color-picker-btn');
  const pickerPanel = document.getElementById('color-picker-container');

  // Hide it by default (on refresh/load)
  pickerPanel.classList.remove('visible');

  pickerBtn.addEventListener('click', () => {
    pickerPanel.classList.toggle('visible');
  });

  // — Initialize iro.ColorPicker on the container itself, with both Box + Hue slider in one layout —
  const colorPicker = new iro.ColorPicker('#color-picker-container', {
    width: 200,
    layoutDirection: 'vertical',
    layout: [
      {
        component: iro.ui.Box,
        options: {
          boxHeight: 120,
          borderWidth: 2,
          borderColor: '#444'
        }
      },
      {
        component: iro.ui.Slider,
        options: {
          sliderType: 'hue',
          sliderOrientation: 'horizontal',
          sliderSize: 10
        }
      }
    ],
    color: '#ffffff'
  });

  // Core preview logic
  function updatePreview() {
    // Get raw user inputs, enforce limits and sanitize
    let rawHtml = enforceLengthLimit(htmlEditor.getValue(), 20000);
    let rawCss  = enforceLengthLimit(cssEditor.getValue(), 10000);

    rawHtml = sanitizeInput(rawHtml);

    const cssTag = `<style>${rawCss}</style>`;
    const twScript = usingTailwind
      ? '<script src="https://cdn.tailwindcss.com"></script>'
      : '';
    const noScrollStyle = `
      <style>
        html, body {
          margin: 0;
          padding: 0;
          overflow: hidden !important;
          max-width: 100vw;
          max-height: 100vh;
        }
      </style>
    `;
    const head = `
      <meta charset="utf-8">
      ${twScript}
      ${cssTag}
      ${noScrollStyle}
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
      </style>
    `;
    const full = `<html><head>${head}</head><body>${rawHtml}</body></html>`;

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(full);
    doc.close();
  }

  // Close picker on outside click
  document.addEventListener('click', (e) => {
    if (
      pickerPanel.classList.contains('visible') &&
      !pickerPanel.contains(e.target) &&
      !pickerBtn.contains(e.target)
    ) {
      pickerPanel.classList.remove('visible');
    }
  });

  // (call updatePreview() initially and on editor changes…)
// — DOM references for inputs and eyedropper —
const [v1, v2, v3] = ['value-1', 'value-2', 'value-3'].map(id => document.getElementById(id));
const eyedropper = document.getElementById('eyedropper-btn');

// — Clamp helper to keep values within 0–255 —
const clamp = (val) => Math.max(0, Math.min(255, parseInt(val) || 0));

// — Update inputs whenever the color changes (RGB only) —
colorPicker.on('color:change', color => {
  v1.value = color.rgb.r;
  v2.value = color.rgb.g;
  v3.value = color.rgb.b;
});

// — Push manual input changes back into the picker (RGB only) —
[v1, v2, v3].forEach(input => {
  input.addEventListener('change', () => {
    const newColor = {
      r: clamp(v1.value),
      g: clamp(v2.value),
      b: clamp(v3.value)
    };
    colorPicker.color.set(newColor);
  });
});

// — Eyedropper integration using the browser API —
eyedropper.addEventListener('click', async () => {
  if (!window.EyeDropper) {
    return alert('Eyedropper API not supported in this browser.');
  }
  try {
    const { sRGBHex } = await new EyeDropper().open();
    colorPicker.color.hexString = sRGBHex;
  } catch (err) {
    console.error('Eyedropper failed or canceled', err);
  }
});

// — Move the eyedropper button below the slider —
{
  const container = document.getElementById('color-picker-container');
  const sliderEl = container.querySelector('.iro-slider');
  if (sliderEl) {
    sliderEl.insertAdjacentElement('afterend', eyedropper);
  }
}

// Core preview logic
function updatePreview() {
  // Get raw user inputs
  let rawHtml = htmlEditor.getValue();
  let rawCss  = cssEditor.getValue();

  // 1) Enforce a maximum length on HTML
  const MAX_HTML_LENGTH = 20000;
  if (rawHtml.length > MAX_HTML_LENGTH) {
    rawHtml = rawHtml.slice(0, MAX_HTML_LENGTH);
    console.warn(`HTML input exceeded ${MAX_HTML_LENGTH} chars; truncated.`);
  }

  // 2) Sanitize HTML to strip forbidden tags
  rawHtml = sanitizeInput(rawHtml);

  // Wrap CSS in a <style> tag
  const cssTag = `<style>${rawCss}</style>`;

  // Include Tailwind if toggled
  const twScript = usingTailwind
    ? '<script src="https://cdn.tailwindcss.com"></script>'
    : '';

  // Prevent scrollbars inside iframe
  const noScrollStyle = `
    <style>
      html, body {
        margin: 0;
        padding: 0;
        overflow: hidden !important;
        max-width: 100vw;
        max-height: 100vh;
      }
    </style>
  `;

  // Build head content
  const head = `
    <meta charset="utf-8">
    ${twScript}
    ${cssTag}
    ${noScrollStyle}
    <style>
      body {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
    </style>
  `;
htmlEditor.on('change', () => {
  const MAX_HTML_LENGTH = 20000;
  const content = htmlEditor.getValue();
  if (content.length > MAX_HTML_LENGTH) {
    htmlEditor.setValue(content.slice(0, MAX_HTML_LENGTH));
    alert(`HTML input is limited to ${MAX_HTML_LENGTH} characters.`);
  }
});

cssEditor.on('change', () => {
  const MAX_CSS_LENGTH = 10000;
  const content = cssEditor.getValue();
  if (content.length > MAX_CSS_LENGTH) {
    cssEditor.setValue(content.slice(0, MAX_CSS_LENGTH));
    alert(`CSS input is limited to ${MAX_CSS_LENGTH} characters.`);
  }
});

  // Assemble full document (omit original <!DOCTYPE> since sanitized)
  const full = `<html><head>${head}</head><body>${rawHtml}</body></html>`;

  // Write to iframe
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(full);
  doc.close();
}

// Ensure color picker is hidden on load
pickerPanel.classList.remove('visible');

// Toggle on button click
pickerBtn.addEventListener('click', () => {
  pickerPanel.classList.toggle('visible');
});

// Close picker on outside click
document.addEventListener('click', (e) => {
  if (
    pickerPanel.classList.contains('visible') &&
    !pickerPanel.contains(e.target) &&
    !pickerBtn.contains(e.target)
  ) {
    pickerPanel.classList.remove('visible');
  }
});

  // Toasts
  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }
  function showAutoToast(msg) {
    const autoToast = document.getElementById('auto-toast');
    autoToast.textContent = msg;
    autoToast.classList.add('show');
    setTimeout(() => autoToast.classList.remove('show'), 2000);
  }

  // Persistence of UI state
  function persistTools() {
    localStorage.setItem('cloverTools', JSON.stringify({
      tailwind: usingTailwind,
      color: colorPicker.color.hexString
    }));
  }

  // Restore tools state
  const tools = JSON.parse(localStorage.getItem('cloverTools') || '{}');
  usingTailwind = !!tools.tailwind;
  toggle.checked = usingTailwind;
  updateToggleLabel();
  updateHtmlLabel();
  if (tools.color) {
    iframe.style.backgroundColor = tools.color;
    colorPicker.color.hexString = tools.color;
  }

    // Clear editors on load; user must click Load Draft to restore
  htmlEditor.setValue('');
  cssEditor.setValue('');
  updatePreview();

  // Track changes
  htmlEditor.on('change', () => { isDirty = true; updatePreview(); });
  cssEditor.on('change', () => { isDirty = true; updatePreview(); });

  // Toggle handler
  toggle.addEventListener('change', () => {
    usingTailwind = toggle.checked;
    updateToggleLabel();
    updateHtmlLabel();
    persistTools();
    isDirty = true;
    updatePreview();
  });

  // Reset
  resetBtn.addEventListener('click', () => document.getElementById('reset-confirm-modal').classList.remove('hidden'));
  document.getElementById('cancel-reset').addEventListener('click', () => document.getElementById('reset-confirm-modal').classList.add('hidden'));
  document.getElementById('confirm-reset').addEventListener('click', () => {
    htmlEditor.setValue('');
    cssEditor.setValue('');
    usingTailwind = false;
    toggle.checked = false;
    updateToggleLabel();
    updateHtmlLabel();
    iframe.style.backgroundColor = '#ffffffff';
    colorPicker.color.hexString = '#ffffff';
    updatePreview();
    localStorage.removeItem('cloverManualDraft');
    localStorage.removeItem('cloverAutoDraft');
    localStorage.removeItem('cloverTools');
    document.getElementById('reset-confirm-modal').classList.add('hidden');
    showToast('🧹 Editor reset!');
  });

  // Manual save/load
  saveBtn.addEventListener('click', () => {
    const html = htmlEditor.getValue().trim();
    const css  = cssEditor.getValue().trim();
    if (!html && !css) return showToast('❌ Nothing to save');
    localStorage.setItem('cloverManualDraft', JSON.stringify({ html, css, tailwind: usingTailwind }));
    isDirty = false;
    showToast('✅ Draft saved!');
  });
  loadBtn.addEventListener('click', () => {
    const raw = localStorage.getItem('cloverManualDraft');
    if (!raw) return showToast('⚠️ No saved drafts found');
    try {
      const d = JSON.parse(raw);
      htmlEditor.setValue(d.html || '');
      cssEditor.setValue(d.css || '');
      usingTailwind = !!d.tailwind;
      toggle.checked = usingTailwind;
      updateToggleLabel();
      updateHtmlLabel();
      updatePreview();
      isDirty = false;
      showToast('✅ Draft loaded!');
    } catch {
      showToast('⚠️ Failed to load drafts');
    }
  });

  // Auto-save (runs every 10s)
setInterval(() => {
  if (!isDirty) return;
  const html = htmlEditor.getValue().trim();
  const css  = cssEditor.getValue().trim();
  if (!html && !css) return;
  // Save to auto draft storage
  const draft = { html, css, tailwind: usingTailwind };
  localStorage.setItem('cloverAutoDraft', JSON.stringify(draft));
  // Also update manual draft so it appears in drafts list
  localStorage.setItem('cloverManualDraft', JSON.stringify(draft));
  isDirty = false;
  showAutoToast('💾 Auto saved');
}, 10000);

  // Color picker
  colorBtn.addEventListener('click', e => {
    e.stopPropagation();
    pickerVisible = !pickerVisible;
    document.getElementById('color-picker-container').classList.toggle('visible', pickerVisible);
  });
  document.addEventListener('click', e => {
    const container = document.getElementById('color-picker-container');
    if (!container.contains(e.target) && !document.getElementById('color-picker-btn').contains(e.target)) {
      pickerVisible = false;
      container.classList.remove('visible');
    }
  });
  colorPicker.on('color:change', color => {
    document.getElementById('live-preview').style.backgroundColor = color.hexString;
    persistTools();
    isDirty = true;
  });
  // Reset toggle and color picker on page unload
  window.addEventListener('beforeunload', () => {
    // Reset to defaults
    usingTailwind = false;
    toggle.checked = false;
    updateToggleLabel();
    updateHtmlLabel();

    // Reset preview background and color picker
    iframe.style.backgroundColor = '#aaaaaaff'; // default ash grey
    colorPicker.color.hexString = '#aaaaaaff';

    // Persist defaults
    persistTools();
  });
});

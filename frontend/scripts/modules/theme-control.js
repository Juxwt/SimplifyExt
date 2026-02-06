// Theme Control Component - Handles theme and font size UI/logic
(function() {
  window.SimplifyThemeControl = {
    currentTheme: window.SimplifyConfig.DEFAULT_THEME,
    fontSize: window.SimplifyConfig.DEFAULT_FONT_SIZE,

    get themes() {
      return window.SimplifyConfig.themes;
    },

    // Create the theme toggle controls
    create: function() {
      const themeContainer = document.createElement('div');
      themeContainer.className = 'theme-controls';
      themeContainer.style.display = 'flex';
      themeContainer.style.alignItems = 'center';
      themeContainer.style.gap = '8px';
      themeContainer.style.marginBottom = '16px';
      themeContainer.style.paddingBottom = '16px';
      themeContainer.style.borderBottom = '1px solid rgba(0, 0, 0, 0.1)';
      
      const label = document.createElement('span');
      label.innerText = 'Theme:';
      label.style.fontSize = '14px';
      label.style.color = this.themes[this.currentTheme].textColor;
      label.style.marginRight = '4px';
      label.style.flexShrink = '0';
      
      const themes = window.SimplifyConfig.themeOptions;
      
      themeContainer.appendChild(label);
      
      for (const themeOption of themes) {
        const btn = document.createElement('button');
        btn.innerHTML = `${themeOption.emoji} ${themeOption.label}`;
        btn.style.padding = '6px 12px';
        btn.style.fontSize = '13px';
        btn.style.border = '2px solid';
        btn.style.borderColor = this.currentTheme === themeOption.name ? '#1976d2' : '#ccc';
        btn.style.borderRadius = '6px';
        btn.style.cursor = 'pointer';
        btn.style.backgroundColor = this.currentTheme === themeOption.name ? '#e3f2fd' : 'transparent';
        btn.style.color = this.themes[this.currentTheme].textColor;
        btn.style.transition = 'all 0.2s';
        
        btn.addEventListener('click', () => {
          this.currentTheme = themeOption.name;
          this.applyTheme();
        });
        
        themeContainer.appendChild(btn);
      }
      
      // Add font size controls
      const fontSizeControl = this._createFontSizeControl();
      themeContainer.appendChild(fontSizeControl);
      
      return themeContainer;
    },

    // Create font size controls
    _createFontSizeControl: function() {
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.gap = '8px';
      
      const label = document.createElement('span');
      label.innerText = 'Text Size:';
      label.style.fontSize = '14px';
      label.style.color = this.themes[this.currentTheme].textColor;
      
      const decreaseBtn = document.createElement('button');
      decreaseBtn.innerText = 'A-';
      decreaseBtn.style.padding = '6px 12px';
      decreaseBtn.style.fontSize = '14px';
      decreaseBtn.style.border = '1px solid #ccc';
      decreaseBtn.style.borderRadius = '6px';
      decreaseBtn.style.cursor = 'pointer';
      decreaseBtn.style.backgroundColor = 'transparent';
      decreaseBtn.style.color = this.themes[this.currentTheme].textColor;
      decreaseBtn.style.transition = 'all 0.2s';
      decreaseBtn.addEventListener('click', () => {
        if (this.fontSize > window.SimplifyConfig.MIN_FONT_SIZE) {
          this.fontSize -= window.SimplifyConfig.FONT_SIZE_STEP;
          this.applyFontSize();
        }
      });
      
      const increaseBtn = document.createElement('button');
      increaseBtn.innerText = 'A+';
      increaseBtn.style.padding = '6px 12px';
      increaseBtn.style.fontSize = '14px';
      increaseBtn.style.border = '1px solid #ccc';
      increaseBtn.style.borderRadius = '6px';
      increaseBtn.style.cursor = 'pointer';
      increaseBtn.style.backgroundColor = 'transparent';
      increaseBtn.style.color = this.themes[this.currentTheme].textColor;
      increaseBtn.style.transition = 'all 0.2s';
      increaseBtn.addEventListener('click', () => {
        if (this.fontSize < window.SimplifyConfig.MAX_FONT_SIZE) {
          this.fontSize += window.SimplifyConfig.FONT_SIZE_STEP;
          this.applyFontSize();
        }
      });
      
      container.appendChild(label);
      container.appendChild(decreaseBtn);
      container.appendChild(increaseBtn);
      
      return container;
    },

    // Apply theme to all elements
    applyTheme: function() {
      const theme = this.themes[this.currentTheme];
      
      // Update panel background
      const panel = document.getElementById('simplify-panel');
      if (panel) {
        panel.style.backgroundColor = theme.bgColor;
      }
      
      // Update all headings
      const headings = document.querySelectorAll('#simplify-overlay h1, #simplify-overlay h2');
      for (const heading of headings) {
        heading.style.color = theme.headingColor;
      }
      
      // Update all text content
      const texts = document.querySelectorAll('#simplify-overlay p, #simplify-overlay li, #simplify-overlay span');
      for (const text of texts) {
        if (!text.style.color || text.style.color.includes('666') || text.style.color.includes('555') || text.style.color.includes('333')) {
          text.style.color = theme.textColor;
        }
      }
      
      // Update theme toggle buttons
      const themeButtons = document.querySelectorAll('#simplify-overlay button');
      for (const btn of themeButtons) {
        if (btn.innerText.includes('☀️') || btn.innerText.includes('📜')) {
          const themeName = btn.innerText.includes('☀️') ? 'light' : 'sepia';
          btn.style.borderColor = this.currentTheme === themeName ? '#1976d2' : '#ccc';
          btn.style.backgroundColor = this.currentTheme === themeName ? '#e3f2fd' : 'transparent';
          btn.style.color = theme.textColor;
        }
      }
      
      // Also update actions layer if it exists
      const actionsLayer = document.getElementById('simplify-actions-layer');
      if (actionsLayer && window.SimplifyActionsLayer) {
        window.SimplifyActionsLayer._applyTheme(actionsLayer);
      }
    },

    // Apply font size to content
    applyFontSize: function() {
      // Update all content text
      const paragraphs = document.querySelectorAll('#simplify-overlay p');
      for (const p of paragraphs) {
        if (p.style.fontSize) {
          p.style.fontSize = this.fontSize + 'px';
        }
      }
      
      const lists = document.querySelectorAll('#simplify-overlay ul, #simplify-overlay li');
      for (const list of lists) {
        if (list.style.fontSize) {
          list.style.fontSize = this.fontSize + 'px';
        }
      }
      
      // Also update actions layer if it exists
      const actionsLayer = document.getElementById('simplify-actions-layer');
      if (actionsLayer && window.SimplifyActionsLayer) {
        window.SimplifyActionsLayer._applyFontSize(actionsLayer);
      }
    }
  };
})();

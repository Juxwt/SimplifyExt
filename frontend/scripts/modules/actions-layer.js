// Actions Layer Module - Handles the full-screen actions list UI
(function() {
  window.SimplifyActionsLayer = {
    /**
     * Shows full-screen scrollable list of all page actions
     */
    show: async function() {
      const currentTheme = window.SimplifyThemeControl.currentTheme;
      const theme = window.SimplifyConfig.themes[currentTheme];
      
      // Create actions layer overlay immediately with loading state
      const actionsLayer = document.createElement('div');
      actionsLayer.id = 'simplify-actions-layer';
      actionsLayer.style.position = 'fixed';
      actionsLayer.style.top = '0';
      actionsLayer.style.left = '0';
      actionsLayer.style.width = '100%';
      actionsLayer.style.height = '100%';
      actionsLayer.style.backgroundColor = theme.bgColor;
      actionsLayer.style.zIndex = '1000010';
      actionsLayer.style.overflowY = 'auto';
      actionsLayer.style.padding = '24px';
      actionsLayer.style.animation = 'slideUp 0.3s ease-out';
      actionsLayer.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';

      // Header with back button
      const header = this._createHeader(actionsLayer, theme);
      actionsLayer.appendChild(header);
      
      // Add theme and font controls
      const controlsWrapper = document.createElement('div');
      controlsWrapper.style.marginBottom = '16px';
      const themeToggle = this._createThemeToggle(actionsLayer, theme);
      controlsWrapper.appendChild(themeToggle);
      actionsLayer.appendChild(controlsWrapper);

      const loadingIndicator = header.querySelector('[data-loading]');

      // Add to page immediately to show loading state
      document.body.appendChild(actionsLayer);

      // Scan page for actions
      const rawActions = window.SimplifyActionFinder.scan();
      
      if (rawActions.length === 0) {
        loadingIndicator.innerHTML = '<span style="color: #ff0000;">No interactive elements found on this page.</span>';
        setTimeout(() => {
          document.body.removeChild(actionsLayer);
        }, 2000);
        return;
      }

      // Filter with AI
      const actions = await window.SimplifyActionFinder.filterWithAI(rawActions);

      // Update header with count
      loadingIndicator.remove();
      const count = document.createElement('span');
      count.innerText = `(${actions.length})`;
      count.style.fontSize = '20px';
      count.style.color = theme.textColor;
      header.appendChild(count);

      // Actions list
      const actionsList = this._createActionsList(actions, actionsLayer, theme);
      actionsLayer.appendChild(actionsList);
    },

    _createHeader: function(actionsLayer, theme) {
      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.alignItems = 'center';
      header.style.gap = '16px';
      header.style.marginBottom = '24px';
      header.style.position = 'sticky';
      header.style.top = '0';
      header.style.backgroundColor = theme.bgColor;
      header.style.paddingBottom = '12px';
      header.style.borderBottom = '1px solid rgba(0, 0, 0, 0.1)';
      header.style.zIndex = '10';

      const backBtn = document.createElement('button');
      backBtn.innerText = '← Back';
      backBtn.style.background = 'transparent';
      backBtn.style.border = 'none';
      backBtn.style.fontSize = '18px';
      backBtn.style.cursor = 'pointer';
      backBtn.style.color = '#1976d2';
      backBtn.style.padding = '8px';
      backBtn.addEventListener('click', () => {
        document.body.removeChild(actionsLayer);
      });

      const title = document.createElement('h1');
      title.innerText = 'Page Actions';
      title.style.fontSize = '28px';
      title.style.color = theme.headingColor;
      title.style.margin = '0';

      const loadingIndicator = document.createElement('div');
      loadingIndicator.setAttribute('data-loading', 'true');
      loadingIndicator.style.display = 'flex';
      loadingIndicator.style.alignItems = 'center';
      loadingIndicator.style.gap = '8px';
      loadingIndicator.style.fontSize = '16px';
      loadingIndicator.style.color = theme.textColor;
      
      const spinner = document.createElement('span');
      spinner.innerHTML = '⏳';
      spinner.style.animation = 'spin 1s linear infinite';
      
      const loadingText = document.createElement('span');
      loadingText.innerText = 'Curating actions...';
      
      loadingIndicator.appendChild(spinner);
      loadingIndicator.appendChild(loadingText);

      header.appendChild(backBtn);
      header.appendChild(title);
      header.appendChild(loadingIndicator);

      return header;
    },

    _createThemeToggle: function(actionsLayer, theme) {
      const currentTheme = window.SimplifyThemeControl.currentTheme;
      
      const themeContainer = document.createElement('div');
      themeContainer.style.display = 'flex';
      themeContainer.style.alignItems = 'center';
      themeContainer.style.gap = '8px';
      themeContainer.style.paddingBottom = '16px';
      themeContainer.style.borderBottom = '1px solid rgba(0, 0, 0, 0.1)';
      
      const label = document.createElement('span');
      label.innerText = 'Theme:';
      label.style.fontSize = '14px';
      label.style.color = theme.textColor;
      label.style.marginRight = '4px';
      label.style.flexShrink = '0';
      
      const themes = [
        { name: 'light', emoji: '☀️', label: 'Light' },
        { name: 'sepia', emoji: '📜', label: 'Sepia' }
      ];
      
      themeContainer.appendChild(label);
      
      for (const themeOption of themes) {
        const btn = document.createElement('button');
        btn.innerHTML = `${themeOption.emoji} ${themeOption.label}`;
        btn.style.padding = '6px 12px';
        btn.style.fontSize = '13px';
        btn.style.border = currentTheme === themeOption.name ? '2px solid #1976d2' : '2px solid #ccc';
        btn.style.borderRadius = '6px';
        btn.style.cursor = 'pointer';
        btn.style.backgroundColor = currentTheme === themeOption.name ? '#e3f2fd' : 'transparent';
        btn.style.color = theme.textColor;
        btn.style.transition = 'all 0.2s';
        
        btn.addEventListener('click', () => {
          window.SimplifyThemeControl.currentTheme = themeOption.name;
          window.SimplifyThemeControl.applyTheme();
          this._applyTheme(actionsLayer);
        });
        
        themeContainer.appendChild(btn);
      }
      
      // Add font size controls
      const fontSizeControl = this._createFontSizeControl(actionsLayer, theme);
      themeContainer.appendChild(fontSizeControl);
      
      return themeContainer;
    },

    _createFontSizeControl: function(actionsLayer, theme) {
      const fontSize = window.SimplifyThemeControl.fontSize;
      
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.gap = '8px';
      
      const label = document.createElement('span');
      label.innerText = 'Text Size:';
      label.style.fontSize = '14px';
      label.style.color = theme.textColor;
      
      const decreaseBtn = document.createElement('button');
      decreaseBtn.innerText = 'A-';
      decreaseBtn.style.padding = '6px 12px';
      decreaseBtn.style.fontSize = '14px';
      decreaseBtn.style.border = '1px solid #ccc';
      decreaseBtn.style.borderRadius = '6px';
      decreaseBtn.style.cursor = 'pointer';
      decreaseBtn.style.backgroundColor = 'transparent';
      decreaseBtn.style.color = theme.textColor;
      decreaseBtn.style.transition = 'all 0.2s';
      decreaseBtn.addEventListener('click', () => {
        if (window.SimplifyThemeControl.fontSize > 14) {
          window.SimplifyThemeControl.fontSize -= 2;
          window.SimplifyThemeControl.applyFontSize();
          this._applyFontSize(actionsLayer);
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
      increaseBtn.style.color = theme.textColor;
      increaseBtn.style.transition = 'all 0.2s';
      increaseBtn.addEventListener('click', () => {
        if (window.SimplifyThemeControl.fontSize < 26) {
          window.SimplifyThemeControl.fontSize += 2;
          window.SimplifyThemeControl.applyFontSize();
          this._applyFontSize(actionsLayer);
        }
      });
      
      container.appendChild(label);
      container.appendChild(decreaseBtn);
      container.appendChild(increaseBtn);
      
      return container;
    },

    _createActionsList: function(actions, actionsLayer, theme) {
      const fontSize = window.SimplifyThemeControl.fontSize;
      
      const actionsList = document.createElement('div');
      actionsList.id = 'actions-list';
      actionsList.style.display = 'flex';
      actionsList.style.flexDirection = 'column';
      actionsList.style.gap = '12px';

      for (const action of actions) {
        const actionItem = document.createElement('div');
        actionItem.style.padding = '16px';
        actionItem.style.backgroundColor = '#f5f5f5';
        actionItem.style.borderRadius = '8px';
        actionItem.style.cursor = 'pointer';
        actionItem.style.transition = 'background 0.2s, transform 0.1s';
        actionItem.style.display = 'flex';
        actionItem.style.alignItems = 'center';
        actionItem.style.gap = '12px';

        // Element type badge
        const badge = document.createElement('span');
        badge.innerText = action.element.tagName.toLowerCase();
        badge.style.padding = '4px 8px';
        badge.style.backgroundColor = '#1976d2';
        badge.style.color = '#fff';
        badge.style.borderRadius = '4px';
        badge.style.fontSize = '12px';
        badge.style.fontWeight = 'bold';
        badge.style.textTransform = 'uppercase';
        badge.style.flexShrink = '0';

        // Label text
        const label = document.createElement('span');
        label.innerText = action.label;
        label.style.fontSize = fontSize + 'px';
        label.style.color = theme.textColor;
        label.style.flex = '1';

        actionItem.appendChild(badge);
        actionItem.appendChild(label);

        // Hover effect
        actionItem.addEventListener('mouseenter', () => {
          actionItem.style.backgroundColor = '#e3f2fd';
          actionItem.style.transform = 'translateX(4px)';
        });
        actionItem.addEventListener('mouseleave', () => {
          actionItem.style.backgroundColor = '#f5f5f5';
          actionItem.style.transform = 'translateX(0)';
        });

        // Click to show highlight layer
        actionItem.addEventListener('click', () => {
          this.showHighlightLayer(action.element, actionsLayer);
        });

        actionsList.appendChild(actionItem);
      }

      return actionsList;
    },

    _applyTheme: function(actionsLayer) {
      const currentTheme = window.SimplifyThemeControl.currentTheme;
      const theme = window.SimplifyConfig.themes[currentTheme];
      
      // Update background
      actionsLayer.style.backgroundColor = theme.bgColor;
      
      // Update header background
      const header = actionsLayer.querySelector('div[style*="position: sticky"]');
      if (header) {
        header.style.backgroundColor = theme.bgColor;
      }
      
      // Update headings
      const headings = actionsLayer.querySelectorAll('h1, h2');
      for (const heading of headings) {
        heading.style.color = theme.headingColor;
      }
      
      // Update text elements
      const textElements = actionsLayer.querySelectorAll('span');
      for (const text of textElements) {
        if (!text.style.color || text.style.color.includes('#666') || text.style.color.includes('#333')) {
          text.style.color = theme.textColor;
        }
      }
      
      // Update theme buttons
      const themeButtons = actionsLayer.querySelectorAll('button');
      for (const btn of themeButtons) {
        if (btn.innerText.includes('☀️') || btn.innerText.includes('📜')) {
          const themeName = btn.innerText.includes('☀️') ? 'light' : 'sepia';
          btn.style.border = currentTheme === themeName ? '2px solid #1976d2' : '2px solid #ccc';
          btn.style.backgroundColor = currentTheme === themeName ? '#e3f2fd' : 'transparent';
          btn.style.color = theme.textColor;
        }
      }
    },

    _applyFontSize: function(actionsLayer) {
      const fontSize = window.SimplifyThemeControl.fontSize;
      
      // Update action labels
      const actionLabels = actionsLayer.querySelectorAll('#actions-list > div > span:last-child');
      for (const label of actionLabels) {
        label.style.fontSize = fontSize + 'px';
      }
    },

    /**
     * Shows Layer 3: Highlights specific element with floating control bar
     */
    showHighlightLayer: function(targetElement, actionsLayer) {
      // Hide Layer 2
      actionsLayer.style.display = 'none';

      // Hide Layer 1 (base overlay)
      const baseOverlay = document.getElementById('simplify-overlay');
      if (baseOverlay) {
        baseOverlay.style.display = 'none';
      }

      // Highlight the element
      window.SimplifyActionFinder.highlight(targetElement);

      // Create floating control bar
      const controlBar = this._createControlBar(targetElement, actionsLayer, baseOverlay);
      document.body.appendChild(controlBar);
    },

    _createControlBar: function(targetElement, actionsLayer, baseOverlay) {
      const controlBar = document.createElement('div');
      controlBar.id = 'simplify-highlight-control';
      controlBar.style.position = 'fixed';
      controlBar.style.top = '20px';
      controlBar.style.left = '50%';
      controlBar.style.transform = 'translateX(-50%)';
      controlBar.style.backgroundColor = '#ffffff';
      controlBar.style.padding = '12px 24px';
      controlBar.style.borderRadius = '30px';
      controlBar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
      controlBar.style.zIndex = '1000020';
      controlBar.style.display = 'flex';
      controlBar.style.alignItems = 'center';
      controlBar.style.gap = '16px';
      controlBar.style.animation = 'fadeIn 0.3s ease-in-out';

      const backBtn = document.createElement('button');
      backBtn.innerText = '← Back to List';
      backBtn.style.background = '#1976d2';
      backBtn.style.color = '#fff';
      backBtn.style.border = 'none';
      backBtn.style.borderRadius = '20px';
      backBtn.style.padding = '10px 20px';
      backBtn.style.fontSize = '16px';
      backBtn.style.cursor = 'pointer';
      backBtn.style.transition = 'background 0.2s';
      backBtn.addEventListener('mouseenter', () => {
        backBtn.style.background = '#1565c0';
      });
      backBtn.addEventListener('mouseleave', () => {
        backBtn.style.background = '#1976d2';
      });
      backBtn.addEventListener('click', () => {
        window.SimplifyActionFinder.removeHighlight();
        document.body.removeChild(controlBar);
        actionsLayer.style.display = 'block';
        if (baseOverlay) {
          baseOverlay.style.display = 'flex';
        }
      });

      const closeBtn = document.createElement('button');
      closeBtn.innerText = '✕ Close All';
      closeBtn.style.background = 'transparent';
      closeBtn.style.color = '#666';
      closeBtn.style.border = '1px solid #ccc';
      closeBtn.style.borderRadius = '20px';
      closeBtn.style.padding = '10px 20px';
      closeBtn.style.fontSize = '16px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.transition = 'all 0.2s';
      closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.borderColor = '#999';
        closeBtn.style.color = '#333';
      });
      closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.borderColor = '#ccc';
        closeBtn.style.color = '#666';
      });
      closeBtn.addEventListener('click', () => {
        window.SimplifyActionFinder.removeHighlight();
        document.body.removeChild(controlBar);
        document.body.removeChild(actionsLayer);
        if (baseOverlay) {
          window.SimplifyAudioPlayer.stopSpeech();
          document.body.removeChild(baseOverlay);
        }
      });

      controlBar.appendChild(backBtn);
      controlBar.appendChild(closeBtn);

      return controlBar;
    }
  };
})();

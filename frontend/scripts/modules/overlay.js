// Overlay Module - Handles the bottom sheet UI and API calls
(function() {
  window.SimplifyOverlay = {
    API_BASE_URL: 'https://simplify-ext.vercel.app',
    currentTheme: 'light', // light, sepia
    fontSize: 18, // base font size in px

    themes: {
      light: {
        bgColor: '#FAF7F0',
        textColor: '#333',
        headingColor: '#1a1a1a'
      },
      sepia: {
        bgColor: '#F5E6D3',
        textColor: '#4a3f2f',
        headingColor: '#2d2416'
      }
    },

    show: async function() {
      // Check if overlay already exists
      if (document.getElementById('simplify-overlay')) return;

      const overlay = this._createOverlayContainer();
      const panel = this._createPanel();

      // Add close button
      const closeBtn = this._createCloseButton(overlay);
      panel.appendChild(closeBtn);

      // Add theme toggle
      const themeToggle = this._createThemeToggle();
      panel.appendChild(themeToggle);

      // Add TL;DR section
      const tldr = this._createTLDRSection();
      panel.appendChild(tldr);

      // Add Content section
      const content = this._createContentSection();
      panel.appendChild(content);

      // Add Find Action button
      const actionBtn = this._createActionButton();
      panel.appendChild(actionBtn);

      overlay.appendChild(panel);

      // Add animations
      this._addAnimationStyles();

      // Add to page
      document.body.appendChild(overlay);

      // Close on background click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          window.SimplifyAudioPlayer.stopSpeech();
          document.body.removeChild(overlay);
        }
      });

      // Fetch and display content
      await this._fetchAndDisplayContent();
    },

    _createOverlayContainer: function() {
      const overlay = document.createElement('div');
      overlay.id = 'simplify-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      overlay.style.zIndex = '1000000';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'flex-end';
      overlay.style.justifyContent = 'center';
      overlay.style.animation = 'fadeIn 0.3s ease-in-out';
      return overlay;
    },

    _createPanel: function() {
      const theme = this.themes[this.currentTheme];
      
      const panel = document.createElement('div');
      panel.id = 'simplify-panel';
      panel.style.backgroundColor = theme.bgColor;
      panel.style.width = '100%';
      panel.style.maxHeight = '60%';
      panel.style.borderRadius = '14px 14px 0 0';
      panel.style.boxShadow = '0 -4px 16px rgba(0, 0, 0, 0.2)';
      panel.style.padding = '24px';
      panel.style.overflowY = 'auto';
      panel.style.animation = 'slideUp 0.3s ease-out';
      panel.style.position = 'relative';
      panel.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
      return panel;
    },

    _createCloseButton: function(overlay) {
      const theme = this.themes[this.currentTheme];
      
      const closeBtn = document.createElement('button');
      closeBtn.innerText = '✕';
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '16px';
      closeBtn.style.right = '16px';
      closeBtn.style.background = 'transparent';
      closeBtn.style.border = 'none';
      closeBtn.style.fontSize = '24px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.color = theme.textColor;
      closeBtn.addEventListener('click', () => {
        window.SimplifyAudioPlayer.stopSpeech();
        document.body.removeChild(overlay);
      });
      return closeBtn;
    },

    _createThemeToggle: function() {
      const themeContainer = document.createElement('div');
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
        btn.style.border = this.currentTheme === themeOption.name ? '2px solid #1976d2' : '1px solid #ccc';
        btn.style.borderRadius = '6px';
        btn.style.cursor = 'pointer';
        btn.style.backgroundColor = this.currentTheme === themeOption.name ? '#e3f2fd' : 'transparent';
        btn.style.color = this.themes[this.currentTheme].textColor;
        btn.style.transition = 'all 0.2s';
        
        btn.addEventListener('click', () => {
          this.currentTheme = themeOption.name;
          this._applyTheme();
        });
        
        themeContainer.appendChild(btn);
      }
      
      // Add font size controls
      const fontSizeControl = this._createFontSizeControl();
      themeContainer.appendChild(fontSizeControl);
      
      return themeContainer;
    },

    _applyTheme: function() {
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
      
      // Update theme toggle
      const themeButtons = document.querySelectorAll('#simplify-overlay button');
      for (const btn of themeButtons) {
        if (btn.innerText.includes('☀️') || btn.innerText.includes('📜')) {
          const themeName = btn.innerText.includes('☀️') ? 'light' : 'sepia';
          btn.style.border = this.currentTheme === themeName ? '2px solid #1976d2' : '1px solid #ccc';
          btn.style.backgroundColor = this.currentTheme === themeName ? '#e3f2fd' : 'transparent';
          btn.style.color = theme.textColor;
        }
      }
    },

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
        if (this.fontSize > 14) {
          this.fontSize -= 2;
          this._applyFontSize();
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
        if (this.fontSize < 26) {
          this.fontSize += 2;
          this._applyFontSize();
        }
      });
      
      container.appendChild(label);
      container.appendChild(decreaseBtn);
      container.appendChild(increaseBtn);
      
      return container;
    },

    _applyFontSize: function() {
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
    },

    _createTLDRSection: function() {
      const theme = this.themes[this.currentTheme];
      
      const tldr = document.createElement('div');
      tldr.id = 'tldr-section';
      tldr.style.marginBottom = '24px';
      
      const tldrHeader = document.createElement('div');
      tldrHeader.style.display = 'flex';
      tldrHeader.style.alignItems = 'center';
      tldrHeader.style.gap = '12px';
      tldrHeader.style.marginBottom = '16px';
      
      const tldrTitle = document.createElement('h2');
      tldrTitle.style.fontSize = '24px';
      tldrTitle.style.color = theme.headingColor;
      tldrTitle.style.margin = '0';
      tldrTitle.innerText = 'TL;DR';
      
      const tldrSpinner = document.createElement('div');
      tldrSpinner.className = 'loading-spinner';
      tldrSpinner.innerHTML = '⏳';
      tldrSpinner.style.fontSize = '20px';
      tldrSpinner.style.animation = 'spin 1s linear infinite';
      
      tldrHeader.appendChild(tldrTitle);
      tldrHeader.appendChild(tldrSpinner);
      tldr.appendChild(tldrHeader);
      
      const tldrContent = document.createElement('div');
      tldrContent.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="flex: 1; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
            <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #1976d2 0%, #64b5f6 50%, #1976d2 100%); background-size: 200% 100%; animation: loadingBar 2.5s ease-in-out infinite;"></div>
          </div>
          <span style="font-size: 14px; color: ${theme.textColor};">Loading...</span>
        </div>
      `;
      tldr.appendChild(tldrContent);
      
      return tldr;
    },

    _createContentSection: function() {
      const theme = this.themes[this.currentTheme];
      
      const content = document.createElement('div');
      content.id = 'content-section';
      content.style.marginTop = '24px';
      
      const contentHeader = document.createElement('div');
      contentHeader.style.display = 'flex';
      contentHeader.style.alignItems = 'center';
      contentHeader.style.gap = '12px';
      contentHeader.style.marginBottom = '16px';
      
      const contentTitle = document.createElement('h2');
      contentTitle.style.fontSize = '24px';
      contentTitle.style.color = theme.headingColor;
      contentTitle.style.margin = '0';
      contentTitle.innerText = 'Content Summary';
      
      const contentSpinner = document.createElement('div');
      contentSpinner.className = 'loading-spinner';
      contentSpinner.innerHTML = '⏳';
      contentSpinner.style.fontSize = '20px';
      contentSpinner.style.animation = 'spin 1s linear infinite';
      
      contentHeader.appendChild(contentTitle);
      contentHeader.appendChild(contentSpinner);
      content.appendChild(contentHeader);
      
      const contentBody = document.createElement('div');
      contentBody.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="flex: 1; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
            <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #1976d2 0%, #64b5f6 50%, #1976d2 100%); background-size: 200% 100%; animation: loadingBar 2.5s ease-in-out infinite;"></div>
          </div>
          <span style="font-size: 14px; color: ${theme.textColor};">Loading...</span>
        </div>
      `;
      content.appendChild(contentBody);
      
      return content;
    },

    _createActionButton: function() {
      const actionBtn = document.createElement('button');
      actionBtn.innerText = 'View All Page Actions';
      actionBtn.style.marginTop = '24px';
      actionBtn.style.background = '#1976d2';
      actionBtn.style.color = '#fff';
      actionBtn.style.border = 'none';
      actionBtn.style.borderRadius = '8px';
      actionBtn.style.padding = '12px 24px';
      actionBtn.style.fontSize = '16px';
      actionBtn.style.cursor = 'pointer';
      actionBtn.addEventListener('click', () => {
        this.showActionsLayer();
      });
      return actionBtn;
    },

    _addAnimationStyles: function() {
      if (document.getElementById('simplify-animations')) return;
      
      const style = document.createElement('style');
      style.id = 'simplify-animations';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes loadingBar {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `;
      document.head.appendChild(style);
    },

    _fetchAndDisplayContent: async function() {
      const pageData = this._extractPageContent();
      
      try {
        const response = await fetch(`${this.API_BASE_URL}/api/process-page`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pageData)
        });

        if (!response.ok) {
          throw new Error('Failed to process page');
        }

        const result = await response.json();

        // Update TL;DR
        this._updateTLDR(result.summary_points);
        // Update Clean Content
        this._updateContent(result.clean_text);

      } catch (error) {
        console.error('Error processing page:', error);
        this._showError();
      }
    },

    _extractPageContent: function() {
      const bodyText = document.body.innerText || document.body.textContent;
      const url = window.location.href;
      
      return {
        url: url,
        text_content: bodyText.substring(0, 10000)
      };
    },

    _updateTLDR: function(summaryPoints) {
      const tldrSection = document.getElementById('tldr-section');
      if (!tldrSection || !summaryPoints) return;

      const theme = this.themes[this.currentTheme];
      const bulletPoints = summaryPoints.map(point => `<li>${point}</li>`).join('');
      
      const tldrHeader = document.createElement('div');
      tldrHeader.style.display = 'flex';
      tldrHeader.style.alignItems = 'center';
      tldrHeader.style.gap = '12px';
      tldrHeader.style.marginBottom = '16px';
      
      const tldrTitle = document.createElement('h2');
      tldrTitle.style.fontSize = '24px';
      tldrTitle.style.color = theme.headingColor;
      tldrTitle.style.margin = '0';
      tldrTitle.innerText = 'TL;DR';
      
      const tldrListenBtn = document.createElement('button');
      tldrListenBtn.innerHTML = '🔊 Listen';
      tldrListenBtn.style.background = '#4CAF50';
      tldrListenBtn.style.color = '#fff';
      tldrListenBtn.style.border = 'none';
      tldrListenBtn.style.borderRadius = '6px';
      tldrListenBtn.style.padding = '8px 16px';
      tldrListenBtn.style.fontSize = '14px';
      tldrListenBtn.style.cursor = 'pointer';
      tldrListenBtn.style.transition = 'background 0.2s';
      tldrListenBtn.addEventListener('mouseenter', () => {
        if (!window.SimplifyAudioPlayer.isSpeaking) tldrListenBtn.style.background = '#45a049';
      });
      tldrListenBtn.addEventListener('mouseleave', () => {
        if (!window.SimplifyAudioPlayer.isSpeaking) tldrListenBtn.style.background = '#4CAF50';
      });
      tldrListenBtn.addEventListener('click', () => {
        const tldrList = tldrSection.querySelector('ul');
        if (tldrList) {
          const text = tldrList.innerText || tldrList.textContent;
          window.SimplifyAudioPlayer.createPlayer(text, tldrSection);
        }
      });
      
      tldrHeader.appendChild(tldrTitle);
      tldrHeader.appendChild(tldrListenBtn);
      
      const tldrList = document.createElement('ul');
      tldrList.style.fontSize = this.fontSize + 'px';
      tldrList.style.lineHeight = '1.6';
      tldrList.style.color = theme.textColor;
      tldrList.style.listStyleType = 'disc';
      tldrList.style.listStylePosition = 'outside';
      tldrList.style.paddingLeft = '24px';
      tldrList.style.marginLeft = '0';
      tldrList.style.maxWidth = '60ch';
      tldrList.style.display = 'block';
      tldrList.innerHTML = bulletPoints;
      
      tldrSection.innerHTML = '';
      tldrSection.appendChild(tldrHeader);
      tldrSection.appendChild(tldrList);
    },

    _updateContent: function(cleanText) {
      const contentSection = document.getElementById('content-section');
      if (!contentSection || !cleanText) return;

      const theme = this.themes[this.currentTheme];

      const contentHeader = document.createElement('div');
      contentHeader.style.display = 'flex';
      contentHeader.style.alignItems = 'center';
      contentHeader.style.gap = '12px';
      contentHeader.style.marginBottom = '16px';
      
      const contentTitle = document.createElement('h2');
      contentTitle.style.fontSize = '24px';
      contentTitle.style.color = theme.headingColor;
      contentTitle.style.margin = '0';
      contentTitle.innerText = 'Simplified Content';
      
      const contentListenBtn = document.createElement('button');
      contentListenBtn.innerHTML = '🔊 Listen';
      contentListenBtn.style.background = '#4CAF50';
      contentListenBtn.style.color = '#fff';
      contentListenBtn.style.border = 'none';
      contentListenBtn.style.borderRadius = '6px';
      contentListenBtn.style.padding = '8px 16px';
      contentListenBtn.style.fontSize = '14px';
      contentListenBtn.style.cursor = 'pointer';
      contentListenBtn.style.transition = 'background 0.2s';
      contentListenBtn.addEventListener('mouseenter', () => {
        if (!window.SimplifyAudioPlayer.isSpeaking) contentListenBtn.style.background = '#45a049';
      });
      contentListenBtn.addEventListener('mouseleave', () => {
        if (!window.SimplifyAudioPlayer.isSpeaking) contentListenBtn.style.background = '#4CAF50';
      });
      contentListenBtn.addEventListener('click', () => {
        const contentPara = contentSection.querySelector('p');
        if (contentPara) {
          const text = contentPara.innerText || contentPara.textContent;
          window.SimplifyAudioPlayer.createPlayer(text, contentSection);
        }
      });
      
      contentHeader.appendChild(contentTitle);
      contentHeader.appendChild(contentListenBtn);
      
      const contentPara = document.createElement('p');
      contentPara.style.fontSize = this.fontSize + 'px';
      contentPara.style.lineHeight = '1.6';
      contentPara.style.color = theme.textColor;
      contentPara.style.maxWidth = '60ch';
      contentPara.style.marginBottom = '1rem';
      contentPara.innerText = cleanText;
      
      contentSection.innerHTML = '';
      contentSection.appendChild(contentHeader);
      contentSection.appendChild(contentPara);
    },

    _showError: function() {
      const theme = this.themes[this.currentTheme];
      const tldrSection = document.getElementById('tldr-section');
      if (tldrSection) {
        tldrSection.innerHTML = `
          <h2 style="font-size: 24px; margin-bottom: 16px; color: ${theme.headingColor};">Error</h2>
          <p style="font-size: 18px; line-height: 1.6; color: #ff0000;">
            Failed to simplify page. Please try again.
          </p>
        `;
      }
    },

    /**
     * Shows Layer 2: Full-screen scrollable list of all page actions
     * Includes AI filtering to remove noise (ads, tracking, footer links)
     */
    showActionsLayer: async function() {
      // Create actions layer overlay immediately with loading state
      const actionsLayer = document.createElement('div');
      actionsLayer.id = 'simplify-actions-layer';
      actionsLayer.style.position = 'fixed';
      actionsLayer.style.top = '0';
      actionsLayer.style.left = '0';
      actionsLayer.style.width = '100%';
      actionsLayer.style.height = '100%';
      actionsLayer.style.backgroundColor = '#ffffff';
      actionsLayer.style.zIndex = '1000010';
      actionsLayer.style.overflowY = 'auto';
      actionsLayer.style.padding = '24px';
      actionsLayer.style.animation = 'slideUp 0.3s ease-out';

      // Header with back button
      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.alignItems = 'center';
      header.style.gap = '16px';
      header.style.marginBottom = '24px';
      header.style.position = 'sticky';
      header.style.top = '0';
      header.style.backgroundColor = '#ffffff';
      header.style.paddingBottom = '12px';
      header.style.borderBottom = '1px solid #e0e0e0';
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
      title.style.color = '#333';
      title.style.margin = '0';

      const loadingIndicator = document.createElement('div');
      loadingIndicator.style.display = 'flex';
      loadingIndicator.style.alignItems = 'center';
      loadingIndicator.style.gap = '8px';
      loadingIndicator.style.fontSize = '16px';
      loadingIndicator.style.color = '#666';
      
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
      actionsLayer.appendChild(header);

      // Add to page immediately to show loading state
      document.body.appendChild(actionsLayer);

      // Scan page for actions
      const rawActions = window.SimplifyActionFinder.scan();
      
      if (rawActions.length === 0) {
        // Replace loading with error message
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
      count.style.color = '#666';
      header.appendChild(count);

      // Actions list
      const actionsList = document.createElement('div');
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
        label.style.fontSize = '16px';
        label.style.color = '#333';
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

        // Click to show Layer 3
        actionItem.addEventListener('click', () => {
          this.showHighlightLayer(action.element, actionsLayer);
        });

        actionsList.appendChild(actionItem);
      }

      actionsLayer.appendChild(actionsList);
    },

    /**
     * Shows Layer 3: Highlights specific element with floating control bar
     * @param {DOMElement} targetElement - The element to highlight
     * @param {DOMElement} actionsLayer - Reference to Layer 2 to hide/show
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
        // Remove highlight
        window.SimplifyActionFinder.removeHighlight();
        
        // Remove control bar
        document.body.removeChild(controlBar);
        
        // Restore Layer 2
        actionsLayer.style.display = 'block';
        
        // Restore Layer 1
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
        // Remove highlight
        window.SimplifyActionFinder.removeHighlight();
        
        // Remove control bar
        document.body.removeChild(controlBar);
        
        // Remove Layer 2
        document.body.removeChild(actionsLayer);
        
        // Remove Layer 1
        if (baseOverlay) {
          window.SimplifyAudioPlayer.stopSpeech();
          document.body.removeChild(baseOverlay);
        }
      });

      controlBar.appendChild(backBtn);
      controlBar.appendChild(closeBtn);
      document.body.appendChild(controlBar);
    }
  };
})();

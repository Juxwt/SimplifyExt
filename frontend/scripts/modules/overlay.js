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
      panel.style.maxWidth = '100%';
      panel.style.maxHeight = '55%';
      panel.style.borderRadius = '14px 14px 0 0';
      panel.style.boxShadow = '0 -4px 16px rgba(0, 0, 0, 0.2)';
      panel.style.padding = '24px';
      panel.style.paddingRight = '16px';
      panel.style.overflowY = 'auto';
      panel.style.overflowX = 'hidden';
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
      
      // Also update actions layer if it exists
      const actionsLayer = document.getElementById('simplify-actions-layer');
      if (actionsLayer && window.SimplifyActionsLayer) {
        window.SimplifyActionsLayer._applyTheme(actionsLayer);
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
      
      // Also update actions layer if it exists
      const actionsLayer = document.getElementById('simplify-actions-layer');
      if (actionsLayer && window.SimplifyActionsLayer) {
        window.SimplifyActionsLayer._applyFontSize(actionsLayer);
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
        window.SimplifyActionsLayer.show();
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
        
        /* Custom scrollbar styling */
        #simplify-panel {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
        }
        
        #simplify-panel::-webkit-scrollbar {
          width: 8px;
        }
        
        #simplify-panel::-webkit-scrollbar-track {
          background: transparent;
          margin-top: 14px;
        }
        
        #simplify-panel::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        
        #simplify-panel::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.5);
        }
      `;
      document.head.appendChild(style);
    },

    _fetchAndDisplayContent: async function() {
      // Mock mode - for UI/UX development without API calls
      const USE_MOCK_DATA = true;
      
      if (USE_MOCK_DATA) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data for testing UI
        const mockResult = {
          summary_points: [
            'This is a sample bullet point demonstrating how the TL;DR section will look',
            'You can adjust colors, spacing, and fonts without waiting for the API',
            'The mock data helps you iterate quickly on the design',
            'Change this mock data to test different content lengths and formats'
          ],
          clean_text: 'This is sample simplified content that demonstrates how the content section will appear. You can now work on styling, themes, fonts, spacing, and other UI elements without making API calls. This text is long enough to show how multiple lines look with the current styling. Feel free to modify the mock data in the _fetchAndDisplayContent method to test different scenarios and content variations.'
        };
        
        // Update TL;DR
        this._updateTLDR(mockResult.summary_points);
        // Update Clean Content
        this._updateContent(mockResult.clean_text);
        
        return;
      }
      
      // Real API mode
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
    }
  };
})();

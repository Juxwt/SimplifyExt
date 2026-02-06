// Overlay Module - Main orchestrator for the bottom sheet UI
(function() {
  window.SimplifyOverlay = {
    // Use configuration from config.js
    API_BASE_URL: window.SimplifyConfig.API_BASE_URL,
    
    // Cache for storing page data
    cache: {
      url: null,
      data: null
    },

    show: async function() {
      // Check if overlay already exists
      if (document.getElementById('simplify-overlay')) return;

      // Create overlay and panel using components
      const overlay = window.SimplifyOverlayPanel.createContainer();
      const panel = window.SimplifyOverlayPanel.createPanel();

      // Add close button
      const closeBtn = window.SimplifyOverlayPanel.createCloseButton(() => {
        window.SimplifyAudioPlayer.stopSpeech();
        document.body.removeChild(overlay);
      });
      panel.appendChild(closeBtn);

      // Add theme toggle
      const themeToggle = window.SimplifyThemeControl.create();
      panel.appendChild(themeToggle);

      // Add TL;DR section
      const tldr = window.SimplifyTLDRSection.create();
      panel.appendChild(tldr);

      // Add Content section
      const content = window.SimplifyContentSection.create();
      panel.appendChild(content);

      // Add Find Action button
      const actionBtn = window.SimplifyOverlayPanel.createActionButton();
      panel.appendChild(actionBtn);

      overlay.appendChild(panel);

      // Add animations
      window.SimplifyOverlayPanel.addAnimationStyles();

      // Add to page
      document.body.appendChild(overlay);

      // Close on background click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          e.preventDefault();
          e.stopPropagation();
          window.SimplifyAudioPlayer.stopSpeech();
          document.body.removeChild(overlay);
        }
      });

      // Fetch and display content
      await this._fetchAndDisplayContent();
    },

    _fetchAndDisplayContent: async function() {
      const currentUrl = window.location.href;
      
      // Check if we have cached data for this URL
      if (this.cache.url === currentUrl && this.cache.data) {
        // Use cached data
        window.SimplifyTLDRSection.update(this.cache.data.summary_points);
        window.SimplifyContentSection.update(this.cache.data.clean_text);
        return;
      }
      
      // Check if using mock data (from config)
      if (window.SimplifyConfig.USE_MOCK_DATA) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, window.SimplifyMockData.getDelay()));
        
        // Get mock data
        const mockResult = window.SimplifyMockData.getResponse('default');
        
        // Cache the result
        this.cache.url = currentUrl;
        this.cache.data = mockResult;
        
        // Update UI using components
        window.SimplifyTLDRSection.update(mockResult.summary_points);
        window.SimplifyContentSection.update(mockResult.clean_text);
        
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
        
        // Cache the result
        this.cache.url = currentUrl;
        this.cache.data = result;

        // Update UI using components
        window.SimplifyTLDRSection.update(result.summary_points);
        window.SimplifyContentSection.update(result.clean_text);

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
        text_content: bodyText.substring(0, window.SimplifyConfig.API.MAX_CONTENT_LENGTH)
      };
    },

    _showError: function() {
      const theme = window.SimplifyConfig.themes[window.SimplifyThemeControl.currentTheme];
      const tldrSection = document.getElementById('tldr-section');
      if (tldrSection) {
        tldrSection.innerHTML = `
          <div role="alert">
            <h2 style="font-size: 24px; margin-bottom: 16px; color: ${theme.headingColor}; font-weight: bold;">Error</h2>
            <p style="font-size: 18px; line-height: 1.6; color: #ff0000;">
              Failed to simplify page. Please try again.
            </p>
          </div>
        `;
      }
    }
  };
})();

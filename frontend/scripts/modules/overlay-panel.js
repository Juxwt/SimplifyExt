// Overlay Panel Component - Handles panel, overlay container, and basic UI elements
(function() {
  window.SimplifyOverlayPanel = {
    get themes() {
      return window.SimplifyConfig.themes;
    },

    get currentTheme() {
      return window.SimplifyThemeControl.currentTheme;
    },

    // Create the overlay container (backdrop)
    createContainer: function() {
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
      overlay.style.pointerEvents = 'auto';
      
      // Prevent all events from bubbling to page underneath
      overlay.addEventListener('mousedown', (e) => e.stopPropagation());
      overlay.addEventListener('mouseup', (e) => e.stopPropagation());
      overlay.addEventListener('click', (e) => e.stopPropagation());
      overlay.addEventListener('wheel', (e) => e.stopPropagation());
      overlay.addEventListener('touchstart', (e) => e.stopPropagation());
      overlay.addEventListener('touchmove', (e) => e.stopPropagation());
      overlay.addEventListener('touchend', (e) => e.stopPropagation());
      
      return overlay;
    },

    // Create the main panel
    createPanel: function() {
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
      panel.style.paddingRight = '20px';
      panel.style.overflowY = 'auto';
      panel.style.overflowX = 'hidden';
      panel.style.animation = 'slideUp 0.3s ease-out';
      panel.style.position = 'relative';
      panel.style.pointerEvents = 'auto';
      
      // Font family will be set by SimplifyThemeControl.applyFontFamily()
      const fontFamilyObj = window.SimplifyConfig.fontFamilies.find(f => f.name === window.SimplifyThemeControl.fontFamily);
      panel.style.fontFamily = fontFamilyObj ? fontFamilyObj.value : 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
      
      // Prevent clicks inside panel from closing overlay
      panel.addEventListener('click', (e) => e.stopPropagation());
      
      return panel;
    },

    // Create close button
    createCloseButton: function(onClose) {
      const theme = this.themes[this.currentTheme];
      
      const closeBtn = document.createElement('button');
      closeBtn.className = 'close-btn';
      closeBtn.innerText = '✕';
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '16px';
      closeBtn.style.right = '16px';
      closeBtn.style.background = 'transparent';
      closeBtn.style.border = 'none';
      closeBtn.style.fontSize = '24px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.color = theme.textColor;
      closeBtn.addEventListener('click', onClose);
      return closeBtn;
    },

    // Create action button
    createActionButton: function() {
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

    // Add animation styles to document
    addAnimationStyles: function() {
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        /* Responsive text and layout */
        @media (max-width: 768px) {
          #simplify-panel {
            padding: 20px !important;
            max-height: 75vh !important;
          }
          
          #simplify-overlay h2 {
            font-size: 20px !important;
          }
          
          #simplify-overlay p,
          #simplify-overlay li {
            font-size: 16px !important;
            max-width: 100% !important;
          }
          
          #simplify-overlay ul {
            padding-left: 20px !important;
          }
          
          #simplify-overlay button {
            font-size: 13px !important;
            padding: 8px 14px !important;
          }
          
          #simplify-overlay .theme-controls {
            flex-wrap: wrap;
          }
        }
        
        @media (max-width: 480px) {
          #simplify-panel {
            padding: 16px !important;
            max-height: 80vh !important;
            border-radius: 12px 12px 0 0 !important;
          }
          
          #simplify-overlay h2 {
            font-size: 18px !important;
          }
          
          #simplify-overlay p,
          #simplify-overlay li {
            font-size: 15px !important;
            line-height: 1.5 !important;
          }
          
          #simplify-overlay button {
            font-size: 12px !important;
            padding: 6px 12px !important;
          }
          
          #simplify-overlay .close-btn {
            font-size: 20px !important;
            top: 12px !important;
            right: 12px !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
  };
})();

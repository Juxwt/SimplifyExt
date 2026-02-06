// Content Section Component - Handles content display and updates
(function() {
  window.SimplifyContentSection = {
    get themes() {
      return window.SimplifyConfig.themes;
    },

    get fontSize() {
      return window.SimplifyThemeControl.fontSize;
    },

    get currentTheme() {
      return window.SimplifyThemeControl.currentTheme;
    },

    // Create the initial loading state
    create: function() {
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
      contentTitle.style.fontWeight = 'bold';
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

    // Update with actual data
    update: function(cleanText) {
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
      contentTitle.style.fontWeight = 'bold';
      contentTitle.innerText = 'Content Summary';
      
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
      contentPara.style.maxWidth = '100%';
      contentPara.style.marginBottom = '1rem';
      contentPara.innerText = cleanText;
      
      contentSection.innerHTML = '';
      contentSection.appendChild(contentHeader);
      contentSection.appendChild(contentPara);
    }
  };
})();

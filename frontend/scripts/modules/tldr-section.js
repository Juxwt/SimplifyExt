// TL;DR Section Component - Handles TL;DR display and updates
(function() {
  window.SimplifyTLDRSection = {
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
      tldrTitle.style.fontWeight = 'bold';
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

    // Update with actual data
    update: function(summaryPoints) {
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
      tldrTitle.style.fontWeight = 'bold';
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
      tldrList.style.maxWidth = '100%';
      tldrList.style.display = 'block';
      tldrList.innerHTML = bulletPoints;
      
      tldrSection.innerHTML = '';
      tldrSection.appendChild(tldrHeader);
      tldrSection.appendChild(tldrList);
    }
  };
})();

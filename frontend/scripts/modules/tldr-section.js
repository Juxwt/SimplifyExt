// TL;DR Section Component - Handles TL;DR display and updates
(function() {
  window.SimplifyTLDRSection = {
    _loadingInterval: null,
    
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
      const loadingText = document.createElement('p');
      loadingText.id = 'tldr-loading-text';
      loadingText.style.fontSize = this.fontSize + 'px';
      loadingText.style.lineHeight = '1.6';
      loadingText.style.color = theme.textColor;
      loadingText.innerText = '✨ Analyzing page content.';
      
      tldrContent.appendChild(loadingText);
      tldr.appendChild(tldrContent);
      
      // Animate dots
      let dotCount = 1;
      this._loadingInterval = setInterval(() => {
        const loadingEl = document.getElementById('tldr-loading-text');
        if (loadingEl) {
          dotCount = (dotCount % 3) + 1;
          loadingEl.innerText = '✨ Analyzing page content' + '.'.repeat(dotCount);
        }
      }, 500);
      
      return tldr;
    },

    // Update with actual data
    update: function(summaryPoints) {
      // Clear loading animation
      if (this._loadingInterval) {
        clearInterval(this._loadingInterval);
        this._loadingInterval = null;
      }
      
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

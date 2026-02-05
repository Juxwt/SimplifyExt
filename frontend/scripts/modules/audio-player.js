// Audio Player Module - Handles Text-to-Speech functionality
(function() {
  // Export to global window object so other modules can use it
  window.SimplifyAudioPlayer = {
    currentUtterance: null,
    isSpeaking: false,
    isPaused: false,
    currentText: '',
    currentPosition: 0,
    currentRate: 0.9,
    currentVolume: 1,
    currentVoice: null,
    availableVoices: [],
    activePlayerPanel: null,
    progressInterval: null,
    volumeUpdateTimeout: null,

    init: function() {
      this.loadVoices();
    },

    loadVoices: function() {
      this.availableVoices = window.speechSynthesis.getVoices();
      console.log('Voices loaded:', this.availableVoices.length);
      if (this.availableVoices.length === 0) {
        window.speechSynthesis.addEventListener('voiceschanged', () => {
          this.availableVoices = window.speechSynthesis.getVoices();
          console.log('Voices loaded after change event:', this.availableVoices.length);
        });
      }
    },

    createPlayer: function(text, containerElement) {
      // Remove any existing player
      if (this.activePlayerPanel) {
        this.activePlayerPanel.remove();
        this.stopSpeech();
      }

      // Validate text
      if (!text || text.trim().length === 0) {
        console.error('Cannot create audio player: text is empty');
        alert('No text available to read aloud.');
        return;
      }

      this.currentText = text;
      this.currentPosition = 0;

      // Ensure voices are loaded
      if (this.availableVoices.length === 0) {
        this.availableVoices = window.speechSynthesis.getVoices();
      }

      // Create player panel
      const playerPanel = document.createElement('div');
      playerPanel.style.marginTop = '16px';
      playerPanel.style.padding = '16px';
      playerPanel.style.background = '#f5f5f5';
      playerPanel.style.borderRadius = '8px';
      playerPanel.style.border = '1px solid #ddd';

      // Play/Pause button
      const playPauseBtn = document.createElement('button');
      playPauseBtn.innerHTML = '▶️ Play';
      playPauseBtn.style.background = '#4CAF50';
      playPauseBtn.style.color = '#fff';
      playPauseBtn.style.border = 'none';
      playPauseBtn.style.borderRadius = '6px';
      playPauseBtn.style.padding = '8px 16px';
      playPauseBtn.style.fontSize = '14px';
      playPauseBtn.style.cursor = 'pointer';
      playPauseBtn.style.marginRight = '8px';

      // Stop button
      const stopBtn = document.createElement('button');
      stopBtn.innerHTML = '⏹️ Stop';
      stopBtn.style.background = '#f44336';
      stopBtn.style.color = '#fff';
      stopBtn.style.border = 'none';
      stopBtn.style.borderRadius = '6px';
      stopBtn.style.padding = '8px 16px';
      stopBtn.style.fontSize = '14px';
      stopBtn.style.cursor = 'pointer';

      // Button container
      const btnContainer = document.createElement('div');
      btnContainer.style.marginBottom = '12px';
      btnContainer.appendChild(playPauseBtn);
      btnContainer.appendChild(stopBtn);

      // Progress bar
      const progressContainer = document.createElement('div');
      progressContainer.style.marginBottom = '12px';
      
      const progressLabel = document.createElement('div');
      progressLabel.style.fontSize = '12px';
      progressLabel.style.color = '#666';
      progressLabel.style.marginBottom = '4px';
      progressLabel.innerText = 'Progress: 0%';

      const progressBar = document.createElement('input');
      progressBar.type = 'range';
      progressBar.min = '0';
      progressBar.max = '100';
      progressBar.value = '0';
      progressBar.style.width = '100%';
      progressBar.style.cursor = 'pointer';

      progressContainer.appendChild(progressLabel);
      progressContainer.appendChild(progressBar);

      // Speed control
      const speedContainer = this._createSpeedControl();
      // Volume control
      const volumeContainer = this._createVolumeControl();
      // Voice selection
      const voiceContainer = this._createVoiceControl();

      // Assemble player
      playerPanel.appendChild(btnContainer);
      playerPanel.appendChild(progressContainer);
      playerPanel.appendChild(speedContainer);
      playerPanel.appendChild(volumeContainer);
      playerPanel.appendChild(voiceContainer);

      // Event listeners
      this._attachPlayerEvents(playPauseBtn, stopBtn, progressBar, progressLabel, speedContainer, volumeContainer, voiceContainer);

      containerElement.appendChild(playerPanel);
      this.activePlayerPanel = playerPanel;
    },

    _createSpeedControl: function() {
      const speedContainer = document.createElement('div');
      speedContainer.style.marginBottom = '12px';
      speedContainer.style.display = 'flex';
      speedContainer.style.alignItems = 'center';
      speedContainer.style.gap = '8px';

      const speedLabel = document.createElement('label');
      speedLabel.innerText = 'Speed:';
      speedLabel.style.fontSize = '14px';
      speedLabel.style.color = '#333';
      speedLabel.style.minWidth = '50px';

      const speedSelect = document.createElement('select');
      speedSelect.style.flex = '1';
      speedSelect.style.padding = '6px';
      speedSelect.style.borderRadius = '4px';
      speedSelect.style.border = '1px solid #ccc';
      speedSelect.style.fontSize = '14px';
      speedSelect.style.cursor = 'pointer';

      const speedOptions = [
        { value: 0.5, label: '0.5x (Very Slow)' },
        { value: 0.75, label: '0.75x (Slow)' },
        { value: 0.9, label: '0.9x (Slightly Slow)' },
        { value: 1, label: '1x (Normal)' },
        { value: 1.25, label: '1.25x (Fast)' },
        { value: 1.5, label: '1.5x (Very Fast)' },
        { value: 2, label: '2x (Maximum)' }
      ];

      speedOptions.forEach(speed => {
        const option = document.createElement('option');
        option.value = speed.value;
        option.innerText = speed.label;
        if (speed.value === this.currentRate) {
          option.selected = true;
        }
        speedSelect.appendChild(option);
      });

      speedContainer.appendChild(speedLabel);
      speedContainer.appendChild(speedSelect);
      return speedContainer;
    },

    _createVolumeControl: function() {
      const volumeContainer = document.createElement('div');
      volumeContainer.style.marginBottom = '12px';
      volumeContainer.style.display = 'flex';
      volumeContainer.style.alignItems = 'center';
      volumeContainer.style.gap = '8px';

      const volumeLabel = document.createElement('label');
      volumeLabel.innerText = 'Volume:';
      volumeLabel.style.fontSize = '14px';
      volumeLabel.style.color = '#333';
      volumeLabel.style.minWidth = '50px';

      const volumeSlider = document.createElement('input');
      volumeSlider.type = 'range';
      volumeSlider.min = '0';
      volumeSlider.max = '1';
      volumeSlider.step = '0.1';
      volumeSlider.value = this.currentVolume;
      volumeSlider.style.flex = '1';
      volumeSlider.style.cursor = 'pointer';

      const volumeValue = document.createElement('span');
      volumeValue.innerText = `${Math.round(this.currentVolume * 100)}%`;
      volumeValue.style.fontSize = '14px';
      volumeValue.style.color = '#666';
      volumeValue.style.minWidth = '40px';

      volumeContainer.appendChild(volumeLabel);
      volumeContainer.appendChild(volumeSlider);
      volumeContainer.appendChild(volumeValue);
      return volumeContainer;
    },

    _createVoiceControl: function() {
      const voiceContainer = document.createElement('div');
      voiceContainer.style.display = 'flex';
      voiceContainer.style.alignItems = 'center';
      voiceContainer.style.gap = '8px';

      const voiceLabel = document.createElement('label');
      voiceLabel.innerText = 'Voice:';
      voiceLabel.style.fontSize = '14px';
      voiceLabel.style.color = '#333';
      voiceLabel.style.minWidth = '50px';

      const voiceSelect = document.createElement('select');
      voiceSelect.style.flex = '1';
      voiceSelect.style.padding = '6px';
      voiceSelect.style.borderRadius = '4px';
      voiceSelect.style.border = '1px solid #ccc';
      voiceSelect.style.fontSize = '14px';

      if (this.availableVoices.length === 0) {
        this.availableVoices = window.speechSynthesis.getVoices();
      }
      
      if (this.availableVoices.length === 0) {
        const option = document.createElement('option');
        option.value = '-1';
        option.innerText = 'Default Voice';
        option.selected = true;
        voiceSelect.appendChild(option);
      } else {
        this.availableVoices.forEach((voice, index) => {
          const option = document.createElement('option');
          option.value = index;
          option.innerText = `${voice.name} (${voice.lang})`;
          if (voice.default || index === 0) {
            option.selected = true;
            this.currentVoice = voice;
          }
          voiceSelect.appendChild(option);
        });
      }

      voiceContainer.appendChild(voiceLabel);
      voiceContainer.appendChild(voiceSelect);
      return voiceContainer;
    },

    _attachPlayerEvents: function(playPauseBtn, stopBtn, progressBar, progressLabel, speedContainer, volumeContainer, voiceContainer) {
      const self = this;
      const speedSelect = speedContainer.querySelector('select');
      const volumeSlider = volumeContainer.querySelector('input[type="range"]');
      const volumeValue = volumeContainer.querySelector('span');
      const voiceSelect = voiceContainer.querySelector('select');

      playPauseBtn.addEventListener('click', () => {
        if (self.isSpeaking && !self.isPaused) {
          window.speechSynthesis.pause();
          self.isPaused = true;
          playPauseBtn.innerHTML = '▶️ Play';
          if (self.progressInterval) {
            clearInterval(self.progressInterval);
            self.progressInterval = null;
          }
        } else if (self.isPaused) {
          window.speechSynthesis.resume();
          self.isPaused = false;
          playPauseBtn.innerHTML = '⏸️ Pause';
        } else {
          self._startSpeech(playPauseBtn, progressBar, progressLabel);
        }
      });

      stopBtn.addEventListener('click', () => {
        self.stopSpeech();
        playPauseBtn.innerHTML = '▶️ Play';
        progressBar.value = '0';
        progressLabel.innerText = 'Progress: 0%';
        self.currentPosition = 0;
      });

      speedSelect.addEventListener('change', (e) => {
        self.currentRate = parseFloat(e.target.value);
        if (self.isSpeaking && !self.isPaused) {
          self.stopSpeech();
          setTimeout(() => {
            self._startSpeech(playPauseBtn, progressBar, progressLabel);
          }, 50);
        }
      });

      volumeSlider.addEventListener('input', (e) => {
        self.currentVolume = parseFloat(e.target.value);
        volumeValue.innerText = `${Math.round(self.currentVolume * 100)}%`;
        
        if (self.isSpeaking && !self.isPaused) {
          if (self.volumeUpdateTimeout) {
            clearTimeout(self.volumeUpdateTimeout);
          }
          
          self.volumeUpdateTimeout = setTimeout(() => {
            self.stopSpeech();
            setTimeout(() => {
              self._startSpeech(playPauseBtn, progressBar, progressLabel);
            }, 50);
            self.volumeUpdateTimeout = null;
          }, 150);
        }
      });

      voiceSelect.addEventListener('change', (e) => {
        const selectedIndex = parseInt(e.target.value);
        if (selectedIndex >= 0 && selectedIndex < self.availableVoices.length) {
          self.currentVoice = self.availableVoices[selectedIndex];
        } else {
          self.currentVoice = null;
        }
        if (self.isSpeaking && !self.isPaused) {
          self.stopSpeech();
          setTimeout(() => {
            self._startSpeech(playPauseBtn, progressBar, progressLabel);
          }, 50);
        }
      });

      progressBar.addEventListener('input', (e) => {
        const percentage = Math.min(Math.max(parseFloat(e.target.value), 0), 100);
        progressLabel.innerText = `Progress: ${Math.round(percentage)}%`;
      });

      progressBar.addEventListener('change', (e) => {
        const percentage = Math.min(Math.max(parseFloat(e.target.value), 0), 100);
        self.currentPosition = Math.floor((percentage / 100) * self.currentText.length);
        self.currentPosition = Math.min(self.currentPosition, self.currentText.length - 1);
        
        if (self.isSpeaking) {
          const wasPlaying = !self.isPaused;
          self.stopSpeech();
          if (wasPlaying) {
            setTimeout(() => {
              self._startSpeech(playPauseBtn, progressBar, progressLabel);
            }, 50);
          }
        }
      });
    },

    _startSpeech: function(playBtn, progBar, progLabel) {
      const textToSpeak = this.currentText.substring(this.currentPosition);
      if (!textToSpeak || textToSpeak.trim().length === 0) {
        console.error('No text to speak');
        alert('No text available to read.');
        return;
      }

      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = this.currentRate;
      utterance.pitch = 1;
      utterance.volume = this.currentVolume;
      
      if (this.currentVoice) {
        utterance.voice = this.currentVoice;
      }

      const startPosition = this.currentPosition;
      let lastBoundaryUpdate = Date.now();

      utterance.onboundary = (event) => {
        if (event.name === 'word' || event.name === 'sentence') {
          const absolutePosition = startPosition + event.charIndex;
          
          if (absolutePosition <= this.currentText.length) {
            this.currentPosition = absolutePosition;
            lastBoundaryUpdate = Date.now();
            const progress = Math.min((absolutePosition / this.currentText.length) * 100, 100);
            progBar.value = progress;
            progLabel.innerText = `Progress: ${Math.round(progress)}%`;
          }
        }
      };

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.isPaused = false;
        playBtn.innerHTML = '⏸️ Pause';
        
        if (this.progressInterval) clearInterval(this.progressInterval);
        this.progressInterval = setInterval(() => {
          if (this.isSpeaking && !this.isPaused) {
            const wordsPerMinute = 175 * this.currentRate;
            const charsPerMinute = wordsPerMinute * 5;
            const charsPerSecond = charsPerMinute / 60;
            
            const timeSinceLastBoundary = Date.now() - lastBoundaryUpdate;
            if (timeSinceLastBoundary > 2000) {
              const estimatedProgress = this.currentPosition + (charsPerSecond * (timeSinceLastBoundary / 1000));
              const progress = Math.min((estimatedProgress / this.currentText.length) * 100, 99);
              progBar.value = progress;
              progLabel.innerText = `Progress: ${Math.round(progress)}%`;
            }
          }
        }, 500);
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        playBtn.innerHTML = '▶️ Play';
        this.currentPosition = 0;
        progBar.value = '100';
        progLabel.innerText = 'Progress: 100%';
        if (this.progressInterval) {
          clearInterval(this.progressInterval);
          this.progressInterval = null;
        }
      };

      utterance.onerror = (event) => {
        console.log('Speech synthesis event:', event.error);
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.error('Speech synthesis error:', event);
          alert(`Speech error: ${event.error}. Please try again.`);
        }
        this.isSpeaking = false;
        this.isPaused = false;
        playBtn.innerHTML = '▶️ Play';
        if (this.progressInterval) {
          clearInterval(this.progressInterval);
          this.progressInterval = null;
        }
        if (this.volumeUpdateTimeout) {
          clearTimeout(this.volumeUpdateTimeout);
          this.volumeUpdateTimeout = null;
        }
      };

      this.currentUtterance = utterance;
      
      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Error calling speak():', error);
        alert('Failed to start speech. Please try again.');
        this.isSpeaking = false;
        playBtn.innerHTML = '▶️ Play';
        if (this.progressInterval) {
          clearInterval(this.progressInterval);
          this.progressInterval = null;
        }
        if (this.volumeUpdateTimeout) {
          clearTimeout(this.volumeUpdateTimeout);
          this.volumeUpdateTimeout = null;
        }
      }
    },

    stopSpeech: function() {
      if (this.isSpeaking || this.isPaused) {
        window.speechSynthesis.cancel();
        this.isSpeaking = false;
        this.isPaused = false;
      }
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
      if (this.volumeUpdateTimeout) {
        clearTimeout(this.volumeUpdateTimeout);
        this.volumeUpdateTimeout = null;
      }
    }
  };

  // Initialize on load
  window.SimplifyAudioPlayer.init();
})();

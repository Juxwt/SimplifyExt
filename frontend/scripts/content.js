// Injects a floating action button into the page
(function() {
  if (window.simplifyFabInjected) return;
  window.simplifyFabInjected = true;

  // Global speech helper for Text-to-Speech functionality
  let currentUtterance = null;
  let isSpeaking = false;
  let isPaused = false;
  let currentText = '';
  let currentPosition = 0;
  let currentRate = 0.9;
  let currentVolume = 1;
  let currentVoice = null;
  let availableVoices = [];
  let activePlayerPanel = null;
  let progressInterval = null;
  let volumeUpdateTimeout = null;

  // Load available voices
  function loadVoices() {
    availableVoices = window.speechSynthesis.getVoices();
    console.log('Voices loaded:', availableVoices.length);
    if (availableVoices.length === 0) {
      // Voices might not be loaded yet, wait for voiceschanged event
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        availableVoices = window.speechSynthesis.getVoices();
        console.log('Voices loaded after change event:', availableVoices.length);
      });
    }
  }
  loadVoices();

  function createAudioPlayer(text, containerElement) {
    // Remove any existing player
    if (activePlayerPanel) {
      activePlayerPanel.remove();
      stopSpeech();
    }

    // Validate text
    if (!text || text.trim().length === 0) {
      console.error('Cannot create audio player: text is empty');
      alert('No text available to read aloud.');
      return;
    }

    currentText = text;
    currentPosition = 0;

    // Ensure voices are loaded
    if (availableVoices.length === 0) {
      availableVoices = window.speechSynthesis.getVoices();
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

    // Speed control (dropdown)
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

    // Add speed options
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
      if (speed.value === currentRate) {
        option.selected = true;
      }
      speedSelect.appendChild(option);
    });

    speedContainer.appendChild(speedLabel);
    speedContainer.appendChild(speedSelect);

    // Volume control
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
    volumeSlider.value = currentVolume;
    volumeSlider.style.flex = '1';
    volumeSlider.style.cursor = 'pointer';

    const volumeValue = document.createElement('span');
    volumeValue.innerText = `${Math.round(currentVolume * 100)}%`;
    volumeValue.style.fontSize = '14px';
    volumeValue.style.color = '#666';
    volumeValue.style.minWidth = '40px';

    volumeContainer.appendChild(volumeLabel);
    volumeContainer.appendChild(volumeSlider);
    volumeContainer.appendChild(volumeValue);

    // Voice selection
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

    // Populate voices
    if (availableVoices.length === 0) {
      availableVoices = window.speechSynthesis.getVoices();
    }
    
    // Add default option if no voices loaded yet
    if (availableVoices.length === 0) {
      const option = document.createElement('option');
      option.value = '-1';
      option.innerText = 'Default Voice';
      option.selected = true;
      voiceSelect.appendChild(option);
    } else {
      availableVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.innerText = `${voice.name} (${voice.lang})`;
        if (voice.default || index === 0) {
          option.selected = true;
          currentVoice = voice;
        }
        voiceSelect.appendChild(option);
      });
    }

    voiceContainer.appendChild(voiceLabel);
    voiceContainer.appendChild(voiceSelect);

    // Assemble player
    playerPanel.appendChild(btnContainer);
    playerPanel.appendChild(progressContainer);
    playerPanel.appendChild(speedContainer);
    playerPanel.appendChild(volumeContainer);
    playerPanel.appendChild(voiceContainer);

    // Event listeners
    playPauseBtn.addEventListener('click', () => {
      if (isSpeaking && !isPaused) {
        // Pause
        window.speechSynthesis.pause();
        isPaused = true;
        playPauseBtn.innerHTML = '▶️ Play';
        // Pause progress tracking
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
      } else if (isPaused) {
        // Resume
        window.speechSynthesis.resume();
        isPaused = false;
        playPauseBtn.innerHTML = '⏸️ Pause';
      } else {
        // Start playing
        startSpeech(playPauseBtn, progressBar, progressLabel);
      }
    });

    stopBtn.addEventListener('click', () => {
      stopSpeech();
      playPauseBtn.innerHTML = '▶️ Play';
      progressBar.value = '0';
      progressLabel.innerText = 'Progress: 0%';
      currentPosition = 0;
    });

    speedSelect.addEventListener('change', (e) => {
      currentRate = parseFloat(e.target.value);
      if (isSpeaking && !isPaused) {
        // Seamlessly restart with new speed from current position
        stopSpeech();
        // Small delay to ensure previous speech is fully stopped
        setTimeout(() => {
          startSpeech(playPauseBtn, progressBar, progressLabel);
        }, 50);
      }
    });

    volumeSlider.addEventListener('input', (e) => {
      currentVolume = parseFloat(e.target.value);
      volumeValue.innerText = `${Math.round(currentVolume * 100)}%`;
      
      // Debounce volume changes to avoid restarting too frequently while dragging
      if (isSpeaking && !isPaused) {
        if (volumeUpdateTimeout) {
          clearTimeout(volumeUpdateTimeout);
        }
        
        volumeUpdateTimeout = setTimeout(() => {
          // Seamlessly restart with new volume from current position
          stopSpeech();
          setTimeout(() => {
            startSpeech(playPauseBtn, progressBar, progressLabel);
          }, 50);
          volumeUpdateTimeout = null;
        }, 150); // Wait 150ms after user stops dragging
      }
    });

    voiceSelect.addEventListener('change', (e) => {
      const selectedIndex = parseInt(e.target.value);
      if (selectedIndex >= 0 && selectedIndex < availableVoices.length) {
        currentVoice = availableVoices[selectedIndex];
      } else {
        currentVoice = null; // Use default voice
      }
      if (isSpeaking && !isPaused) {
        // Seamlessly restart with new voice from current position
        stopSpeech();
        // Small delay to ensure previous speech is fully stopped
        setTimeout(() => {
          startSpeech(playPauseBtn, progressBar, progressLabel);
        }, 50);
      }
    });

    progressBar.addEventListener('input', (e) => {
      const percentage = Math.min(Math.max(parseFloat(e.target.value), 0), 100);
      progressLabel.innerText = `Progress: ${Math.round(percentage)}%`;
    });

    progressBar.addEventListener('change', (e) => {
      // Scrub to position
      const percentage = Math.min(Math.max(parseFloat(e.target.value), 0), 100);
      currentPosition = Math.floor((percentage / 100) * currentText.length);
      // Ensure position doesn't exceed text length
      currentPosition = Math.min(currentPosition, currentText.length - 1);
      
      if (isSpeaking) {
        const wasPlaying = !isPaused;
        stopSpeech();
        if (wasPlaying) {
          // Small delay to ensure previous speech is fully stopped
          setTimeout(() => {
            startSpeech(playPauseBtn, progressBar, progressLabel);
          }, 50);
        }
      }
    });

    containerElement.appendChild(playerPanel);
    activePlayerPanel = playerPanel;

    function startSpeech(playBtn, progBar, progLabel) {
      // Validate text before speaking
      const textToSpeak = currentText.substring(currentPosition);
      if (!textToSpeak || textToSpeak.trim().length === 0) {
        console.error('No text to speak');
        alert('No text available to read.');
        return;
      }

      // Cancel any existing speech first
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = currentRate;
      utterance.pitch = 1;
      utterance.volume = currentVolume;
      
      // Set voice if available
      if (currentVoice) {
        utterance.voice = currentVoice;
      }

      console.log('Starting speech with:', {
        textLength: textToSpeak.length,
        rate: currentRate,
        volume: currentVolume,
        voice: currentVoice ? currentVoice.name : 'default',
        startPosition: currentPosition
      });

      // Track the starting position for this utterance
      const startPosition = currentPosition;
      let lastBoundaryUpdate = Date.now();

      utterance.onboundary = (event) => {
        if (event.name === 'word' || event.name === 'sentence') {
          // Calculate absolute position: starting position + progress through current utterance
          const absolutePosition = startPosition + event.charIndex;
          
          // Don't let it exceed the text length
          if (absolutePosition <= currentText.length) {
            currentPosition = absolutePosition;
            lastBoundaryUpdate = Date.now();
            const progress = Math.min((absolutePosition / currentText.length) * 100, 100);
            progBar.value = progress;
            progLabel.innerText = `Progress: ${Math.round(progress)}%`;
          }
        }
      };

      utterance.onstart = () => {
        isSpeaking = true;
        isPaused = false;
        playBtn.innerHTML = '⏸️ Pause';
        
        // Fallback progress tracker in case onboundary events don't fire
        // Estimate based on average reading speed
        if (progressInterval) clearInterval(progressInterval);
        progressInterval = setInterval(() => {
          if (isSpeaking && !isPaused) {
            // Estimate progress: average speaking speed is ~150-200 words per minute
            // Adjust based on current rate
            const wordsPerMinute = 175 * currentRate;
            const charsPerMinute = wordsPerMinute * 5; // Average word length
            const charsPerSecond = charsPerMinute / 60;
            
            // Only use fallback if boundary events haven't fired recently
            const timeSinceLastBoundary = Date.now() - lastBoundaryUpdate;
            if (timeSinceLastBoundary > 2000) {
              const estimatedProgress = currentPosition + (charsPerSecond * (timeSinceLastBoundary / 1000));
              const progress = Math.min((estimatedProgress / currentText.length) * 100, 99);
              progBar.value = progress;
              progLabel.innerText = `Progress: ${Math.round(progress)}%`;
            }
          }
        }, 500);
      };

      utterance.onend = () => {
        isSpeaking = false;
        isPaused = false;
        playBtn.innerHTML = '▶️ Play';
        currentPosition = 0;
        progBar.value = '100';
        progLabel.innerText = 'Progress: 100%';
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
      };

      utterance.onerror = (event) => {
        console.log('Speech synthesis event:', event.error);
        // Don't show alert for "interrupted" or "canceled" - these are intentional
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.error('Speech synthesis error:', event);
          alert(`Speech error: ${event.error}. Please try again.`);
        }
        isSpeaking = false;
        isPaused = false;
        playBtn.innerHTML = '▶️ Play';
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
        if (volumeUpdateTimeout) {
          clearTimeout(volumeUpdateTimeout);
          volumeUpdateTimeout = null;
        }
      };

      currentUtterance = utterance;
      
      // Speak the utterance
      try {
        window.speechSynthesis.speak(utterance);
        console.log('Speech started successfully');
      } catch (error) {
        console.error('Error calling speak():', error);
        alert('Failed to start speech. Please try again.');
        isSpeaking = false;
        playBtn.innerHTML = '▶️ Play';
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
        if (volumeUpdateTimeout) {
          clearTimeout(volumeUpdateTimeout);
          volumeUpdateTimeout = null;
        }
      }
    }
  }

  function stopSpeech() {
    if (isSpeaking || isPaused) {
      window.speechSynthesis.cancel();
      isSpeaking = false;
      isPaused = false;
    }
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    if (volumeUpdateTimeout) {
      clearTimeout(volumeUpdateTimeout);
      volumeUpdateTimeout = null;
    }
  }

  const fab = document.createElement('button');
  fab.innerText = 'Clarify';
  fab.id = 'simplify-fab';
  fab.style.position = 'fixed';
  fab.style.bottom = '32px';
  fab.style.right = '32px';
  fab.style.zIndex = '999999';
  fab.style.background = '#1976d2';
  fab.style.color = '#ffffff';
  fab.style.border = 'none';
  fab.style.borderRadius = '50%';
  fab.style.width = '64px';
  fab.style.height = '64px';
  fab.style.fontSize = '18px';
  fab.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
  fab.style.cursor = 'pointer';
  fab.style.outline = 'none';
  fab.style.transition = 'background 0.2s';

  fab.addEventListener('mouseenter', () => {
    fab.style.background = '#1565c0';
  });
  fab.addEventListener('mouseleave', () => {
    fab.style.background = '#1976d2';
  });

  fab.addEventListener('click', () => {
    showOverlay();
  });

  // Wait for body to be ready before appending
  if (document.body) {
    document.body.appendChild(fab);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.body) {
        document.body.appendChild(fab);
      }
    });
  }

  // Extract page content
  function extractPageContent() {
    // Get main text content from the page
    const bodyText = document.body.innerText || document.body.textContent;
    
    // Get page title
    const title = document.title;
    
    // Get page URL
    const url = window.location.href;
    
    return {
      url: url,
      text_content: bodyText.substring(0, 10000) // Limit to first 10k characters
    };
  }

  // Create and show overlay
  async function showOverlay() {
    // Check if overlay already exists
    if (document.getElementById('simplify-overlay')) return;

    // Create overlay container
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

    // Create content panel (slides from bottom)
    const panel = document.createElement('div');
    panel.style.backgroundColor = '#ffffff';
    panel.style.width = '100%';
    panel.style.maxHeight = '60%';
    panel.style.borderRadius = '14px 14px 0 0';
    panel.style.boxShadow = '0 -4px 16px rgba(0, 0, 0, 0.2)';
    panel.style.padding = '24px';
    panel.style.overflowY = 'auto';
    panel.style.animation = 'slideUp 0.3s ease-out';
    panel.style.position = 'relative';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerText = '✕';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '16px';
    closeBtn.style.right = '16px';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.color = '#666';
    closeBtn.addEventListener('click', () => {
      stopSpeech(); // Stop any playing audio
      document.body.removeChild(overlay);
    });

    // TL;DR Section
    const tldr = document.createElement('div');
    tldr.id = 'tldr-section';
    tldr.style.marginBottom = '24px';
    
    // Create TL;DR header WITHOUT Listen button initially
    const tldrHeader = document.createElement('div');
    tldrHeader.style.display = 'flex';
    tldrHeader.style.alignItems = 'center';
    tldrHeader.style.gap = '12px';
    tldrHeader.style.marginBottom = '16px';
    
    const tldrTitle = document.createElement('h2');
    tldrTitle.style.fontSize = '24px';
    tldrTitle.style.color = '#333';
    tldrTitle.style.margin = '0';
    tldrTitle.innerText = 'TL;DR';
    
    // Loading spinner for TL;DR
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
          <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #1976d2 0%, #64b5f6 50%, #1976d2 100%); background-size: 200% 100%; animation: loadingBar 1.5s ease-in-out infinite;"></div>
        </div>
        <span style="font-size: 14px; color: #666;">Loading...</span>
      </div>
    `;
    tldr.appendChild(tldrContent);

    // Clean Content Section
    const content = document.createElement('div');
    content.id = 'content-section';
    content.style.marginTop = '24px';
    
    // Create Simplified Content header WITHOUT Listen button initially
    const contentHeader = document.createElement('div');
    contentHeader.style.display = 'flex';
    contentHeader.style.alignItems = 'center';
    contentHeader.style.gap = '12px';
    contentHeader.style.marginBottom = '16px';
    
    const contentTitle = document.createElement('h2');
    contentTitle.style.fontSize = '24px';
    contentTitle.style.color = '#333';
    contentTitle.style.margin = '0';
    contentTitle.innerText = 'Content Summary';
    
    // Loading spinner for Simplified Content
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
            <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #1976d2 0%, #64b5f6 50%, #1976d2 100%); background-size: 200% 100%; animation: loadingBar 1.5s ease-in-out infinite;"></div>
          </div>
          <span style="font-size: 14px; color: #666;">Loading...</span>
        </div>
      `;
    content.appendChild(contentBody);

    // Find Action Button
    const actionBtn = document.createElement('button');
    actionBtn.innerText = 'Find Main Action';
    actionBtn.style.marginTop = '24px';
    actionBtn.style.background = '#1976d2';
    actionBtn.style.color = '#fff';
    actionBtn.style.border = 'none';
    actionBtn.style.borderRadius = '8px';
    actionBtn.style.padding = '12px 24px';
    actionBtn.style.fontSize = '16px';
    actionBtn.style.cursor = 'pointer';
    actionBtn.addEventListener('click', () => {
      findMainAction();
    });

    // Assemble panel
    panel.appendChild(closeBtn);
    panel.appendChild(tldr);
    panel.appendChild(content);
    panel.appendChild(actionBtn);
    overlay.appendChild(panel);

    // Add CSS animations
    const style = document.createElement('style');
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
    `;
    document.head.appendChild(style);

    // Add to page
    document.body.appendChild(overlay);

    // Close on background click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        stopSpeech(); // Stop any playing audio
        document.body.removeChild(overlay);
      }
    });

    // Extract and process page content
    const pageData = extractPageContent();
    
    try {
      const response = await fetch('https://simplify-ext.vercel.app/api/process-page', {
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
      const tldrSection = document.getElementById('tldr-section');
      if (tldrSection && result.summary_points) {
        const bulletPoints = result.summary_points.map(point => `<li>${point}</li>`).join('');
        
        // Recreate the header with Listen button (now that content is loaded)
        const tldrHeader = document.createElement('div');
        tldrHeader.style.display = 'flex';
        tldrHeader.style.alignItems = 'center';
        tldrHeader.style.gap = '12px';
        tldrHeader.style.marginBottom = '16px';
        
        const tldrTitle = document.createElement('h2');
        tldrTitle.style.fontSize = '24px';
        tldrTitle.style.color = '#333';
        tldrTitle.style.margin = '0';
        tldrTitle.innerText = 'TL;DR';
        
        // NOW add the Listen button since content is ready
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
          if (!isSpeaking) tldrListenBtn.style.background = '#45a049';
        });
        tldrListenBtn.addEventListener('mouseleave', () => {
          if (!isSpeaking) tldrListenBtn.style.background = '#4CAF50';
        });
        tldrListenBtn.addEventListener('click', () => {
          const tldrList = tldrSection.querySelector('ul');
          if (tldrList) {
            const text = tldrList.innerText || tldrList.textContent;
            createAudioPlayer(text, tldrSection);
          }
        });
        
        tldrHeader.appendChild(tldrTitle);
        tldrHeader.appendChild(tldrListenBtn);
        
        const tldrList = document.createElement('ul');
        tldrList.style.fontSize = '18px';
        tldrList.style.lineHeight = '1.8';
        tldrList.style.color = '#555';
        tldrList.innerHTML = bulletPoints;
        
        tldrSection.innerHTML = '';
        tldrSection.appendChild(tldrHeader);
        tldrSection.appendChild(tldrList);
      }

      // Update Clean Content
      const contentSection = document.getElementById('content-section');
      if (contentSection && result.clean_text) {
        // Recreate the header with Listen button (now that content is loaded)
        const contentHeader = document.createElement('div');
        contentHeader.style.display = 'flex';
        contentHeader.style.alignItems = 'center';
        contentHeader.style.gap = '12px';
        contentHeader.style.marginBottom = '16px';
        
        const contentTitle = document.createElement('h2');
        contentTitle.style.fontSize = '24px';
        contentTitle.style.color = '#333';
        contentTitle.style.margin = '0';
        contentTitle.innerText = 'Simplified Content';
        
        // NOW add the Listen button since content is ready
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
          if (!isSpeaking) contentListenBtn.style.background = '#45a049';
        });
        contentListenBtn.addEventListener('mouseleave', () => {
          if (!isSpeaking) contentListenBtn.style.background = '#4CAF50';
        });
        contentListenBtn.addEventListener('click', () => {
          const contentPara = contentSection.querySelector('p');
          if (contentPara) {
            const text = contentPara.innerText || contentPara.textContent;
            createAudioPlayer(text, contentSection);
          }
        });
        
        contentHeader.appendChild(contentTitle);
        contentHeader.appendChild(contentListenBtn);
        
        const contentPara = document.createElement('p');
        contentPara.style.fontSize = '18px';
        contentPara.style.lineHeight = '1.8';
        contentPara.style.color = '#555';
        contentPara.innerText = result.clean_text;
        
        contentSection.innerHTML = '';
        contentSection.appendChild(contentHeader);
        contentSection.appendChild(contentPara);
      }

    } catch (error) {
      console.error('Error processing page:', error);
      const tldrSection = document.getElementById('tldr-section');
      if (tldrSection) {
        tldrSection.innerHTML = `
          <h2 style="font-size: 24px; margin-bottom: 16px; color: #333;">Error</h2>
          <p style="font-size: 18px; line-height: 1.8; color: #ff0000;">
            Failed to simplify page. Please try again.
          </p>
        `;
      }
    }
  }

  // Find and highlight main action
  async function findMainAction() {
    const pageData = extractPageContent();
    
    try {
      const response = await fetch('https://simplify-ext.vercel.app/api/find-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData)
      });

      if (!response.ok) {
        throw new Error('Failed to find action');
      }

      const result = await response.json();

      if (result.recommended_action) {
        // Search for button/link with this text
        const elements = Array.from(document.querySelectorAll('button, a, input[type="submit"], input[type="button"]'));
        
        for (const element of elements) {
          const text = element.innerText || element.value || '';
          if (text.toLowerCase().includes(result.recommended_action.toLowerCase())) {
            // Highlight the element
            element.style.outline = '4px solid #ff6b00';
            element.style.outlineOffset = '4px';
            element.style.transition = 'outline 0.3s ease';
            
            // Scroll to element
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Remove highlight after 5 seconds
            setTimeout(() => {
              element.style.outline = '';
            }, 5000);
            
            break;
          }
        }
        
        alert(`Found action: "${result.recommended_action}"`);
      } else {
        alert('No clear action found on this page.');
      }

    } catch (error) {
      console.error('Error finding action:', error);
      alert('Failed to find main action. Please try again.');
    }
  }
})();

// Action Finder Module - Scans DOM for interactive elements locally
(function() {
  window.SimplifyActionFinder = {
    
    /**
     * Scans the page for all interactive elements
     * @returns {Array} Array of {element: DOMNode, label: string} objects
     */
    scan: function() {
      // Query all interactive elements
      const selectors = [
        'button',
        'a',
        'input[type="submit"]',
        'input[type="button"]',
        'div[role="button"]',
        '[onclick]'
      ];
      
      const elements = Array.from(document.querySelectorAll(selectors.join(', ')));
      
      // Filter and map to useful format
      const actions = [];
      
      for (const element of elements) {
        // Skip hidden elements
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        
        // Check if element is actually visible
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          continue;
        }
        
        // Get label from various sources
        let label = '';
        
        // Try innerText first
        if (element.innerText && element.innerText.trim()) {
          label = element.innerText.trim();
        }
        // Try value for inputs
        else if (element.value && element.value.trim()) {
          label = element.value.trim();
        }
        // Try aria-label
        else if (element.getAttribute('aria-label')) {
          label = element.getAttribute('aria-label').trim();
        }
        // Try title
        else if (element.getAttribute('title')) {
          label = element.getAttribute('title').trim();
        }
        // Try alt for images inside links
        else if (element.tagName === 'A') {
          const img = element.querySelector('img');
          if (img && img.alt) {
            label = img.alt.trim();
          }
        }
        
        // Skip if no label found
        if (!label) continue;
        
        // Truncate very long labels
        if (label.length > 100) {
          label = label.substring(0, 97) + '...';
        }
        
        // Skip SimplifyExt's own UI elements
        if (element.id && element.id.startsWith('simplify-')) continue;
        if (element.closest('#simplify-overlay')) continue;
        if (element.closest('#simplify-fab')) continue;
        
        actions.push({
          element: element,
          label: label
        });
      }
      
      // Remove duplicates (same label and same element type)
      const seen = new Map();
      const unique = [];
      
      for (const action of actions) {
        const key = `${action.element.tagName}-${action.label}`;
        if (!seen.has(key)) {
          seen.set(key, true);
          unique.push(action);
        }
      }
      
      console.log(`Found ${unique.length} interactive elements`);
      return unique;
    },

    /**
     * Highlights a specific element on the page
     * @param {DOMElement} element - The element to highlight
     */
    highlight: function(element) {
      // Remove any existing highlights first
      this.removeHighlight();
      
      // Store reference for later removal
      this._highlightedElement = element;
      
      // Scroll element into view
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });
      
      // Apply highlight style
      element.style.outline = '4px solid #ff6b00';
      element.style.outlineOffset = '4px';
      element.style.transition = 'outline 0.3s ease';
      element.style.boxShadow = '0 0 20px rgba(255, 107, 0, 0.6)';
      
      // Add pulsating animation
      element.style.animation = 'simplify-pulse 1.5s ease-in-out infinite';
      
      // Add the pulsating animation if not already added
      if (!document.getElementById('simplify-highlight-animation')) {
        const style = document.createElement('style');
        style.id = 'simplify-highlight-animation';
        style.textContent = `
          @keyframes simplify-pulse {
            0%, 100% { 
              outline-color: #ff6b00;
              box-shadow: 0 0 20px rgba(255, 107, 0, 0.6);
            }
            50% { 
              outline-color: #ff9f4d;
              box-shadow: 0 0 30px rgba(255, 107, 0, 0.9);
            }
          }
        `;
        document.head.appendChild(style);
      }
    },

    /**
     * Removes highlight from the currently highlighted element
     */
    removeHighlight: function() {
      if (this._highlightedElement) {
        this._highlightedElement.style.outline = '';
        this._highlightedElement.style.outlineOffset = '';
        this._highlightedElement.style.boxShadow = '';
        this._highlightedElement.style.animation = '';
        this._highlightedElement = null;
      }
    },

    _highlightedElement: null
  };
})();

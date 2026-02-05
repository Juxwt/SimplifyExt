// Action Finder Module - Scans DOM for interactive elements locally
(function() {
  window.SimplifyActionFinder = {
    API_BASE_URL: 'https://simplify-ext.vercel.app',
    
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
      // Validate element exists and is in DOM
      if (!element || !element.isConnected) {
        console.error('Cannot highlight: element is null or not in DOM');
        return;
      }

      // Remove any existing highlights first
      this.removeHighlight();
      
      // Store reference for later removal
      this._highlightedElement = element;
      
      // Store original styles to restore later
      this._originalStyles = {
        outline: element.style.outline,
        outlineOffset: element.style.outlineOffset,
        boxShadow: element.style.boxShadow,
        animation: element.style.animation,
        transition: element.style.transition,
        position: element.style.position,
        zIndex: element.style.zIndex
      };
      
      // Scroll element into view with error handling
      try {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      } catch (e) {
        console.warn('ScrollIntoView failed:', e);
      }
      
      // Apply highlight styles with !important to override page CSS
      element.style.setProperty('outline', '4px solid #ff6b00', 'important');
      element.style.setProperty('outline-offset', '4px', 'important');
      element.style.setProperty('box-shadow', '0 0 20px rgba(255, 107, 0, 0.6)', 'important');
      element.style.setProperty('transition', 'outline 0.3s ease', 'important');
      element.style.setProperty('animation', 'simplify-pulse 1.5s ease-in-out infinite', 'important');
      
      // Ensure element is visible above other content
      const computedZIndex = window.getComputedStyle(element).zIndex;
      if (computedZIndex === 'auto' || parseInt(computedZIndex) < 999998) {
        element.style.setProperty('position', 'relative', 'important');
        element.style.setProperty('z-index', '999998', 'important');
      }
      
      // Add the pulsating animation if not already added
      if (!document.getElementById('simplify-highlight-animation')) {
        const style = document.createElement('style');
        style.id = 'simplify-highlight-animation';
        style.textContent = `
          @keyframes simplify-pulse {
            0%, 100% { 
              outline-color: #ff6b00 !important;
              box-shadow: 0 0 20px rgba(255, 107, 0, 0.6) !important;
            }
            50% { 
              outline-color: #ff9f4d !important;
              box-shadow: 0 0 30px rgba(255, 107, 0, 0.9) !important;
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
      if (this._highlightedElement && this._highlightedElement.isConnected) {
        // Restore original styles
        if (this._originalStyles) {
          this._highlightedElement.style.outline = this._originalStyles.outline;
          this._highlightedElement.style.outlineOffset = this._originalStyles.outlineOffset;
          this._highlightedElement.style.boxShadow = this._originalStyles.boxShadow;
          this._highlightedElement.style.animation = this._originalStyles.animation;
          this._highlightedElement.style.transition = this._originalStyles.transition;
          this._highlightedElement.style.position = this._originalStyles.position;
          this._highlightedElement.style.zIndex = this._originalStyles.zIndex;
          this._originalStyles = null;
        } else {
          // Fallback: just remove the properties
          this._highlightedElement.style.removeProperty('outline');
          this._highlightedElement.style.removeProperty('outline-offset');
          this._highlightedElement.style.removeProperty('box-shadow');
          this._highlightedElement.style.removeProperty('animation');
          this._highlightedElement.style.removeProperty('transition');
          this._highlightedElement.style.removeProperty('position');
          this._highlightedElement.style.removeProperty('z-index');
        }
      }
      
      this._highlightedElement = null;
    },

    /**
     * Filters actions using AI to remove noise (ads, tracking, footer links)
     * @param {Array} actions - Array of {element: DOMNode, label: string} objects
     * @returns {Promise<Array>} Filtered array of actions
     */
    filterWithAI: async function(actions) {
      // Handle empty or small lists
      if (actions.length === 0) return [];
      if (actions.length <= 5) return actions; // Too small to benefit from filtering
      
      try {
        // Limit to first 100 items to avoid token limits
        const itemsToFilter = actions.slice(0, 100);
        
        // Extract just the labels
        const labels = itemsToFilter.map(a => a.label);
        
        // Send to API
        const response = await fetch(`${this.API_BASE_URL}/api/filter-actions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ labels: labels })
        });

        if (!response.ok) {
          throw new Error('Failed to filter actions');
        }

        const result = await response.json();
        
        // Extract filtered actions using the valid indices
        const filteredActions = result.valid_indices.map(idx => itemsToFilter[idx]);
        
        console.log(`Filtered ${actions.length} actions down to ${filteredActions.length} useful actions`);
        return filteredActions;

      } catch (error) {
        console.error('Error filtering actions:', error);
        // Fallback: return original list if API fails (better to show noisy list than nothing)
        console.warn('Falling back to unfiltered action list');
        return actions;
      }
    },

    // Private properties
    _highlightedElement: null,
    _originalStyles: null
  };
})();

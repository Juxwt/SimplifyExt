// Action Finder Module - Handles finding and highlighting main action buttons
(function() {
  window.SimplifyActionFinder = {
    API_BASE_URL: 'https://simplify-ext.vercel.app',

    find: async function() {
      const pageData = this._extractPageContent();
      
      try {
        const response = await fetch(`${this.API_BASE_URL}/api/find-action`, {
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
          this._highlightAction(result.recommended_action);
          alert(`Found action: "${result.recommended_action}"`);
        } else {
          alert('No clear action found on this page.');
        }

      } catch (error) {
        console.error('Error finding action:', error);
        alert('Failed to find main action. Please try again.');
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

    _highlightAction: function(actionText) {
      // Search for button/link with this text
      const elements = Array.from(document.querySelectorAll('button, a, input[type="submit"], input[type="button"]'));
      
      for (const element of elements) {
        const text = element.innerText || element.value || '';
        if (text.toLowerCase().includes(actionText.toLowerCase())) {
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
    }
  };
})();

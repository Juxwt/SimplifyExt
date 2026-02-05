// Injects a floating action button into the page
(function() {
  if (window.simplifyFabInjected) return;
  window.simplifyFabInjected = true;

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
    panel.style.maxHeight = '80%';
    panel.style.borderRadius = '16px 16px 0 0';
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
      document.body.removeChild(overlay);
    });

    // TL;DR Section
    const tldr = document.createElement('div');
    tldr.id = 'tldr-section';
    tldr.style.marginBottom = '24px';
    tldr.innerHTML = `
      <h2 style="font-size: 24px; margin-bottom: 16px; color: #333;">TL;DR</h2>
      <ul style="font-size: 18px; line-height: 1.8; color: #555;">
        <li>Loading summary...</li>
        <li>Please wait while we simplify this page</li>
        <li>This will only take a moment</li>
      </ul>
    `;

    // Clean Content Section
    const content = document.createElement('div');
    content.id = 'content-section';
    content.style.marginTop = '24px';
    content.innerHTML = `
      <h2 style="font-size: 24px; margin-bottom: 16px; color: #333;">Simplified Content</h2>
      <p style="font-size: 18px; line-height: 1.8; color: #555;">
        Content will appear here after processing...
      </p>
    `;

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
    `;
    document.head.appendChild(style);

    // Add to page
    document.body.appendChild(overlay);

    // Close on background click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
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
        tldrSection.innerHTML = `
          <h2 style="font-size: 24px; margin-bottom: 16px; color: #333;">TL;DR</h2>
          <ul style="font-size: 18px; line-height: 1.8; color: #555;">
            ${bulletPoints}
          </ul>
        `;
      }

      // Update Clean Content
      const contentSection = document.getElementById('content-section');
      if (contentSection && result.clean_text) {
        contentSection.innerHTML = `
          <h2 style="font-size: 24px; margin-bottom: 16px; color: #333;">Simplified Content</h2>
          <p style="font-size: 18px; line-height: 1.8; color: #555;">
            ${result.clean_text}
          </p>
        `;
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

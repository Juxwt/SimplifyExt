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

  // Create and show overlay
  function showOverlay() {
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
      alert('Find Action feature coming soon!');
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
  }
})();

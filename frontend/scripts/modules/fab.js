// Floating Action Button Module
(function() {
  window.SimplifyFAB = {
    button: null,
    isDragging: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0,

    init: function(clickHandler) {
      if (window.simplifyFabInjected) return;
      window.simplifyFabInjected = true;

      this.button = this._createButton();
      this._attachClickHandler(clickHandler);
      this._makeDraggable();
      this._appendToPage();
    },

    _createButton: function() {
      const fab = document.createElement('button');
      fab.innerText = '🔍';
      fab.id = 'simplify-fab';
      fab.style.position = 'fixed';
      fab.style.bottom = '32px';
      fab.style.right = '32px';
      fab.style.left = 'auto';
      fab.style.top = 'auto';
      fab.style.zIndex = '999999';
      fab.style.background = '#1976d2';
      fab.style.color = '#ffffff';
      fab.style.border = 'none';
      fab.style.borderRadius = '50%';
      fab.style.width = '64px';
      fab.style.height = '64px';
      fab.style.fontSize = '28px';
      fab.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      fab.style.cursor = 'grab';
      fab.style.outline = 'none';
      fab.style.transition = 'background 0.2s';
      fab.style.userSelect = 'none';

      fab.addEventListener('mouseenter', () => {
        if (!this.isDragging) {
          fab.style.background = '#1565c0';
        }
      });
      fab.addEventListener('mouseleave', () => {
        if (!this.isDragging) {
          fab.style.background = '#1976d2';
        }
      });

      return fab;
    },

    _makeDraggable: function() {
      this.button.addEventListener('mousedown', (e) => {
        // Prevent text selection
        e.preventDefault();
        
        this.isDragging = true;
        this.hasMoved = false;
        this.startX = e.clientX;
        this.startY = e.clientY;
        
        // Get current position
        const rect = this.button.getBoundingClientRect();
        this.initialLeft = rect.left;
        this.initialTop = rect.top;
        
        // Change cursor and style
        this.button.style.cursor = 'grabbing';
        this.button.style.transition = 'none';
        this.button.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
        
        // Convert to left/top positioning
        this.button.style.right = 'auto';
        this.button.style.bottom = 'auto';
        this.button.style.left = this.initialLeft + 'px';
        this.button.style.top = this.initialTop + 'px';
      });

      document.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.startX;
        const deltaY = e.clientY - this.startY;
        
        // Mark as moved if dragged more than 5 pixels
        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
          this.hasMoved = true;
        }
        
        let newLeft = this.initialLeft + deltaX;
        let newTop = this.initialTop + deltaY;
        
        // Keep button within viewport bounds
        const maxLeft = window.innerWidth - 64;
        const maxTop = window.innerHeight - 64;
        
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));
        
        this.button.style.left = newLeft + 'px';
        this.button.style.top = newTop + 'px';
      });

      document.addEventListener('mouseup', () => {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.button.style.cursor = 'grab';
        this.button.style.transition = 'background 0.2s, box-shadow 0.2s';
        this.button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      });
    },

    _attachClickHandler: function(clickHandler) {
      if (clickHandler && this.button) {
        this.button.addEventListener('click', (e) => {
          // Only trigger click if it wasn't a drag
          if (!this.hasMoved) {
            clickHandler(e);
          }
          // Reset hasMoved for next interaction
          this.hasMoved = false;
        });
      }
    },

    _appendToPage: function() {
      if (document.body) {
        document.body.appendChild(this.button);
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          if (document.body) {
            document.body.appendChild(this.button);
          }
        });
      }
    }
  };
})();

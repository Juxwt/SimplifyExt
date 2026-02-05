// Floating Action Button Module
(function() {
  window.SimplifyFAB = {
    button: null,

    init: function(clickHandler) {
      if (window.simplifyFabInjected) return;
      window.simplifyFabInjected = true;

      this.button = this._createButton();
      this._attachClickHandler(clickHandler);
      this._appendToPage();
    },

    _createButton: function() {
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

      return fab;
    },

    _attachClickHandler: function(clickHandler) {
      if (clickHandler && this.button) {
        this.button.addEventListener('click', clickHandler);
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

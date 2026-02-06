// Configuration - Themes, settings, and constants
(function() {
  window.SimplifyConfig = {
    // API Configuration
    API_BASE_URL: 'https://simplify-ext.vercel.app',
    USE_MOCK_DATA: false, // Toggle between mock and real API
    
    // Default Settings
    DEFAULT_THEME: 'light',
    DEFAULT_FONT_SIZE: 18,
    MIN_FONT_SIZE: 14,
    MAX_FONT_SIZE: 26,
    FONT_SIZE_STEP: 2,
    
    // UI Constants
    Z_INDEX: {
      OVERLAY: '1000000',
      FAB: '999999'
    },
    
    ANIMATION_DURATION: {
      FADE_IN: '0.3s',
      SLIDE_UP: '0.3s',
      LOADING_BAR: '2.5s'
    },
    
    // Theme Definitions
    themes: {
      light: {
        bgColor: '#FAF7F0',
        textColor: '#333',
        headingColor: '#1a1a1a'
      },
      sepia: {
        bgColor: '#F5E6D3',
        textColor: '#4a3f2f',
        headingColor: '#2d2416'
      }
    },
    
    // Available theme options for UI
    themeOptions: [
      { name: 'light', emoji: '☀️', label: 'Light' },
      { name: 'sepia', emoji: '📜', label: 'Sepia' }
    ],
    
    // Panel Dimensions
    PANEL: {
      MAX_WIDTH: '100%',
      MAX_HEIGHT: '55%',
      BORDER_RADIUS: '14px 14px 0 0',
      PADDING: '24px',
      PADDING_RIGHT: '20px'
    },
    
    // API Settings
    API: {
      TIMEOUT: 30000, // 30 seconds
      MAX_CONTENT_LENGTH: 10000 // characters
    }
  };
})();

// Mock Data - Test data for UI/UX development
(function() {
  window.SimplifyMockData = {
    // Default mock response
    defaultResponse: {
      summary_points: [
        'This is a sample bullet point demonstrating how the TL;DR section will look',
        'You can adjust colors, spacing, and fonts without waiting for the API',
        'The mock data helps you iterate quickly on the design',
        'Change this mock data to test different content lengths and formats'
      ],
      clean_text: 'This is sample simplified content that demonstrates how the content section will appear. You can now work on styling, themes, fonts, spacing, and other UI elements without making API calls. This text is long enough to show how multiple lines look with the current styling. Feel free to modify the mock data in the _fetchAndDisplayContent method to test different scenarios and content variations.'
    },
    
    // Alternative mock scenarios for testing
    scenarios: {
      // Short content
      short: {
        summary_points: [
          'Brief summary point one',
          'Brief summary point two',
          'Brief summary point three'
        ],
        clean_text: 'Short content example for testing compact layouts.'
      },
      
      // Long content
      long: {
        summary_points: [
          'This is a much longer bullet point that demonstrates how the layout handles extensive text content that might wrap to multiple lines in the TL;DR section',
          'Another lengthy point discussing various aspects of the content in great detail to test how the UI responds to verbose summaries',
          'The third comprehensive bullet point continues the pattern of extended text to ensure the design remains clean and readable even with substantial amounts of information'
        ],
        clean_text: 'This is an extended simplified content example that contains significantly more text to test how the overlay handles longer paragraphs and multiple lines of content. The purpose is to ensure that the styling, spacing, and readability remain optimal even when users are viewing substantially longer articles or documents. This helps developers verify that the UI scales appropriately and maintains good user experience regardless of content length. Additional sentences can be added here to test scrolling behavior and ensure that the panel properly handles overflow situations without breaking the layout or causing visual issues.'
      },
      
      // Error simulation
      error: {
        summary_points: [],
        clean_text: ''
      }
    },
    
    // Get mock delay (simulates network latency)
    getDelay: function() {
      return 800; // milliseconds
    },
    
    // Get mock response based on scenario
    getResponse: function(scenario = 'default') {
      if (scenario === 'default') {
        return this.defaultResponse;
      }
      return this.scenarios[scenario] || this.defaultResponse;
    },

    // Mock action filtering (simulates AI removing ads, tracking, footer links)
    // Returns indices of actions to keep (filters out noise)
    filterActions: function(labels) {
      // Simulate delay
      return new Promise(resolve => {
        setTimeout(() => {
          // Simple mock filtering logic: keep items that don't look like ads or tracking
          const noiseKeywords = [
            'cookie', 'privacy policy', 'terms of service', 'terms & conditions',
            'subscribe newsletter', 'follow us', 'social media', 'advertisement',
            'sponsored', 'ad', 'tracking', 'footer', 'copyright', '©', 
            'all rights reserved', 'facebook', 'twitter', 'instagram', 'linkedin',
            'youtube', 'share', 'tweet', 'like us', 'follow', 'rss feed',
            'sitemap', 'contact us', 'about us', 'careers', 'legal', 'dmca'
          ];
          
          const validIndices = [];
          labels.forEach((label, index) => {
            const lowerLabel = label.toLowerCase();
            const isNoise = noiseKeywords.some(keyword => lowerLabel.includes(keyword));
            
            // Keep if it's NOT noise
            if (!isNoise) {
              validIndices.push(index);
            }
          });
          
          // If we filtered everything out, return first 10 (fail-safe)
          if (validIndices.length === 0) {
            for (let i = 0; i < Math.min(10, labels.length); i++) {
              validIndices.push(i);
            }
          }
          
          console.log(`Mock filter: ${labels.length} actions → ${validIndices.length} valid actions`);
          resolve({ valid_indices: validIndices });
        }, 600); // Simulate API delay
      });
    }
  };
})();

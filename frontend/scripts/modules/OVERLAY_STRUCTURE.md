# Overlay Module Structure (Component-Based Architecture)

The overlay module has been refactored into **6 modular components** following OOP principles for better maintainability and separation of concerns.

## 📁 File Structure

### 1. **config.js** (~70 lines)
Configuration and constants for the entire overlay system.

**Contains:**
- API URLs (`API_BASE_URL`)
- Mock/Real API toggle (`USE_MOCK_DATA`)
- Theme definitions (light, sepia)
- Default settings (font sizes, theme)
- UI constants (z-index, dimensions, animations)
- API settings (timeout, max content length)

**To modify:**
- Change `USE_MOCK_DATA` to `false` to use real API
- Add new themes in the `themes` object
- Adjust font size limits and defaults
- Update API URL when deploying

---

### 2. **mock-data.js** (~60 lines)
Test data for UI/UX development without API calls.

**Contains:**
- Default mock response (summary_points, clean_text)
- Alternative scenarios (short, long, error)
- Mock delay configuration
- Helper methods to get different scenarios

**To use different scenarios:**
```javascript
// In overlay.js _fetchAndDisplayContent()
const mockResult = window.SimplifyMockData.getResponse('long'); // or 'short', 'error'
```

---

### 3. **theme-control.js** (~200 lines) - NEW COMPONENT ✨
Handles all theme and font size UI and logic.

**Contains:**
- `create()` - Creates theme toggle UI with buttons
- `applyTheme()` - Updates all elements with new theme
- `applyFontSize()` - Updates text sizes across UI
- `_createFontSizeControl()` - Creates A+/A- buttons

**Responsibilities:**
- Managing current theme and font size state
- Creating theme toggle buttons
- Applying theme colors to all elements
- Font size increase/decrease controls

---

### 4. **tldr-section.js** (~130 lines) - NEW COMPONENT ✨
Handles TL;DR section display and updates.

**Contains:**
- `create()` - Creates loading state with spinner
- `update(summaryPoints)` - Updates with actual bullet points
- Listen button integration with audio player

**Responsibilities:**
- TL;DR section creation
- Loading animation
- Bullet point rendering
- Audio playback integration

---

### 5. **content-section.js** (~120 lines) - NEW COMPONENT ✨
Handles content summary display and updates.

**Contains:**
- `create()` - Creates loading state with spinner
- `update(cleanText)` - Updates with simplified content
- Listen button integration with audio player

**Responsibilities:**
- Content section creation
- Loading animation
- Simplified text rendering
- Audio playback integration

---

### 6. **overlay-panel.js** (~190 lines) - NEW COMPONENT ✨
Handles panel, overlay container, and basic UI elements.

**Contains:**
- `createContainer()` - Creates backdrop overlay
- `createPanel()` - Creates main bottom sheet panel
- `createCloseButton(onClose)` - Creates close button with callback
- `createActionButton()` - Creates "View All Page Actions" button
- `addAnimationStyles()` - Injects CSS animations and responsive styles

**Responsibilities:**
- Overlay backdrop with event prevention
- Panel layout and styling
- Close and action buttons
- Animation and responsive CSS injection

---

### 7. **overlay.js** (~90 lines) - MAIN ORCHESTRATOR 🎯
Main orchestrator that assembles all components.

**Contains:**
- `show()` - Assembles and displays overlay using components
- `_fetchAndDisplayContent()` - Handles data fetching (mock or API)
- `_extractPageContent()` - Extracts page text
- `_showError()` - Displays error state
- Cache management

**Responsibilities:**
- Coordinating component instantiation
- API/Mock data fetching
- Cache management
- Error handling

---

## 🔄 Component Dependencies

```
manifest.json loads in order:
    ↓
1. config.js          (settings, themes)
    ↓
2. mock-data.js       (test data)
    ↓
3. theme-control.js   (theme UI component)
    ↓
4. tldr-section.js    (TL;DR component)
    ↓
5. content-section.js (content component)
    ↓
6. overlay-panel.js   (panel/container component)
    ↓
7. audio-player.js    (existing - for listen buttons)
    ↓
8. fab.js             (existing - floating button)
    ↓
9. overlay.js         (orchestrator - uses all above)
    ↓
10. content.js        (initializes everything)
```

## 🏗️ Architecture Benefits

### **Separation of Concerns**
- Each component has a single, clear responsibility
- Theme logic separate from content display
- Panel creation separate from data fetching

### **Reduced File Size**
- **Before:** 1 file × 700+ lines = hard to navigate
- **After:** 6 files × 60-200 lines each = easy to find/modify

### **Easier Testing**
- Test theme switching without touching content logic
- Test content updates without theme code interference
- Mock individual components for unit testing

### **Better Maintainability**
- Fix theme bugs? Only edit theme-control.js
- Update TL;DR layout? Only edit tldr-section.js
- Change panel styling? Only edit overlay-panel.js

### **Reusability**
- Theme control could be used elsewhere
- Section components follow consistent pattern
- Panel component could be adapted for other overlays

---

## ⚙️ Quick Configurations

### Switch to Real API:
In [config.js](config.js):
```javascript
USE_MOCK_DATA: false
```

### Test Long Content:
In [overlay.js](overlay.js) → `_fetchAndDisplayContent()`:
```javascript
const mockResult = window.SimplifyMockData.getResponse('long');
```

### Add New Theme:
In [config.js](config.js) → `themes` object:
```javascript
dark: {
  bgColor: '#1a1a1a',
  textColor: '#e0e0e0',
  headingColor: '#ffffff'
}
```

Then add to `themeOptions`:
```javascript
{ name: 'dark', emoji: '🌙', label: 'Dark' }
```

### Modify Theme Button Style:
In [theme-control.js](theme-control.js) → `create()` method

### Change Loading Animation:
In [overlay-panel.js](overlay-panel.js) → `addAnimationStyles()` method

### Update Section Layout:
- **TL;DR:** Edit [tldr-section.js](tldr-section.js)
- **Content:** Edit [content-section.js](content-section.js)

---

## 🎨 Component Pattern

All components follow a consistent pattern:

```javascript
window.ComponentName = {
  // Getters for shared state
  get currentTheme() { return window.SimplifyThemeControl.currentTheme; },
  
  // Create method - returns DOM element
  create: function() {
    // Build and return element
  },
  
  // Update method (if needed) - modifies existing element
  update: function(data) {
    // Update DOM with new data
  }
};
```

---

## 📝 Component Responsibilities Summary

| Component | Lines | Responsibility |
|-----------|-------|----------------|
| **config.js** | ~70 | Central configuration |
| **mock-data.js** | ~60 | Test data provider |
| **theme-control.js** | ~200 | Theme & font size management |
| **tldr-section.js** | ~130 | TL;DR display |
| **content-section.js** | ~120 | Content display |
| **overlay-panel.js** | ~190 | Panel & container creation |
| **overlay.js** | ~90 | Main orchestrator |
| **TOTAL** | ~860 | (vs 700+ in single file before) |

The slight increase in total lines is offset by massive gains in maintainability, clarity, and ease of modification.


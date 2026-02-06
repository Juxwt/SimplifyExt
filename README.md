# Assistive Simplify Extension

A Chrome browser extension that makes web pages more accessible and easier to understand by providing AI-powered content simplification, TL;DR summaries, and intelligent action highlighting.

## 🌟 Features

- **TL;DR Summaries**: Get concise 3-point summaries of any web page
- **Clean Content View**: Removes ads, navigation clutter, and simplifies complex sentences
- **Action Highlighting**: Automatically identifies and highlights important interactive elements (buttons, links)
- **Audio Playback**: Listen to simplified content with text-to-speech
- **Theme Control**: Switch between light and dark modes for comfortable reading
- **Floating Action Button (FAB)**: Quick access to simplification features from any page

## 🛠️ Tech Stack

### Frontend
- Chrome Extension (Manifest V3)
- Vanilla JavaScript
- Content Scripts for DOM manipulation

### Backend
- FastAPI (Python)
- Google Gemini AI (gemini-2.5-flash)
- Deployed on Vercel

## 📋 Prerequisites

- Python 3.8+ (for backend development)
- Node.js (optional, for development)
- Google Gemini API Key
- Chrome browser (version 88+)

## 🚀 Installation

### 1. Chrome Extension Setup

1. **Open Chrome Extensions page**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

2. **Load the extension**
   - Download and extract this GitHub repo
   - Click "Load unpacked"
   - Select the `frontend` folder from this project

3. **Verify installation**
   - You should see "Assistive Simplify Extension" in your extensions list
   - The extension icon will appear in your Chrome toolbar

## 💡 Usage

### Activating the Extension

1. **Navigate to any webpage** you want to simplify

2. **Use the floating action button** (FAB) that appears on the bottom right of the page

### Features

#### TL;DR Summary
- Click "Clarify Page" to get a 3-point summary of the page content
- The summary appears in an overlay panel

#### Clean Content View
- View a simplified version of the page with ads and clutter removed
- Complex sentences are rewritten for easier comprehension

#### Action Highlighting
- Interactive elements (buttons, links) are automatically detected
- AI filters out noise (ads, tracking, footer links)
- Important actions are highlighted with visual indicators

#### Audio Playback
- Listen to the simplified content using text-to-speech
- Useful for accessibility and multitasking

#### Theme Control
- Toggle between light and dark modes
- Preference is saved for future sessions

## 🏗️ Project Structure

```
SimplifyExt/
├── api/
│   └── index.py              # FastAPI backend with Gemini AI integration
├── frontend/
│   ├── manifest.json         # Chrome extension configuration
│   ├── background.js         # Service worker
│   ├── popup/
│   │   ├── popup.html        # Extension popup UI
│   │   ├── popup.css
│   │   └── popup.js
│   └── scripts/
│       ├── content.js        # Main content script orchestrator
│       └── modules/
│           ├── action-finder.js    # Scans DOM for interactive elements
│           ├── actions-layer.js    # Highlights detected actions
│           ├── audio-player.js     # Text-to-speech functionality
│           ├── config.js           # Configuration constants
│           ├── content-section.js  # Clean content display
│           ├── fab.js              # Floating action button
│           ├── mock-data.js        # Development mock data
│           ├── overlay-panel.js    # Overlay UI components
│           ├── overlay.js          # Main overlay controller
│           ├── theme-control.js    # Dark/light theme management
│           └── tldr-section.js     # TL;DR summary display
├── requirements.txt          # Python dependencies
├── vercel.json              # Vercel deployment configuration
└── README.md
```

## Backend Setup for Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SimplifyExt
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the backend locally** (for development)
   ```bash
   uvicorn api.index:app --reload
   ```
   
   The API will be available at `http://localhost:8000`

## 🐛 Troubleshooting

### Extension not loading
- Ensure you selected the `frontend` folder (not the root project folder)
- Check Chrome console for errors (`chrome://extensions/` → Details → Errors)

### API errors
- Verify your `GEMINI_API_KEY` is set correctly
- Check that the backend URL in frontend code matches your deployment
- Ensure you're not exceeding Gemini API rate limits

### Content not simplifying
- Check the browser console (F12) for errors
- Verify the page has readable text content
- Some pages with heavy JavaScript may not extract content properly


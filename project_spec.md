# Project Specifications — Assistive Browser Extension

## Project Overview
This project is a Chrome browser extension designed to reduce cognitive overload for users, especially elderly users and those with reading or navigation difficulties.

The extension simplifies complex web pages into a clean, readable view and helps users identify the most important action on a page (e.g. Pay, Submit, Continue).

The core UX principle is:
**One click to clarify, optional help to act.**

---

## Target Users
- Elderly users
- Users with dyslexia or reading difficulties
- Users overwhelmed by dense or cluttered web pages
- Users struggling to find the “next step” on forms or payment pages

---

## Core Features

### Feature 1: Visual Sanitization (Clean View)
- Activated by user click
- Displays a full-screen overlay
- Removes distractions such as:
  - Ads
  - Sidebars
  - Navigation menus
  - Pop-ups
- Presents only the main content in a calm, readable layout
- Adjustable text size and spacing (UI-level)

---

### Feature 2: TL;DR Summary
- Automatically generated when the page is processed
- Appears at the top of the overlay
- Consists of:
  - Exactly 3 short bullet points
  - Plain language
  - High-signal information only
- Generated via Gemini API (single AI call with Feature 1)

---

### Feature 3: Goal Action Finder
- Optional feature triggered by user
- Helps users locate the most important action on a page
- Examples:
  - Pay
  - Submit
  - Next
  - Confirm
  - Log in
- Works in two stages:
  1. Local DOM scan for common action keywords
  2. AI-assisted decision if unclear
- Highlights the real button/link on the original page
- Scrolls the page to the target element

---

## User Experience Flow

1. User sees a permanent floating button at bottom-right of the page
2. User clicks the button → overlay opens
3. User clicks **“Clarify Page”**
4. System:
   - Extracts page text
   - Calls backend AI service
   - Displays Clean View + TL;DR
5. (Optional) User clicks **“Find Action”**
6. System highlights the relevant button on the page

---

## Technical Architecture

### Frontend (Chrome Extension)
- Content scripts for:
  - Page text extraction
  - Overlay injection
  - DOM scanning and highlighting
- Popup / floating button UI
- Written in JavaScript or TypeScript

### Backend (Serverless)
- Hosted on Vercel
- Python-based serverless functions
- Responsibilities:
  - Gemini API calls
  - Text summarization
  - Clean content generation
  - Action reasoning (when needed)
- API keys securely stored server-side

---

## Performance & Design Considerations
- Minimal latency (single AI call for core features)
- Accessibility-focused writing style
- No automatic AI calls without user consent
- Fail-safe behavior if AI is unavailable
- Clean separation between UI and AI logic

---

## Deliverables
- Functional Chrome extension
- Deployed backend endpoint
- Demonstrable end-to-end flow
- Clear UX aligned with accessibility goals

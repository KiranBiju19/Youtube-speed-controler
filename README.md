# YouTube Speed Controller

**YouTube Speed Controller** is a lightweight Chrome extension that allows users to control YouTube video playback speed with custom limits, keyboard shortcuts, and an intuitive floating widget. Built using Manifest V3.

---

## 🚀 Features

- Increase or decrease video speed in **0.25x steps**
- Set maximum speed limit (default: 4.0x)
- **Keyboard shortcuts**:
  - `Shift + .` or `Shift + >` → Increase speed
  - `Shift + ,` or `Shift + <` → Decrease speed
  - `Shift + R` → Reset speed to `1.0x`
- Visual **on-screen speed notification**
- Floating **draggable speed control widget** on YouTube video pages
- Syncs custom speed settings using `chrome.storage`

---

## 🧩 How to Install

1. Download or clone this repository.
2. Go to `chrome://extensions/` in your Chrome browser.
3. Enable **Developer mode** (top-right corner).
4. Click **"Load unpacked"** and select the project folder.
5. Open any YouTube video to start using the extension.

---

## 🛠️ How It Works

The extension injects a content script (`content.js`) into all YouTube pages. It:
- Detects the YouTube video player.
- Adds a floating UI to control playback speed.
- Listens to keyboard shortcuts and popup messages.
- Automatically re-initializes on single-page navigation changes (YouTube SPA behavior).

---

## 📁 Project Structure
├── manifest.json # Extension metadata and configuration (Manifest V3)
├── content.js # Content script with all speed control logic
├── popup.html # (Not uploaded) Optional popup UI interface
├── popup.js # (Not uploaded) Logic for popup controls
├── icon16.png # Extension icon
└── styles.css # (Referenced) Optional styles for widget and popup

## 📄 License

This project is licensed under the [MIT License](LICENSE).

# Rhythmix

**Rhythmix** is an ad-free alternative to YouTube Music. Stream your favorite music directly without interruptions, tracking, or paywalls. Built with simplicity and privacy in mind.

> by [Team Markuply](https://markuply.vercel.app/)

---

## 🌟 Features

- 🎧 **Ad-free playback** – Enjoy uninterrupted music with no ads, ever.
- 🎵 **Background playback** – Listen while using other apps or when your screen is off (on supported platforms).
- 🌙 **Dark mode** – Comfortable listening day or night.
- 🔒 **Privacy-focused** – No trackers, no data collection, completely open-source.

---

## 🚀 Upcoming Features

- 🔍 **Advanced Search** – Easily find and stream millions of tracks.
- 🗂️ **Playlists & Favorites** – Save, manage, and replay your favorite songs.
- 🔐 **User Login** – Sign in to sync playlists, favorites, and settings across devices.

---

## ⚡ What's New in v1.0.0:

### Features

- **YouTube API Integration**
  - Search and play songs directly from YouTube.
  - Added “official audio” suffix to prioritize music results.
- **Queue Enhancements**
  - Added **Remove from Queue** button for each song.
  - Dynamic queue updates when items are added, removed, or played.
  - Queue persists in `localStorage` for session continuity.
- **Library / Likes**
  - Heart icon to add/remove songs to/from library.
  - Library persists in `localStorage`.
- **Explore Tab**
  - Auto-load trending/popular songs from YouTube API.
  - Like and add songs to queue directly from Explore.
- **Home Tab**
  - Placeholder text on first load
  - **Recently played history** below placeholder.
  - History saved in `localStorage` and independent of queue.
  - Rendered as a **uniform 5-card grid** with fixed image sizes, padding, and ellipsis for long titles.

### Improvements

- **UI / UX**
  - Fully responsive sidebar, navbar, player, and content.
  - Hamburger menu for mobile to toggle sidebar.
  - Player controls centered and responsive.
  - Tab contents properly aligned without overlapping sidebar or player.
  - Search bar visible only in Home tab and styled consistently.
- **CSS / Layout**
  - Unified `tab-item` design for queue, library, explore, and home search items.
  - Sidebar off-canvas in mobile, slides in/out smoothly.
  - History grid shows exactly 5 items per row.
  - Fixed image sizes and consistent padding across all cards.
  - Long titles truncated with ellipsis for a clean layout.

### Bug Fixes

- Home placeholder now shows correctly on page load.
- Fixed search results that sometimes failed to play.
- Queue auto-play fixed and properly saved/loaded.
- Sidebar no longer overlaps content in mobile or desktop.
- Volume control and progress bar properly update.
- Corrected text overflow in history and tab items.

---

## 📦 Installation

### Web App (Recommended)

link 1: [Rhythmix Player (Vercel)](https://rhythmix-teal.vercel.app/)

link 2: [Rhythmix Player (Deno)](https://rhythmix.markuply.deno.net/)

No install needed. Works on mobile and desktop browsers.

### Android

Coming soon / [Download APK ( Coming Soon )](https://rhythmixapk.com)

> iOS users: Use the web app for now. A native iOS version is planned.

---

## 🧑‍💻 Contributing

Want to help improve Rhythmix?

1. Fork this repo
2. Make your changes
3. Submit a PR

Contributions are welcome – whether it's bug fixes, new features, UI polish, or documentation!

---

## 📝 License

All rights reserved by **Markuply**.

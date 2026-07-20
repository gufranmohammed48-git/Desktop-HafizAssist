# Desktop HafizAssist

A free, open-source Quran memorization companion with live word-by-word
highlighting (Tarteel-style UX), running entirely in the browser.

This is the **desktop/laptop version** of the Hifzapp project, optimized for
the easiest possible setup: just open the HTML file in Chrome.

## What's in this repo

- **`HafizAssist.html`** - the entire app. Open this in Chrome.
- **`phonemes-data.js`** (5.3 MB) - Quran text + Tajweed phoneme data, loaded
  as a sibling file. Must live in the same directory as the HTML.

## Quick Start

1. Make sure both files are in the same directory.
2. Open `HafizAssist.html` in Chrome (or any Chromium-based browser).
3. Click "Start reciting" and grant microphone permission.
4. Recite any surah and watch the words highlight as you say them.

That's it. No build step, no server, no install. Just two files.

## How it works

This version uses **Chrome's built-in `webkitSpeechRecognition`** (the same
engine that powers "Ok Google"). Audio is processed on Google's servers
(default), so you'll need an internet connection. The model was trained on
broad-Arabic speech, so accuracy is good for clear recitation but not as
high as a specialized Quran model.

For a more accurate version (with a dedicated FastConformer ASR model that
runs locally or on a cloud GPU), see the main
[`Hifzapp` repo](https://github.com/gufranmohammed48-git/Hifzapp).

## Browser requirements

- Chrome 90+ (or any Chromium-based browser: Edge, Brave, Arc, etc.)
- Microphone access
- Internet connection (for `webkitSpeechRecognition`)

## Privacy

- Audio is sent to Google for transcription (Chrome's default behavior).
- No data is collected or stored by this app itself.
- For fully-private local ASR, use the main `Hifzapp` repo.

## License

Open source. Make it yours. Phoneme data is from the Qur'anic Phonemizer
(MIT license) by Mohammad Kayyali.

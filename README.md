# Desktop HafizAssist

A free, open-source Quran memorization companion with live word-by-word
highlighting (Tarteel-style UX), running entirely in the browser.

This is the **desktop/laptop version** of the Hifzapp project, optimized for
the easiest possible setup: just open the HTML file in Chrome.

## What's in this repo

- **`index.html`** - the main app. Open this in Chrome.
- **`support.html`** - the Contact Support page (linked from the top-right of the app).
- **`phonemes-data.js`** (5.3 MB) - Quran text + Tajweed phoneme data, loaded
  as a sibling file. Must live in the same directory as the HTML.

## How the Contact Support form works

The form posts directly to [FormSubmit](https://formsubmit.co), a free
service that forwards form submissions to your email. No signup, no
backend, no captcha.

**First time you (or anyone) submits:** FormSubmit sends a one-time
activation email to `104tutorials104@gmail.com`. Click the link in that
email to start receiving submissions. That's it — one click, forever
after that every submission lands in your Gmail.

If activation emails don't arrive, check spam. If they never arrive,
the email is being filtered by Gmail — switch to Web3Forms
(web3forms.com, 250/month free) by editing the form action in
`support.html` (instructions in the file).

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

Mix — Quick Image Editor
=========================

What it is
- A small web-based image editor built with HTML, CSS, and JavaScript.
- Client-side filters (brightness, contrast, saturation), presets, download.
- Optional AI integration: provide an API endpoint that accepts JSON { image: dataUrl } and returns { image: dataUrl }.

Files
- mix.html — main UI (Developer: Assem bakr)
- styles.css — styling
- app.js — image logic and optional AI hook

Usage
- Open `mix.html` in a modern browser.
- Upload an image, tweak sliders or choose a preset, then click "Download Edited Image".
- To use AI: enter your API endpoint and API key (if required), then click "Apply AI Edit". The app will POST `{ image: <dataUrl> }` and expects a JSON response containing `{ image: <dataUrl> }`.

Notes
- This project does not embed any third-party AI key or service. You must supply your own endpoint or run a server that performs AI editing.
- For a production-ready app consider adding server-side proxying to keep API keys secret.

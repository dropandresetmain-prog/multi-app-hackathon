# Somebody demo-video scenes

Standalone browser-recordable motion scenes for the final hackathon video. These files are recording assets only; they do not import or modify the product runtime.

## Run

From the repository root:

```bash
python3 -m http.server 4173
```

On Windows, `py -m http.server 4173` is equivalent when `python3` is not available.

Open one of these URLs in a Chromium-based browser:

- Opening: `http://127.0.0.1:4173/video-assets/?scene=opening`
- Working transition: `http://127.0.0.1:4173/video-assets/?scene=working`
- Closing: `http://127.0.0.1:4173/video-assets/?scene=closing`

## Recording controls

Controls are keyboard-only, so nothing appears in the captured frame:

- `1` — opening
- `2` — working transition
- `3` — closing
- `R` or `Space` — restart the current scene from frame one

Mascot images are preloaded and decoded before each page's first animation begins. Scene changes after the first load reuse the same local assets.

## Capture setup

- Target content viewport: exactly `1920 × 1080`
- Browser zoom: `100%`
- Preferred browser: current Chrome or Edge
- Hide browser chrome/bookmarks or use full-screen capture if the display itself is 1920×1080.
- If the browser viewport is not 16:9, the 1920×1080 stage scales down uniformly and remains centered rather than reflowing.

## Dependencies

No npm package, backend, API, external font, or network request is required. The recommended command only needs Python 3's built-in static file server. Any equivalent local static server also works.

The three image files in `video-assets/assets/` are byte-identical Git blobs from the approved Somebody mascot asset commit `dbdca04519db859978625d6e06f796ca095cedce`; they are copied into this standalone recording bundle so it stays independent of product runtime paths.

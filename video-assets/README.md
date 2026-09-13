# Somebody demo-video browser scenes

Standalone recording assets for the hackathon demo. These files are intentionally separate from Somebody's application runtime and require no build step, backend, package install, external font, or API call.

## Run locally

From the repository root:

```bash
python -m http.server 4173
```

Then open one of these URLs:

- Opening hook: `http://localhost:4173/video-assets/?scene=opening`
- Working transition: `http://localhost:4173/video-assets/?scene=working`
- Closing card: `http://localhost:4173/video-assets/?scene=closing`

`?scene=transition` is also accepted as an alias for the working transition.

## Recording setup

Use a 1920×1080 browser viewport at 100% zoom. For the cleanest capture, record the browser tab or use browser full-screen mode so browser chrome is not in frame.

The stage is locked to 16:9 and letterboxes cleanly if the browser viewport has a different aspect ratio.

## Controls

Controls are keyboard-only so nothing appears in the recorded frame:

- `1` — opening hook
- `2` — working transition
- `3` — closing card
- `R` — restart the current animation from frame zero
- `←` / `→` — previous / next scene

Changing scenes updates the `?scene=` query without reloading the page. Reloading a scene URL also starts its animation predictably from the beginning.

## Approximate scene timing

- Opening: final Somebody reveal begins at ~7.4s; allow roughly 8.5–9.5s for a comfortable take.
- Working transition: ~1.8s.
- Closing card: settles by ~1.4s and holds indefinitely; record about 4s.

## Dependencies

None beyond a modern browser and a simple static-file server. Typography uses the local system UI font stack.

The scene uses only approved Somebody assets from `brand/assets/` and does not recreate or redraw the mascot.

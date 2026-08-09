# astro-pov

Show the night sky depending on the point of view of the observer.

This repository contains an interactive web-based 3D viewer (MVP branch) that renders a simple star catalog and allows switching observer positions to demonstrate how constellations change with viewpoint.

Quick start (dev):

1. Install dependencies

   npm install

2. Run dev server

   npm run dev

3. Open http://localhost:5173

What I scaffolded in the mvp branch:
- Vite + React + TypeScript app
- react-three-fiber based Sky viewer
- Basic UI using MUI
- A small sample star catalog (public/data/stars_sample.json)

Next steps (planned):
- Add remote-first downloads and caching for larger catalogs
- Add constellation/asterism overlays and toggles
- Improve observer controls (Earth lat/long/time)
- Add GitHub Pages deployment workflow once stable

License: MIT (see LICENSE file)

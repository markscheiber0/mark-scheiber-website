# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **static personal portfolio/brand website** for Mark Scheiber, a web designer/developer based in Boise, Idaho. It is a single-page site with no build system — pure HTML, CSS, and vanilla JavaScript served directly to a browser.

## Running Locally

No install step. Open `index.html` directly in a browser, or serve via any HTTP server:

```
python -m http.server 8080
```

or use the VS Code Live Server extension for hot-reload during development.

## Deployment

Deploy the entire directory as-is to any static host (Netlify, Vercel, GitHub Pages). The `_redirects` file is Netlify-specific: it rewrites requests from AI crawlers (GPTBot, ClaudeBot, etc.) to serve `llms.txt` instead of `index.html`.

## Architecture

Three files do all the work:

- **`index.html`** — Single-page layout with 7 sections: nav, hero, services (3 cards), portfolio (3 projects), about, contact, footer. Also contains two `<canvas>` elements used for background animations.
- **`styles.css`** — CSS variables define the 5-color gradient palette (magenta → violet → cyan → lime → amber) on a dark `#07060d` background. Layout uses CSS Grid with a 900px mobile breakpoint and `clamp()` for fluid typography.
- **`script.js`** — All interactivity. Five main systems:
  1. **Smooth scroll** via Lenis 1.0.42, integrated with GSAP ScrollTrigger
  2. **Hero load animation** — staggered GSAP timeline on page load
  3. **Scroll reveals** — elements fade/slide in via ScrollTrigger
  4. **Card 3D tilt** — mousemove handler rotates service cards
  5. **Canvas animations** — prism backdrop (mouse-responsive glowing orbs with additive blending) and voxel mountain (Grand Tetons ASCII map rendered as isometric blocks, building progressively on scroll); both hidden on screens narrower than 1100px

**External libraries loaded via CDN (no local install):**
- GSAP 3.12.5 + ScrollTrigger plugin
- Lenis 1.0.42
- Google Fonts: Space Grotesk (headings), Inter (body)

## Key Conventions

- All JavaScript is in a single `script.js` file with no modules or bundler.
- CSS custom properties (variables) are defined on `:root` and used throughout — update the palette there.
- The voxel mountain is built from a hardcoded ASCII terrain map in `script.js`; each character maps to a block height.
- `llms.txt` is a plain-text/markdown summary of the site's content intended for LLM crawlers.

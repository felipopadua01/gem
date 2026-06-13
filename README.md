# 🎅 SANTA SLEAZE — $SLEAZE

A neon-grunge **Christmas meme-coin** website with a face-to-meme **image generator**.
Upload a photo, tune the festive vibe, and watch a **gift box burst open** to reveal your
Santa Sleaze meme.

> Inspired by the "KEANU SLEAZE" style of meme projects — this is the festive cousin.

## ✨ What's inside

Multi-page static site, **no build step / no node** — just open `index.html`.

| Page | File | Purpose |
|------|------|---------|
| Home | `index.html` | Hero, ticker, how-it-works, featured strip, CTA |
| Generator ⭐ | `generator.html` | Upload → festive overlay → gift-box reveal → download/share |
| About | `about.html` | The lore |
| Tokenomics | `tokenomics.html` | Supply, tax, distribution donut, contract copy |
| How to Buy | `how-to-buy.html` | 4-step buy guide |
| Roadmap | `roadmap.html` | Festive timeline |
| Gallery | `gallery.html` | Wall of community memes (placeholders) |

## 🎨 Theme — "Neon Grunge Xmas"
Dark moody base, neon red/green glow, film-grain texture, persistent snowfall,
floating gifts, twinkling string-lights, glitch logo.

## 🛠️ Tech (all via CDN)
- **Tailwind CSS** (CDN + inline config)
- **tsParticles** — snowfall
- **GSAP** — gift-box unwrap animation & sparks
- Vanilla JS — shared nav/footer injection, effects, generator
- Google Fonts: Bebas Neue, Rubik Glitch, Mountains of Christmas, Inter

## 🖼️ Image generation
The generator currently **composites a festive overlay** (Santa hat, neon snow, glowing
frame, watermark) on a `<canvas>` entirely in the browser — nothing is uploaded.

> The real AI / FPV face-to-meme model is **stubbed** in `assets/js/generator.js` →
> `generateImage()`. Swap that function's body to call your backend and return an image
> dataURL/Blob; the upload, controls, reveal animation, and download/share already work.

## 🚀 Run
Open `index.html` in any modern browser (or serve the folder with any static server).
No install required. An internet connection is needed for the CDN libraries.

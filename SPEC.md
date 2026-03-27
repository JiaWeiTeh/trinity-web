# TRINITY Website — Complete Specification

## Overview
A single-page interactive showcase for **TRINITY**, a 1D stellar feedback code that models feedback-driven bubble evolution in molecular clouds. Deployed to GitHub Pages. URL: `https://jiaweiteh.github.io/trinity-web/`

---

## Tech Stack
- **Vite** (v8) with `base: '/trinity-web/'`
- **React 19** (single-page app, no router)
- **Tailwind CSS v4** via `@tailwindcss/postcss` (CSS-based `@theme` config, NOT `tailwind.config.js`)
- **Recharts** for the interactive chart
- **Google Fonts**: Inter (400, 500, 600, 700)
- **GitHub Actions** deploy to Pages (`actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4`)

## Theme & Aesthetics

**Overall feel**: Dark, minimal, scientific. No images — everything is SVG/CSS. Clean white text on deep navy. Sparse use of colour for accents.

**Palette** (defined in `@theme` block in `index.css`):
| Token | Hex | Usage |
|-------|-----|-------|
| `navy` | `#0D1B2A` | Page background, all sections |
| `teal` | `#0EA5C8` | Accent colour (links, active nav, slider thumb, paper numbers) |

**Text**: White at varying opacities — `text-white` for headings, `text-white/70` for body, `text-white/40–60` for secondary, `text-white/30` for tertiary.

**Font**: `Inter, sans-serif` throughout. No serif or monospace.

**Borders/Cards**: `border-white/5` or `border-white/10`, `bg-white/[0.02]` to `bg-white/[0.04]` for subtle card surfaces. Rounded corners (`rounded-lg`).

**Global CSS**:
- `overscroll-behavior: none` (prevents browser bounce)
- `scroll-behavior: smooth`
- `body { margin: 0; background: #0D1B2A; }`

---

## Page Architecture

The page is a **scroll-driven animation** followed by **content sections**. No routing — everything is one continuous experience.

**Layout flow**:
1. A `500vh`-tall scroll container with a `sticky top-0 h-screen` inner frame
2. Inside the sticky frame: two absolutely-positioned layers (bubble + content) that crossfade
3. User scrolls through the tall container; scroll position (0–1) drives the bubble animation
4. At ~78–100% scroll, the bubble disperses and content sections fade in within the same viewport
5. Content sections have their own internal scroll (`overflow-y-auto`) once visible

---

## Component 1: Hero Bubble (`HeroBubble.jsx`)

**What it is**: A full-screen SVG cross-section of a stellar feedback bubble — concentric circles representing physical zones around a star cluster.

**Visual structure** (inside → outside):
| Zone | Colour | Label |
|------|--------|-------|
| Free wind | Light blue `#B4CEE8` | WINDS |
| Hot bubble | Rose `#C4929B` | BUBBLE |
| HII region | Maroon `#8B4D5C` | SHELL (subscript: *ion*) |
| Neutral shell | Dark navy `#2A3A4E` | SHELL (subscript: *neu*) |
| Cloud | Radial gradient `#C8C8D0 @ 50% opacity` → `#0D1B2A @ 0% opacity` | CLOUD |

**Star cluster**: 5 four-pointed sparkles at the centre, warm cream `#F5E6C8` at 90% opacity. Varying sizes (0.8–1.8 SVG units). Always visible.

**SVG viewport**: `viewBox="-10 0 145 100"`, centred at (50, 50).

**Zone labels** (energy phase only):
- 5 labels positioned to the right of the bubble (x=110 in SVG coords)
- Each label has a white dot at the midpoint of its zone, connected by a thin horizontal leader line (stroke `white/35`, width 0.25)
- Labels are spread vertically at y=15, 29, 43, 60, 74 to avoid overlap
- The dot position is computed by finding where a horizontal line at that y intersects the circle at the zone's midpoint radius
- Main text: 3.5px, weight 500, white/90
- Subscript (for SHELL): italic, 2.6px, weight 400, white/50

**Breathing animation**: `scale(1) → scale(1.03) → scale(1)` over 6s ease-in-out infinite. Paused via `animationPlayState` when scroll begins (progress > 0.005). Never removed from DOM to prevent jitter.

**Title overlay**: "TRINITY" in `text-5xl md:text-7xl font-bold tracking-widest` centred above the bubble. Subtitle: "Feedback-driven bubble evolution in molecular clouds" in `text-sm md:text-base text-white/60`. Both fade out by progress 0.06.

**Scroll chevron**: Downward `∨` arrow at bottom, animated with `pulse-fade` (opacity 0.3→0.8, translateY 0→4px, 2s infinite). Fades out by progress 0.07.

**Dispersal effect** (progress 0.78–1.0):
- Bubble scales up: `scale(1 + dispersalProgress * 2.5)` (up to 3.5x)
- Bubble fades: `opacity = 1 - dispersalProgress`
- Bright flash: radial gradient overlay, white centre, appears at 60% dispersal, max alpha 0.24

---

## Scroll Animation System

**Custom hook** (`useScrollProgress.js`):
- Attaches to a container ref
- Returns 0–1 progress based on `(-rect.top) / (containerHeight - viewportHeight)`
- RAF-throttled, passive scroll listener
- Clamps to [0, 1]

**Phase keyframes** (from exact TRINITY documentation):
```
energy:     freeWind=0.1667  hotBubble=0.4444  hii=0.0556  shell=0.1111  cloud=0.2222
transition: freeWind=0.4352  hotBubble=0.2278  hii=0.0694  shell=0.1111  cloud=0.1565
momentum:   freeWind=0.7037  hotBubble=0.0111  hii=0.0833  shell=0.1111  cloud=0.0907
```

**Progress timeline**:
| Range | Phase |
|-------|-------|
| 0.00–0.20 | Hold energy-driven (bubble breathes at start, zone labels visible) |
| 0.20–0.40 | Linear interpolation energy → transition |
| 0.40–0.60 | Linear interpolation transition → momentum |
| 0.60–0.78 | Hold momentum-driven |
| 0.78–1.00 | Dispersal + crossfade to content |

**Annotations** — 4 text overlays positioned above the bubble (top 22% on mobile, 25% on desktop), centred, italic, `text-white/80`, `max-w-xl`. Each has independent fade-in/hold/fade-out windows:
1. "Energy-driven: hot bubble pressure inflates the shell." (0.03–0.20)
2. "Transition: thermal energy radiates away." (0.20–0.42)
3. "Momentum-driven: photoionised gas pressure and ram pressure sustain expansion." (0.45–0.62)
4. "Cloud dispersal." (0.80–0.95)

**Crossfade** (dispersal phase):
- Uses `smoothstep(t) = t²(3 - 2t)` for natural easing
- Bubble layer fades out: smoothstep over dispersal 20%–70%
- Content layer fades in: smoothstep over dispersal 40%–90%
- Content also scales from 0.97 → 1.0 for a "surfacing" feel
- Both layers use `will-change` and 0.15s CSS transition for GPU compositing

---

## Component 2: Navbar (`Navbar.jsx`)

- **Fixed** at top, z-50
- **Hidden** until scroll > 30vh, then slides in with opacity + translateY transition (300ms)
- Semi-transparent background: `bg-navy/80 backdrop-blur-md border-b border-white/5`
- Height: `h-14`, max-width: `max-w-5xl` centred
- Left: "TRINITY" logo text (bold, tracking-widest, `text-sm`), scrolls to top on click
- Right (desktop, `sm:` and up): 5 section links + "Docs" external link (teal, with external-link icon)
- Links: `text-white/70 text-sm`, hover → `text-white`
- Mobile (`< sm`): hamburger button (3-line → X toggle). Opens full-screen overlay (`bg-navy/95 backdrop-blur-lg`) with links at `text-2xl font-medium`, centred vertically
- All links use `scrollIntoView({ behavior: 'smooth' })` via JS handler
- Nav links: Physics, What's New, Explorer, Papers, Team

---

## Component 3: Content Sections (`ContentSections.jsx`)

All sections share: `py-24 px-6`, inner `max-w-[900px] mx-auto`. Section titles: `text-3xl md:text-4xl font-bold text-white mb-8`.

### Section: "What is TRINITY?" (`#physics`)
- Paragraph in `text-white/70 text-base md:text-lg leading-relaxed`
- Below: a bordered card (`border-white/10 rounded-lg bg-white/[0.03]`) with link to `trinitysf.readthedocs.io` in teal

### Section: "What's New?" (`#features`)
- 6 feature cards in a `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` grid, `gap-5`
- Each card: `border-white/10 rounded-lg bg-white/[0.02] p-5`, hover darkens slightly
- Icon (24x24 inline SVG, coloured strokes: coral `#E85D4A`, teal `#0EA5C8`, sage `#6BAE8A`, amber `#F59E0B`, white), title (`text-white font-semibold text-sm`), description (`text-white/50 text-sm`)
- Features: Phase-aware driving, Smooth energy→momentum, Flexible density profiles, Radiation pressure + dust, Ionisation-front tracking, Terminal momentum & scaling

### Section: "Feedback Explorer" (`#explorer`)
- Lazy-loaded via `React.lazy` + `Suspense` (fallback: "Loading explorer...")
- See dedicated FeedbackExplorer spec below

### Section: "Papers" (`#papers`)
- 5 papers listed vertically with `border-b border-white/5 pb-4` separators
- Format: "Paper I" (teal, bold) — "Code & Methods" (white, medium) — "Teh et al. (in prep.)" (white/40)
- Papers I–V: Code & Methods, Feedback Dominance, Cluster Property Inference, Scaling Relations, Synthetic Bubble Populations
- Footer note about further planned papers

### Section: "Team" (`#team`)
- Uses `TeamGrid` component

---

## Component 4: Feedback Explorer (`FeedbackExplorer.jsx`)

**Layout**: `flex-col md:flex-row gap-8`. Chart 65% width, controls 35% width. Stacked on mobile.

**Chart**: Recharts `AreaChart` (stacked), `ResponsiveContainer height={340}`.
- 5 stacked channels (bottom to top):

| Channel | Name | Colour |
|---------|------|--------|
| gravity | Gravity | `#3A3A4A` |
| winds | Winds | `#5B8FC9` |
| sn | Supernovae | `#F59E0B` |
| phii | Photoionised gas pressure | `#E85D4A` |
| prad | Radiation pressure | `#0EA5C8` |

- Y-axis: domain [0, 1], label "Force fraction" (rotated -90)
- X-axis: custom SVG label with italic *t* + upright " (Myr)"
- Grid: `strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"`
- Axes: `stroke="rgba(255,255,255,0.4)"`, ticks `rgba(255,255,255,0.6)` at 12px
- `fillOpacity={0.75}` on all areas
- Custom tooltip: dark card with `bg-navy/95`, shows percentage for each channel

**Controls** (two sliders):
1. **Cloud mass**: range slider, min=4 max=7 step=0.5 (log10 solar masses). Display: `10^{logM} M☉` with proper `<sup>` superscript
2. **Star formation efficiency**: range slider, min=5 max=30 step=1. Display: `{sfe}%`. Label includes italic *ε* with subscript *sf*

**Slider styling** (custom CSS in `index.css`):
- Track: 4px height, rounded, `rgba(255,255,255,0.1)` background
- Thumb: 16px circle, teal `#0EA5C8`, navy border, hover scale 1.2x
- Cross-browser: WebKit + Mozilla rules

**Data**: `feedbackGrid.json` — 42 entries (7 masses × 6 SFEs), 8 time steps each, 5 channels summing to 1.0. Bilinear interpolation between grid points with post-interpolation normalization.

**Legend**: Flex-wrap row of colour swatches + names below controls.

**Footer**: Italic disclaimer "Illustrative; quantitative results in Paper I (Teh et al., in prep.)" + teal link "How does TRINITY compute this? →" to ReadTheDocs.

---

## Component 5: Team Grid (`TeamGrid.jsx`)

`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`. Each member is a linked card:
- Coloured circle (60x60px) with bold white initials
- Name (`text-white font-semibold text-sm`, hover → teal)
- Affiliation (`text-white/40 text-xs`)
- Entire card is an `<a>` with hover scale on avatar, subtle background shift

| Name | Initials | Affiliation | Colour | Link |
|------|----------|-------------|--------|------|
| Jia Wei Teh | JT | ITA/ZAH, Universität Heidelberg | `#0EA5C8` | jiaweiteh.github.io |
| Ralf S. Klessen | RK | ITA/ZAH, Universität Heidelberg | `#E85D4A` | ita.uni-heidelberg.de/~klessen/ |
| Simon C. O. Glover | SG | ITA/ZAH, Universität Heidelberg | `#6BAE8A` | ita.uni-heidelberg.de/~glover/ |
| Kathryn Kreckel | KK | ARI/ZAH, Universität Heidelberg | `#F59E0B` | kreckel.org |

---

## Component 6: Footer (`Footer.jsx`)

- Background: `#0F1E33` (slightly lighter navy), `border-t border-white/5`
- Three-column layout (stacks on mobile):
  - Left: "TRINITY — ITA/ZAH, Universität Heidelberg" (`text-white/40`)
  - Centre: GitHub icon + Docs (book) icon, both 20x20 SVG, `text-white/40 hover:text-white`
  - Right: "Built with TRINITY" (`text-white/30 text-xs`)

---

## SEO & Meta (`index.html`)

- `<title>`: "TRINITY — Feedback-driven bubble evolution in molecular clouds"
- `<meta description>`: "Interactive showcase for TRINITY, a 1D stellar feedback code modelling winds, supernovae, radiation pressure, and photoionised gas in molecular clouds."
- Open Graph: `og:title`, `og:description`, `og:type="website"`, `og:url`
- Missing: `og:image` (no preview image yet)
- Preconnect to Google Fonts

---

## Accessibility

- SVG bubble: `role="img"` with descriptive `aria-label`
- All nav links: `aria-label` with "Navigate to {section}"
- All external links: `target="_blank" rel="noopener noreferrer"` with aria-labels
- Hamburger: `aria-label` toggles "Open menu" / "Close menu"
- Team cards: `aria-label="{Name}'s page"`
- Semantic HTML: `<nav>`, `<section>`, `<footer>`, `<h1>`–`<h3>`

---

## Performance

- `React.lazy` + `Suspense` for FeedbackExplorer (Recharts is 350KB gzipped)
- `requestAnimationFrame` throttling on scroll handler with deduplication
- Passive scroll listeners everywhere
- `will-change: transform, opacity` on animated layers
- Chart data memoized with `useMemo([logM, sfe])`
- All constants/components defined outside render functions
- Total bundle: ~67KB (main) + 105KB (explorer chunk) gzipped

---

## File Structure
```
src/
  main.jsx                          # ReactDOM.createRoot
  App.jsx                           # Orchestrator: scroll progress, phase interpolation, crossfade
  index.css                         # Tailwind @theme, animations, slider styles
  hooks/useScrollProgress.js        # Custom scroll → 0-1 progress hook
  components/
    HeroBubble.jsx                  # SVG bubble with zones, stars, labels, dispersal
    Navbar.jsx                      # Sticky nav with hamburger
    ContentSections.jsx             # All 5 content sections
    FeedbackExplorer.jsx            # Recharts stacked area chart + sliders
    TeamGrid.jsx                    # Team member cards
    Footer.jsx                      # Footer with icon links
  data/
    feedbackGrid.json               # 42-entry interpolation grid
```

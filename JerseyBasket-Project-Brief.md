# JerseyBasket.je — Project Brief
*Updated: 5 June 2026*

---

## Project Overview
JerseyBasket.je is a Jersey grocery price comparison app. Users pick a basket of products and instantly see which supermarket is cheapest. Built in React, deployed via Vercel, ~950+ organic users in roughly 2 weeks.

---

## Key Details

| Item | Value |
|------|-------|
| Owner | Eamonn O'Shea |
| Email | hello@jerseybasket.je |
| Phone | 07797 721247 |
| Repo | https://github.com/Predator1960/JerseyBasket |
| Local path | C:\Users\eamon_qw9m8iy\OneDrive\Desktop\jerseybasket\ |
| Backup folder | jerseybasket-backup\ on Desktop |
| Live URL | jerseybasket.je (Vercel auto-deploy) |
| Current version | v63 |

---

## Tech Stack
- React (Create React App)
- Vercel (Framework Preset: Create React App — critical, not "Other")
- Git → GitHub → Vercel auto-deploy (~27s build)

---

## Critical Workflow Rules

1. NEVER use PowerShell to write App.jsx — corrupts emoji (BOM encoding). Always use Python install script.
2. Deploy method:
   python "C:\Users\eamon_qw9m8iy\OneDrive\Desktop\jerseybasket\install_vXX.py"
   cd C:\Users\eamon_qw9m8iy\OneDrive\Desktop\jerseybasket
   git add . && git commit -m "message" && git push
3. If Vercel builds in <20s → something is wrong (cached/pre-built folder).
4. Never commit: .vercel/output/, build/, node_modules/, install_*.py, Promotional Video Guide folder.
5. Pause OneDrive before pushing.
6. Vercel treats ESLint warnings as errors (CI=true). Zero warnings required.

---

## App State (v63 — Current)

### Products & Stores
- 453 products, 15 categories, 5 stores
- Stores: Co-op #16a34a, Morrisons #eab308, M&S #94a3b8, Waitrose #0d9488, Iceland #dc2626

### Key Constants
- MAINTENANCE = false
- COMP_ACTIVE = true (June Price Hunt, closes 30 June 2026)

### Features Live
- Glossy UI (hexToRgb Chip component, gradient buttons)
- Sort by Category with alphabetical group headers + product count
- Gold pulse animation on welcome screen
- 950+ user count
- AdBanner: 6 slides (ids 0–5), bounce scrolling (right→left→right)
- Mobile: tap-to-pause, second tap opens URL, swipe to change slide
- Desktop: hover pauses, click opens URL
- Banner auto-height, safe-area insets for iPhone rounded corners
- Sub text centred on mobile, scales with vw on desktop
- June Price Hunt Competition banner

---

## AdBanner — Slide Slots

| Slot | Status | Occupant |
|------|--------|----------|
| 0–4 | Available | "Advertise Here" placeholders |
| 5 | Demo | Ernie's.je |

---

## Advertiser Packages

### Tier Definitions

| Tier | Price | What they get |
|------|-------|---------------|
| Bronze | £99/month | Slide in rotation alongside all others. Logo, headline, sub text, CTA button to their site. |
| Silver | £249/month | Bronze + more frequent rotation + ability to update content anytime + monthly visitor stats report. |
| Gold | £499/month | **Own permanent named slot** (e.g. "the Ernie's slot"). Other slots can still be sold to non-competing businesses. Content updated whenever they want. Featured in social posts. |
| Platinum | £999/month | **Category exclusivity** — no competitor in their industry on the banner at all. Always first slide. Co-branded promotions. Same-day updates, direct line to Eamonn. |

### Key Distinctions
- **Gold ≠ whole banner** — it means one permanent named slot. Up to 5 advertisers can hold Gold simultaneously as long as they don't compete.
- **Platinum = category exclusivity** — the premium for "no rival in my industry on this banner."
- Currently 6 slots total (ids 0–5). Slots 0–4 are available.

### Advertiser Pipeline

| Contact | Business | Status |
|---------|----------|--------|
| Jason Acott | Jasons Valeting | First advertiser — first month free |
| Ernie's.je | Tools/Auto/Agricultural | Demo banner live (slot 5), employee contacted 5 June 2026 |
| Bauformat Jersey | Kitchens/Bathrooms | Approached about Silver |
| David McGrath | Co-op CMO | Contact made |
| Sarah Carlucci | Morrisons | LinkedIn connected |
| Alliance Stores | — | Call pending |

---

## Competition
- June Price Hunt — COMP_ACTIVE = true, closes 30 June 2026
- After close: set COMP_ACTIVE = false, announce winner

---

## Pending / Next Steps
- [ ] Roberts Garage as future store (prices captured 30 May 2026)
- [ ] GuernseyBasket.gg — build when JerseyBasket stable
- [ ] Convert Ernie's from demo to paying advertiser
- [ ] Competition winner announcement (after 30 June)
- [ ] Build Silver stats report feature when first Silver advertiser signs
- [ ] Build priority rotation logic when Bronze/Silver distinction matters

---

## Recent Git
- 80669134  v63 banner larger text and logo desktop and mobile
- 965c3b47  v63 banner auto-height, safe-area iPhone, sub text centred
- 875600e8  v63 logo scales with vw, mobile tap-to-pause then tap-to-visit
- 2a2fc7c9  v63 fix duplicate logo + bounce scroll
- ac2e089  v62 update user count to 950+

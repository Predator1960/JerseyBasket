# JerseyBasket.je — Project Brief
## For use in new Claude conversations to continue development
### Last Updated: 31 May 2026

---

## OWNER
- **Name:** Eamonn O'Shea
- **Phone:** 07797 721247
- **Email:** Eamonnoshea1960@gmail.com
- **Business Email:** eamonn@jerseybasket.je / hello@jerseybasket.je
- **Location:** Jersey, Channel Islands
- **Works:** From home

---

## THE APP
- **Name:** JerseyBasket
- **URL:** https://jerseybasket.je (also jerseybasket.vercel.app)
- **Description:** Jersey's first free grocery price comparison app
- **Current Version:** v36
- **Total Products:** 448
- **Categories:** 15
- **Stores:** 5

### Stores
```
{ id:"coop",      name:"CI Co-op",  color:"#16a34a", emoji:"🌿" }
{ id:"morrisons", name:"Morrisons", color:"#eab308", emoji:"🛒" }
{ id:"ms",        name:"M&S Food",  color:"#94a3b8", emoji:"✨" }
{ id:"waitrose",  name:"Waitrose",  color:"#0d9488", emoji:"🌱" }
{ id:"iceland",   name:"Iceland",   color:"#dc2626", emoji:"🧊" }
```

---

## INFRASTRUCTURE
- **Hosting:** Vercel (free tier)
- **DNS:** Cloudflare
- **Domain Registrar:** my.channelisles.net
- **Email Routing:** Cloudflare → forwards to Eamonnoshea1960@gmail.com
- **Forms:** Formspree ID: mvzyrgqj
- **Analytics:** Google Analytics G-CGQ6PXHN9T
- **Sister Domain:** guernseybasket.gg (registered, not yet built)

---

## LOCAL PROJECT PATH
```
C:\Users\eamon_qw9m8iy\OneDrive\Desktop\jerseybasket\
```

## DEPLOY COMMANDS (PowerShell) — UPDATED 31 May 2026
```powershell
cd C:\Users\eamon_qw9m8iy\OneDrive\Desktop\jerseybasket
npx react-scripts build
vercel --prod --yes
```
**NOTE:** Old commands (`vercel build --prod` + `vercel --prod --yes --prebuilt`) took 10+ minutes due to npm install. New commands take ~1 minute. Always pause OneDrive sync before deploying.

---

## KEY FILES
- `App.jsx` — main app file, always latest version
- `public/index.html` — contains Google Analytics tag G-CGQ6PXHN9T
- Latest output: `/mnt/user-data/outputs/App.jsx` (v36, 448 products)
- Dated backup: `/mnt/user-data/outputs/JerseyBasket-App-v36-31May2026.jsx`

---

## APP FEATURES (v36)
- 448 products, 15 categories, 5 stores
- Cheapest price shown by default
- Tap store pill → dropdown ranked cheapest to most expensive
- Global store pin
- ⚙️ Store on/off toggle — users can hide stores they don't want (ethics etc)
- Smart shopping basket with store-comparison strip and savings calculator
- ♥ Favourites system with separate favourites basket
- Basket + Favourites now persist via localStorage (survive app restart)
- Basket items: tick off as you shop ✓, swipe-left on mobile to delete
- Tooltip on truncated product names
- Search with ✕ clear button — searches product names only
- Sort: Cheapest / Biggest Saving / A–Z / Category
- Welcome screen appears every time app loads (6 slides)
- Slide 6: June Price Hunt Competition with leaderboard
- 🎬 Replay Welcome Guide button in ? modal
- InstallSteps component: auto-detects iPhone/Android
- 🚩 Report a Problem modal → Formspree → Gmail
- Add Item → approval workflow via Formspree (NOT live immediately)
- Scrolling ad banner (slides, click → enquiry modal → Formspree)
- ? Help modal (includes double-tap to reset zoom tip)
- ⚠️ Price disclaimer banner (remove when prices fully verified)
- 🏆 June Price Hunt Competition banner on main screen
- Competition submit form (name, mobile, email, store, product, price, notes)
- Competition leaderboard — top 5, updated manually by Eamonn
- Footer: © 2026 Eamonn O'Shea · hello@jerseybasket.je
- Copyright notice top of file: © 2026 Eamonn O'Shea

---

## JUNE COMPETITION — HOW TO UPDATE
Competition constants are near the top of App.jsx (around line 749):
```javascript
const COMP_ACTIVE = true;        // set false after 30 June
const COMP_WINNER = "";          // set to "First L" when winner decided
const LEADERBOARD = [
  // { name: "Sarah M", count: 24 },   ← remove // to activate
];
```
- Entries come via Formspree to Gmail
- Batch entries daily/every 2 days — forward to Claude to update
- Each entry includes: name, mobile, email, store, product, price, notes
- Verify receipt photo before counting
- Receipt must show store name, date and prices clearly
- Competition closes 30 June midnight — winner announced 1 July 12:00pm
- Prize: £10 voucher, store of winner's choice
- Contact winner via mobile first, email as backup

---

## INSTAGRAM POST GENERATOR
Standalone HTML file saved at:
`/mnt/user-data/outputs/JerseyBasket-Instagram-Generator.html`
- Double-click to open in browser (right-click → Open with Chrome if needed)
- Three templates: Price Shock, Weekly Basket, Poll Teaser
- Live preview, copy caption button
- No internet needed

---

## PRICE DATA STATUS
### CI Co-op
- **1,022 verified prices** captured from shop.channelislands.coop on 25 May 2026
- 80+ applied to matching products in app
- Receipt verified: Millennium Park, 28 May 2026

### Morrisons
- **998 UK prices** captured from groceries.morrisons.com on 26 May 2026
- Jersey prices ~12% higher than UK
- Cannot select Jersey for delivery — UK prices used as estimates
- NOTE: Morrisons Jersey prices not available online

### M&S Food
- Estimated prices only — not yet verified

### Waitrose
- 18+ products verified from Red Houses receipt 31 May 2026
- JD 1% Fat Milk (1L) verified at £1.65
- Most Waitrose Jersey stores run by Waitrose proper (NOT Alliance)
- One Waitrose store run by Alliance Stores

### Iceland
- Estimated prices only — not yet verified

---

## PRICE FUNCTION
```javascript
// sp(base, [coop_offset, morrisons_offset, ms_offset, waitrose_offset, iceland_offset])
// actual_price = base + offset
// Use negative offsets to zero out stores e.g. sp(1.65, [-1.65,-1.65,-1.65,0,-1.65])
// = Waitrose only at £1.65, all others hidden
const sp = (base, offsets) => {...}
```
**NOTE:** Next new product starts at id:449

---

## ANALYTICS (as of 31 May 2026)
- **732 active users** (week of 29 May — still climbing)
- Growth: 54 → 177 → 214 → 427 → 573 → 732+
- Traffic: Primarily Jersey, also Guernsey, UK, France, USA, Belgium, India
- Source: Organic word of mouth + Facebook/Instagram posts

---

## ADVERTISING
- **First enquiry:** Jason Acott — Jasons Valeting Services (jasons.cleaning.company@gmail.com)
- First month FREE as goodwill gesture (first advertiser)
- Billing to start once store partnerships confirmed and disclaimer removed
- Ad packages: Bronze £99 / Silver £249 / Gold £499 / Platinum £999/month

---

## BUSINESS CONTACTS CRM

| Person | Store | Role | Status |
|---|---|---|---|
| David McGrath | Co-op | Chief Marketing & Membership Officer | Email sent 28/05 |
| Simon Matthews | Co-op | Chief Property & Sustainability Officer | Led to David McGrath |
| Andrew Holmes | Morrisons | Operations Director CI | LinkedIn InMail sent 28/05 |
| Sarah Carlucci | Morrisons | Online Director Operations | Connected on LinkedIn ✅ |
| Alliance Stores | Alliance | Company | Call booked week of 1 June |
| Andrew Bagot | Alliance | Managing Director | LinkedIn InMail sent 28/05 |
| Kieran Poole | Alliance | Operations Director | LinkedIn InMail sent 28/05 |
| Waitrose | Waitrose | Customer Care | Email sent 28/05 |

### Key Intelligence
- Alliance Stores runs: M&S Food, Iceland, and ONE Waitrose store in Jersey
- Most Waitrose Jersey stores run by Waitrose proper (John Lewis Partnership)
- Waitrose is part of John Lewis Partnership
- LinkedIn Premium Sales Navigator activated by Eamonn
- Competitor basket.je — 123 products, login required, trying to revive via Facebook volunteers
- Owner of basket.je previously said JerseyBasket "would never work" — do not engage publicly

---

## SOCIAL MEDIA
- **Facebook Page:** JerseyBasket (live, 28 May first posts)
- **Instagram:** @jerseybasket (live, 29 May)
- **TikTok:** Not yet — revisit in 3 months

---

## REVENUE STRATEGY
- Free for consumers
- Revenue from businesses:
  - Bronze: £99/month — logo, banner, link
  - Silver: £249/month — featured placement, price feed
  - Gold: £499/month — sponsored category, data insights
  - Platinum: £999/month — exclusive homepage banner
- Data licensing: £500-1,500/month
- Buyout potential: £400k-1M at 24 months with GuernseyBasket

---

## GUERNSEYBASKET.GG
- Domain registered: guernseybasket.gg
- 6 stores: Co-op, Morrisons, M&S, Waitrose, Alliance (Food Warehouse), Iceland
- Competitor: SuperSavvySavers (only 25 products, no interactivity)
- Build in new Claude project when JerseyBasket is stable

---

## MARKETING ASSETS
- Logo suite: `/mnt/user-data/outputs/jerseybasket-logo.html`
- Facebook cover 1640×624px: `/mnt/user-data/outputs/JerseyBasket-Cover-Photo.svg`
- Facebook profile picture 500×500px: `/mnt/user-data/outputs/JerseyBasket-Profile-Picture.svg`
- Instagram post generator: `/mnt/user-data/outputs/JerseyBasket-Instagram-Generator.html`
- June competition graphic: available in chat (SVG)
- Commercial proposal: `/mnt/user-data/outputs/JerseyBasket_Commercial_Proposal_v2.docx`
- Professional advert (created by Tracy Lee, Jersey): `Advert_fb_instagram_Tracy_Lee.jpg`
  - NOTE: Update to 448+ products when Tracy updates

---

## PENDING ACTIONS
- [ ] Update Tracy Lee advert — change to 448+ products
- [ ] Complete Morrisons price capture (remaining categories)
- [ ] Verify M&S, Iceland prices
- [ ] Remove ⚠️ disclaimer banner when prices fully verified
- [ ] Alliance Stores call — week of 1 June
- [ ] Follow up Sarah Carlucci (Morrisons) on LinkedIn
- [ ] Follow up David McGrath (Co-op) if no response by 2 June
- [ ] Follow up Andrew Holmes (Morrisons) if no response by 2 June
- [ ] Post weekly on Instagram
- [ ] Build GuernseyBasket.gg (new Claude project)
- [ ] Add Google Business listing
- [ ] Set up GitHub auto-deploy for faster deploys — Friday 5 June (reminder set)
- [ ] Update leaderboard weekly during June competition
- [ ] Announce June competition winner 1 July 12:00pm
- [ ] Start billing Jason Acott (Jasons Valeting) once store partnerships confirmed

---

## IMPORTANT NOTES FOR CLAUDE
1. Always read the uploaded App.jsx before making any changes
2. App uses React with custom sp() pricing function
3. Next new product starts at id:449
4. Morrisons prices are UK estimates — Jersey prices ~12% higher
5. The price disclaimer banner should stay until prices are fully verified
6. Tobacco & Lottery excluded deliberately
7. Alcohol included — it's a normal grocery item
8. Add Item requests go to Eamonn for approval — NOT live immediately
9. Eamonn works from home, cannot do in-store price checks himself
10. Wife is a carer — very busy, also cannot do price checks
11. Always produce both App.jsx AND a dated backup e.g. JerseyBasket-App-v36-31May2026.jsx
12. Always include deploy commands at end of every update:
    ```powershell
    cd C:\Users\eamon_qw9m8iy\OneDrive\Desktop\jerseybasket
    npx react-scripts build
    vercel --prod --yes
    ```
13. Basket/favourites now use localStorage (not sessionStorage)
14. Competition entries come via Gmail — batch update daily, bring to Claude to process

---

*Brief updated by Claude Sonnet 4.6 — 31 May 2026*
*This document should be uploaded at the start of every new JerseyBasket Claude session*

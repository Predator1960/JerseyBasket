# JerseyBasket.je — Project Brief
## For use in new Claude conversations to continue development
### Last Updated: 2 June 2026

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
- **URL:** https://jerseybasket.je
- **Description:** Jersey's first free grocery price comparison app
- **Current Version:** v58
- **Total Products:** 453
- **Categories:** 15
- **Stores:** 5
- **Next product id:** 454

### Stores
{ id:"coop",      name:"CI Co-op",  color:"#16a34a", emoji:"🌿" }
{ id:"morrisons", name:"Morrisons", color:"#eab308", emoji:"🛒" }
{ id:"ms",        name:"M&S Food",  color:"#94a3b8", emoji:"✨" }
{ id:"waitrose",  name:"Waitrose",  color:"#0d9488", emoji:"🌱" }
{ id:"iceland",   name:"Iceland",   color:"#dc2626", emoji:"🧊" }

---

## INFRASTRUCTURE
- **Hosting:** Vercel (free tier, ~24 seconds deploy)
- **DNS:** Cloudflare (Browser Cache TTL: 1 second)
- **Domain Registrar:** my.channelisles.net
- **Email Routing:** Cloudflare → Eamonnoshea1960@gmail.com
- **Forms:** Formspree ID: mvzyrgqj (free tier — no file uploads)
- **Analytics:** Google Analytics G-CGQ6PXHN9T
- **Sister Domain:** guernseybasket.gg (registered, not yet built)

---

## LOCAL PROJECT PATH
C:\Users\eamon_qw9m8iy\OneDrive\Desktop\jerseybasket\

## DEPLOY COMMANDS
cd C:\Users\eamon_qw9m8iy\OneDrive\Desktop\jerseybasket
git add .
git commit -m "brief description"
git push

Vercel auto-deploys in ~24 seconds. No manual build needed.

### GitHub
- Account: Predator1960 (eamonn1960@yahoo.co.uk)
- Repo: https://github.com/Predator1960/JerseyBasket (PUBLIC)
- Branch: main
- Second account: Curtisboooy (Gmail) — not used for deployment

### Git Notes
- Pause OneDrive before pushing
- node_modules and build NOT committed
- .vercel/output removed — was causing stale builds
- vercel.json has no-cache headers
- react-scripts chmod +x fixed

---

## KEY FILES
- src/App.jsx — main app file
- public/index.html — GA tag, viewport-fit=cover
- vercel.json — no-cache headers
- Latest: /mnt/user-data/outputs/App.jsx (v58)
- Backup: /mnt/user-data/outputs/JerseyBasket-App-v58-2Jun2026.jsx

---

## APP FEATURES (v58)
- 453 products, 15 categories, 5 stores
- FULL GLOSSY UI — all pills, buttons, cards use brand colours with 3D gloss
- Store filter chips wrap to 2 rows on iPhone
- Store pills always show brand colour (dim inactive, full active)
- Product card store pill uses chosen store's brand colour
- Store dropdown uses each store's brand colour
- Store Comparison cards glow in store brand colour
- £0.00 prices excluded from best price / dropdown
- Cheapest price shown by default
- Global store pin
- Store on/off toggle (Settings)
- Smart basket with store-comparison strip and savings calculator
- Favourites system with separate basket
- Basket + Favourites persist via localStorage
- Tick off items, swipe-left to delete
- Tooltip on truncated names
- Search, Sort (Cheapest/Saving/AZ/Category)
- Welcome screen 6 slides — glossy buttons
- June Price Hunt Competition with leaderboard
- InstallSteps auto-detects iPhone/Android
- Report a Problem modal
- Share button (🔗 emoji — NOT ↗ arrow which Safari hijacks as native share)
- Add Item approval workflow
- Scrolling ad banner (5 slides)
- Help modal
- Price disclaimer banner (remove when verified)
- Competition submit form (name/mobile/email required; product/price optional)
- Email Receipt Photo button → opens mail app to hello@jerseybasket.je
- MAINTENANCE mode flag
- iOS safe-area header padding
- Modal overlay paddingTop:60 (X button never hidden)
- LIVE badge in header
- Green glow on JerseyBasket logo

---

## HEADER LAYOUT
Row 1: 🛍️ JerseyBasket · 453 products LIVE | 🔗 🚩 ? ⚙️
Row 2: 🛒 Shop · 🧺 Basket · ♥ Saved · 📊 Stores | + Add

---

## MAINTENANCE MODE
const MAINTENANCE = false; // set true → holding page, false → app
Change → save → git add/commit/push → live in 24s

---

## JUNE COMPETITION
const COMP_ACTIVE = true;
const COMP_WINNER = "";
const LEADERBOARD = [];
- Closes 30 June midnight
- Winner announced 1 July 12:00pm
- Prize: £10 voucher, store of winner's choice

---

## PRICE DATA STATUS
- Co-op: 1,022 verified (25 May 2026)
- Morrisons: 998 UK prices (Jersey ~12% higher)
- M&S: estimated only
- Waitrose: partial verified (Red Houses 31 May, St Helier 30 May)
- Iceland: estimated only

---

## ROBERTS GARAGE (future store)
Prices from Roberts West, St Peter (30 May 2026):
- Monster Ultra White: £2.59
- Monster Ultra Rosa: £2.59
- Sausage Roll: £1.70
- Bacon & Cheese Turnover: £2.10

---

## PRICE FUNCTION
sp(base, [coop, morrisons, ms, waitrose, iceland])
Negative offset = store doesn't stock item (shows £0.00, excluded from display)
Next product id: 454

---

## ANALYTICS (2 June 2026)
- 687 active users last 7 days (+288%)
- 677 new users this week
- All organic traffic

---

## ADVERTISING
- Jason Acott (Jasons Valeting) — first advertiser, first month free
- Packages: Bronze £99 / Silver £249 / Gold £499 / Platinum £999/month

---

## BUSINESS CONTACTS
- David McGrath — Co-op CMO — email sent 28/05
- Andrew Holmes — Morrisons Ops CI — LinkedIn 28/05
- Sarah Carlucci — Morrisons Online — connected LinkedIn ✅
- Alliance Stores — call awaited this week
- Waitrose Customer Care — email sent 28/05
- Alliance runs: M&S Food, Iceland, ONE Waitrose in Jersey

---

## SOCIAL MEDIA
- Facebook: JerseyBasket
- Instagram: @jerseybasket
- TikTok: revisit in 3 months

---

## GUERNSEYBASKET.GG (future)
- Domain registered
- Build when JerseyBasket stable
- Use JerseyBasket as template, change accent colour

---

## IMPORTANT NOTES FOR CLAUDE
1. Always read uploaded App.jsx before changes
2. React app with sp() pricing function
3. Next product id: 454
4. Morrisons = UK estimates, Jersey ~12% higher
5. Keep disclaimer banner until prices verified
6. No tobacco/lottery. Alcohol OK.
7. Add Item = approval workflow, not live immediately
8. Always produce App.jsx + dated backup
9. Deploy = git add/commit/push only
10. localStorage for basket/favourites
11. Competition entries via Gmail
12. Share button = 🔗 emoji ONLY, never ↗
13. Never commit .vercel/output or node_modules
14. Store colours: use hexToRgb() for inline gradients — hex opacity unreliable
15. Glossy buttons: linear-gradient(180deg, light 0%, dark 100%) + inset glow
16. Chip component uses hexToRgb() for light/dark/dim variants
17. MAINTENANCE = false near top of file

---

*Brief updated by Claude Sonnet 4.6 — 2 June 2026*
*Upload this at the start of every new JerseyBasket Claude session*

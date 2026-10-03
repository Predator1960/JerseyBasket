# JerseyBasket.je - Handover

Written 4 Oct 2026 so that any developer or AI coding assistant (for example
GitHub Copilot) can pick this project up cold. The owner, Eamonn O'Shea, is
not a programmer: explain changes in plain English, make the change yourself,
test it, and ask before anything risky or public.

- Live site: https://jerseybasket.je
- Repo: https://github.com/Predator1960/JerseyBasket (branch `main`)
- Hosting: Vercel. **Every push to `main` deploys automatically.**
- An older, very detailed brief (V20, 1 Sept 2026) is kept in Git history:
  `git show HEAD:V20-JERSEYBASKET-HANDOFF.md`. Read it for the long story of
  the mobile layout fixes, service worker and catalog data formats.

## What it is
A Jersey grocery price comparison web app (installable PWA). It compares
prices across six Jersey stores: Co-op, Morrisons, M&S, Waitrose, Iceland and
Alliance. Shoppers search products, build a basket and see the cheapest
store. There is no server or database: the whole product catalog is a big
array inside the app code, so a price change is a code change and a push.
It earns (or will earn) money from advertiser slides shown in a rotating
banner at the bottom of the app.

## Tech
Create React App (react-scripts 5) with React 18. `npm start` runs it locally
(port 3000), `npm run build` builds, and a `postbuild` step
(`scripts/inject-sw-version.js`) stamps the service worker with a new version
so browsers notice each deploy. `vercel.json` sets the build and turns off
caching.

## Where things are
- `src/App.jsx` - almost everything, about 13,700 lines. Search for these:
  - `STORES`, `CATS` - the stores and product categories.
  - `BASE_PRODUCTS` - the catalog (over 8,000 products in Sept 2026).
  - `AD_SLIDES` - the advertiser carousel. Most slots are "Your Business Here"
    placeholders; real advertisers have `advertiser` / `ctaButtons` fields.
  - `AdBanner` - banner component and its mobile CSS.
  - `FORMSPREE_ID` - feedback / enquiry form emails (public by design).
  - Receipt upload constants near the top of the app (a Google Apps Script
    address and a shared token). Anything inside this app's code is visible
    to every visitor, so treat those values as not secret.
- `public/index.html` - Google Analytics 4 tag, and the JavaScript that keeps
  the layout the right height on phones (`--app-height`).
- `public/service-worker.js` - offline/update logic. It must be saved as
  UTF-8 (it was once saved as UTF-16 and silently never worked).
- `sync_products.py`, `product-full-export.csv`, `JerseyBasket-Product-Database.xlsx`
  - the owner's Excel mirror of the catalog (see below). **The `.xlsx` and the
  `.csv` are deliberately not in Git** (ignored), so they exist only on the
  owner's PC / OneDrive; the code itself is fully on GitHub.

## Product data - two formats exist side by side
- Legacy: `prices: sp(BASE, [c, m, ms, w, i, a])` - a base price plus a
  difference per store. About 90% of products. No update date.
- Modern: `prices: { coop: X, morrisons: X, ms: X, waitrose: X, iceland: X,
  alliance: X }, upd: "D Mon"`. Use this for every new or changed product.
- Products without an `upd` date show "Catalog price" instead of a date.
- Prices come from till receipts the owner and shoppers photograph. Match each
  line to a product, update that store's price and `upd`, add genuinely new
  products, and skip anything illegible or a clearance price rather than
  guess. If two unrelated products land on the same price from one receipt,
  double check it. Verify before committing: brace balance, no duplicate ids,
  spot-check computed prices.
- After any price or product change, regenerate `product-full-export.csv`
  (id, name, category, one price column per store) and run
  `python sync_products.py` to rebuild the Excel file. The script fails if
  the Excel file is open - close it and retry.

## Advertisers
Packages the owner sells (see `JerseyBasket-Advertiser-Packages.html`):
Bronze GBP 99, Silver 249, Gold 499, Platinum 999 per month. To change a
slide, edit its entry in `AD_SLIDES` (logo images live in `public/`). If a new
slide looks broken on a phone, the cause is usually an oversized logo or very
long headline; the mobile CSS in `AdBanner` is already comprehensive. Clicks
are tracked in GA4 by `trackAdvertiserClick`.

## Environment warnings (important)
- **The project folder is inside OneDrive** (`Desktop\JERSEYBASKET`). The
  owner often keeps OneDrive stopped. Git can then fail with errors like
  "mmap failed" or "cloud file provider is not running". Fix: start OneDrive,
  or in File Explorer set the `.git` folder to "Always keep on this device".
  If the local repo looks out of date, check GitHub before assuming a push
  failed. Moving the project to a plain folder outside OneDrive (e.g.
  `C:\JerseyBasket`) would remove the problem; the owner has declined so far.
- `git blame` and unrestricted `git log` time out on this repo. Don't use them.
- On this PC do not run bare `python` / `python3` (Windows Store prompt); use
  `C:\Users\eamon\AppData\Local\Programs\Python\Python312\python.exe`.
- If a push does not appear on the live site, make an empty commit
  (`git commit --allow-empty -m "redeploy"`) and push again.
- Vercel preview links are behind a login, so the owner cannot open them
  unless Deployment Protection is changed.

## Related but separate
- GuernseyBasket.gg is a sister app in its own folder (`Desktop\GUERNSEYBASKET`),
  copied from this one. Its prices are estimates and it shares some IDs with
  this app. Never mix its files into this repo.
- The owner also has the marketing files in this folder (PDFs, posters,
  letters). They are not part of the app.

## Safety
Ask the owner before: changing prices in bulk, touching advertiser slides that
are live, changing analytics or form IDs, changing the Vercel project or
domain, or deleting anything.

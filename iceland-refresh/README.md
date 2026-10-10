# Iceland full-catalogue capture (Snappy Shopper)

Source: https://www.snappyshopper.co.uk/stores/iceland-5154 (public, no login). Prices matched the app's existing Iceland prices on 10 Oct 2026.

1. Open the store page in Chrome, press F12, open the Console tab.
2. Paste the contents of `iceland-capture.js` and press Enter. It walks every category page (about 0.4s each) and logs progress.
3. When it prints `FINISHED`, `iceland-all.json` downloads. Move it into the JERSEYBASKET project folder.
4. Ask Claude to run the Iceland import (matching script to be written/saved here after the first run).

Notes
- Each category page embeds all its products in `__NUXT_DATA__` (price, fromPrice, outOfStock, EAN as `eposCode`, badge/offer info). No API token is involved.
- Test on 10 Oct 2026: item counts matched each category's stated total.
- Offers (e.g. "4 for £5.25 Mix and Match") appear as deal categories/badges; the import should record regular price only and note offers as comments.

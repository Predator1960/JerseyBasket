# JerseyBasket: current handover (written 25 Oct 2026)

Paste this into a fresh Claude session to continue without the long history. It contains no passwords or keys.

## 1. What JerseyBasket is

A free grocery price comparison web app for Jersey (jerseybasket.je): about 15,440 products across six stores
(Co-op, Iceland, Alliance, Morrisons, Waitrose, M&S), about 2,700 users (2,722 on 24 Oct 2026; target 3,000).
It is one React file, `src/App.jsx`, on GitHub `Predator1960/JerseyBasket`, branch `main`. Vercel deploys automatically on every push.
Owner: Eamonn O'Shea (sole trader, business licence 006096, trading name "Jersey Basket.je").

## 2. The standard routine for any price or product change

1. Edit `src/App.jsx` (product rows near the top). **Keep the file LF.** Do not edit it with plain Python `open(...,'w')` on this PC: it flips every line to CRLF and creates a 20,000-line git diff. Use node, `sed`, or Python with `newline=''`. Check with `file src/App.jsx` (must not say CRLF).
2. `node coop-refresh/export_csv.js` must print `dup ids 0 exact-name dups 0`. It also checks the file still parses and regenerates `product-full-export.csv`.
3. `python sync_products.py` rebuilds `JerseyBasket-Product-Database.xlsx`. Keep the spreadsheet closed in Excel.
4. `git add src/App.jsx JerseyBasket-Product-Database.xlsx` (plus any scripts), `git commit`, `git push`. **Check the file parses before pushing** (step 2): a missing comma once broke a commit.
5. Verify the live bundle: fetch `https://www.jerseybasket.je/`, find `main.<hash>.js`, and check a unique string from your change is in it.

**Row formats.** Modern: `{id, name, cat, icon, prices:{coop,morrisons,ms,waitrose,iceland,alliance}, upd:"D Mon", upds:{store:"D Mon"}, oos:[...]}`.
Legacy: `prices:sp(base,[c,m,ms,w,i,a])` (a store's price = base + its offset; a result of 0 means "not sold there").
If `upds` exists the card shows that store's own date; otherwise `upd` applies to every priced store. A store price with no date shows as "Estimated price".
Store regular prices only. Offers go in a comment: `// special offer £X until DD/MM/YY` (strip it after it ends; `marketing-tools/strip_expired_member.js` does this for member offers).

## 3. Receipts: how to reconcile

Check **every line** of a receipt individually against the catalogue (a bundled search once missed real matches). Prices that match: re-date to the receipt date.
Prices that differ: update, noting the old price in the comment. Prices far below the regular price: treat as a special offer, keep the regular price, add a comment.
Untracked items: add a row, named as on the receipt, with a note saying the size was not printed. Ask the shopper for the size or flavour rather than guessing.
**Tag the branch** in the comment for stores with several branches. M&S: recent receipts are St John (Laura's shops); earlier or competition-period ones were St Helier / King St / Centre Point. See `marketing-tools/tag_ms_st_john.js`.
Examples of whole-receipt scripts: `marketing-tools/apply_receipts_24oct.js` and `apply_receipts_24oct_answers*.js`.

## 4. Catalogue sources and cleaning tools

- **Co-op** full catalogue and prices (JSON feed), **Iceland and Alliance** via Snappy Shopper pages: monthly refresh routine in `coop-refresh/README.md` and `iceland-refresh/README.md`. **Next refresh about 10 November 2026.**
- **Waitrose.com prices are UK prices**, not Jersey. Use shop receipts for Waitrose, Morrisons and M&S; Snappy prices for Iceland/Alliance are unverified against shelves.
- Duplicate cleaning: `marketing-tools/find_duplicates.js` (report), `merge_duplicates.js` (preview, then `--apply`). The 202 + 67 clear duplicates were merged on 21 to 24 Oct; the rest are mostly different pack sizes (not duplicates). Remaining conflicts are listed in `marketing-tools/merge_report.txt`.
- Known leftovers: Morrisons own-brand "All In One Dishwasher Tablets Original 40pk" (id 955) still has a wrong Iceland price; Waitrose Heinz Zero ketchup and McCain French Fries (24 Oct) were matched by name and price without a printed size.

## 5. The November Price Hunt competition (built 25 Oct, hidden until 1 Nov)

Receipts dated 1 to 30 Nov 2026; winners announced **Tuesday 1 Dec 2026**; prizes are Channel Islands Charity Christmas Draw tickets (1st: 7, 2nd: 5, 3rd: 3; draw date 17 Dec).
Double points at Morrisons, Waitrose, M&S. 3rd prize = random draw among everyone with a checked receipt. Full instructions: **`COMPETITION-NOV2026-RUNBOOK.md`**. History of the June 2026 competition: `COMPETITION-NOTES.md`.
Preview before launch with `?comp=preview` on the web address. Settings are in `COMP` in `App.jsx` (`enabled:false` switches it off). Standings are `public/leaderboard.json`.

**Not yet done (needs the owner):** ask the Channel Islands Lottery about giving tickets as prizes and about using the ticket image; check the competition rules with the Jersey Gambling Commission;
check one test entry reaches the Drive/Sheet with the `COMP-NOV26_` tag; write and approve the Facebook, Instagram and LinkedIn posts; final graphic (draft exists, **do not post until the Lottery agrees**).

## 6. Marketing and social

- Growth chart script: `marketing-tools/make_growth_chart.py` (add a `(D(y,m,d), users)` point and run it). Latest: 2,722 users on 24 Oct 2026.
- Receipts appeal graphics: `marketing-tools/make_store_logos_graphic.py` (uses the `Store Logo` folder). LinkedIn cover and profile pictures were made from `marketing-tools/linkedin_cover.html`.
- **LinkedIn Page:** JerseyBasket (company id 146876218), linked in the app footer. Founder note posted from Eamonn's profile. Still to do: add a second Page admin, test that Page messages notify him.
- Do not message or invite **Keiran Poole (Alliance)** before about 5 November 2026; he said on 15 Oct he would look into it over the coming weeks.
- Verify any marketing price example before use (identical-barcode products only; hold cross-store gaps until an Iceland/Alliance receipt verifies the Snappy prices).

## 7. Business admin (see `JerseyBasket Account and Login Checklist.docx`)

Business licence 006096 granted 23 Jun 2026. Check in myRegistry whether "Jersey Basket.je" is registered as a business name and whether the fee is due or can wait until revenue (get this in writing).
Class 2 social security: reply to the Business Hub (default rate £1,296/month until income is shown). Manpower Return due 31 Jan and 31 Jul (next 31 Jan 2027).
Channelisles.net hosts the domain/email (invoices 19 May 2026; renewal date to check). The receipt-photo Apps Script lives only in the Google account: **its code is not in this project** (copy it in).

## 8. Backups

Claude's memory notes (the standing rules) are in `C:\Users\eamon\.claude\projects\C--Users-eamon-OneDrive-Desktop-JERSEYBASKET\memory` and are backed up to `OneDrive\Backups\JerseyBasket-Claude\memory-2026-10-25`. Re-copy after big changes.
Session transcripts (1.4 GB) are only on the PC. Keep key decisions in files like this one.

## 9. Other projects: never mix files with JerseyBasket

Bill Splitter (`C:\Users\eamon\Projects\receipt-splitter`), GuernseyBasket (`Desktop\GUERNSEYBASKET`), Gerry's menu (`Projects\gerrys-menu`), SSPS Ltd (`Desktop\SSPS LTD`), Cake supplies idea (`Desktop\CAKE SUPPLIES`).

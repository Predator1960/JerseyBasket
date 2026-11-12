# JerseyBasket: current handover (written 12 Nov 2026)

Paste this into a fresh Claude session to continue without the long history. It contains no passwords or keys.

## 1. What JerseyBasket is

A free grocery price comparison web app for Jersey (jerseybasket.je): about 17,826 products across six stores
(Co-op, Iceland, Alliance, Morrisons, Waitrose, M&S), over 2,900 users (2,939 on 12 Nov 2026; target 3,000).
It is one React file, `src/App.jsx`, on GitHub `Predator1960/JerseyBasket`, branch `main`. Vercel deploys automatically on every push.
Owner: Eamonn O'Shea (sole trader, business licence 006096, trading name "Jersey Basket.je").

## 2. The standard routine for any price or product change

1. Edit `src/App.jsx` (product rows near the top). **Keep the file LF.** Plain Python `open(...,'w')` flips it to CRLF (20,000-line diff). Use node, `sed`, or Python with `newline=''`. Check `grep -c $'\r' src/App.jsx` gives 0.
2. `node coop-refresh/export_csv.js` must print `dup ids 0 exact-name dups 0`. Also run `node .claude/coop-import-2026-10/export_csv.js product-full-export.csv` (CSV is gitignored).
3. `python sync_products.py` rebuilds `JerseyBasket-Product-Database.xlsx` (keep it closed in Excel).
4. `git add` only the specific files (never force-add ignored files), commit, push. Commits end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
5. Optionally verify the live bundle at `https://www.jerseybasket.je/` (find `main.<hash>.js`).

**Row formats.** Modern: `{id, name, cat, icon, prices:{coop,morrisons,ms,waitrose,iceland,alliance}, upd:"D Mon", upds:{store:"D Mon"}, oos:[...]}`.
Legacy: `prices:sp(base,[c,m,ms,w,i,a])` (0 = not sold there). Store regular prices only; offers and member prices go in a `//` comment (strip after expiry).

## 3. Receipts: how to reconcile

Check **every line** individually against the catalogue. Matching prices: re-date to the receipt date. Different prices: update. Far below the usual price: special offer, keep the regular price, add a comment. Untracked items: add a row named as on the receipt with "(size not confirmed)". Don't ask shoppers for sizes.
Weighed (per kg) and reduced-item lines are counted for the competition but not stored. Lottery tickets are not groceries and are not counted.
Tag the branch in a comment for M&S (recent shoppers: St John or King Street, St Helier) and Co-op.
Tools: per-receipt scripts `marketing-tools/apply_*.js` (latest `apply_claire_12nov.js`; copy its 33-line header); till-text mappings `marketing-tools/receipt_glossary.csv`; lookup `node marketing-tools/receipt_lookup.js <Store> "TILL|price"`.
**New row ids = current max id + 1** (max was 18243 on 12 Nov). Always confirm "dup ids 0".

## 4. Catalogue sources

- **Co-op / Iceland / Alliance** monthly refresh: `coop-refresh/README.md`, `iceland-refresh/README.md`. **Last run 11 Nov 2026** (Co-op 389 updates / 920 new; Iceland 1,579 / 731; Alliance 723 / 434). **Next about 11 Dec 2026.**
- **Waitrose.com prices are UK prices**, not Jersey: use receipts. Alliance Snappy prices run about 4.8% above Iceland, unverified against shelves.
- Duplicate tools: `marketing-tools/find_duplicates.js`, `merge_duplicates.js`.
- Known leftover: Baileys £16 receipt price (size unconfirmed) vs the £20 70cl row.

## 5. The November Price Hunt (LIVE 1 to 30 Nov 2026; second Price Hunt, June was the first)

Winners announced **Tue 1 Dec**, draw **Thu 17 Dec**. Prizes: Channel Islands Charity Christmas Draw tickets (7/5/3). Always add: "JerseyBasket is not connected to the Channel Islands Lottery".
Points: double at Morrisons, Waitrose, M&S; single at Co-op, Iceland, Alliance; +5 per referral. Every readable grocery line counts. Any card or payer is fine if the receipt is in date and readable; only a burst of about 5 to 10 same-day receipts from one entrant is suspect. Receipts dated before 1 Nov are catalogue-only.
Entries: `Desktop\JerseyBasket Competition\entries.csv` (alias,store,verified_prices,referred_by). Update the board: `node marketing-tools/update_leaderboard.js "<entries.csv>"` (auto-raises a store bar by 100 when full). Image: `python marketing-tools/make_leaderboard_image.py [--note "text"]`.
**Standings 12 Nov:** Katrina B 255, Jason L 205, Mary C 84, Claire E 68, Sandra B 54, Lucy D 49, Yasmin T 34. Bars: Morrisons 98/100 (will raise to 200), Waitrose 221/300, M&S 34/100.
**Every reply to an entrant says:** in the app tap the yellow Price Hunt banner or "Spotted a price we're missing?", or email hello@jerseybasket.je; long receipt = 2 or 3 photos of different parts (matched as one); +5 per referred friend; results and draw dates. Plain sign-off, no signature, never name other entrants.
Receipt notifications arrive at hello@jerseybasket.je from jerseybasket.receipts@gmail.com (Apps Script runs under that account; the .gs files are in this backup folder). Still to do: tick "Skip the Inbox" on the Receipts Gmail filter; delete TEST-delete-me rows/photos from the Sheet and Drive.
**After 30 Nov:** run `marketing-tools/draw_third_prize.js`, announce on 1 Dec, hand over tickets, delete contact data. See `COMPETITION-NOV2026-RUNBOOK.md`.

## 6. Marketing and social

- Always draft Facebook, Instagram AND LinkedIn (LinkedIn aims at a supermarket boss). Say "over 2,900" users and "over 17,000" products.
- **All graphics use the 3D glossy look** via `marketing-tools/glossy.py` (`make_leaderboard_image.py`, `make_milestone_graphic.py`, `make_advertiser_graphic.py`). Output goes to Downloads.
- Growth chart: `marketing-tools/make_growth_chart.py` (add a `(D(y,m,d), users)` point). Latest 2,939 on 12 Nov.
- **At 3,000 users:** update the 3 infographic HTMLs and the welcome screen (still 2,460+ / 9,568 from 5 Oct) and post a milestone.
- Advertising banner: 15 slots x 4 s = 60 s loop ("about once a minute"), GBP 99 a month, no 16th slot.
- Verify any price example before marketing (identical-barcode products only).

## 7. Outreach

- **Morrisons Jersey is owned by Wm Morrison** (JCRA decision 24/51; `sandpiper-morrisons-decision.pdf`). Rami Baitieh (CEO) messaged on Instagram 23 Sep and 11 Nov; **do not chase before about 25 Nov**, then try the Morrisons contact form or a Castle Quay / Queens Road manager. Still to verify: the Iceland receipt footer ("Operated by Food Retail Limited").
- Roberts Garages: advertiser invite sent via their website contact form 11 Nov; awaiting reply.
- Keiran Poole (Alliance) replied 15 Oct (will look into it); could be reframed with the public-data point.

## 8. Business admin (see `JerseyBasket Account and Login Checklist.docx`)

Business licence 006096 (23 Jun 2026). Check myRegistry for the business name registration and fee. Class 2 social security reply to the Business Hub. Manpower Return due 31 Jan / 31 Jul. Channelisles.net hosts the domain and email (check renewal date).

## 9. Backups

Memory notes (standing rules) live in `C:\Users\eamon\.claude\projects\C--Users-eamon-OneDrive-Desktop-JERSEYBASKET\memory` and are backed up to `OneDrive\Backups\JerseyBasket-Claude\memory-2026-11-12`. **Standing order: refresh this folder at the end of every session** (memory, entries.csv, .gs files, scripts, untracked-docs zip; SSPS LTD excluded).

## 10. Other projects: never mix files with JerseyBasket

Bill Splitter (`C:\Users\eamon\Projects\receipt-splitter`), GuernseyBasket (`Desktop\GUERNSEYBASKET`), Gerry's menu (`Projects\gerrys-menu`), SSPS Ltd (`Desktop\SSPS LTD`), Cake supplies idea (`Desktop\CAKE SUPPLIES`).

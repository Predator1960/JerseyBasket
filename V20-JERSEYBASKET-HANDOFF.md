# JerseyBasket.je — Handoff Brief V20

**Written:** 1 September 2026
**Covers:** A long multi-day Claude Code session (desktop), plus one commit made separately via the web-based Claude Code session on 1 Sept.
**Live site:** https://jerseybasket.je
**Repo:** https://github.com/Predator1960/JerseyBasket (main branch, auto-deploys to Vercel)
**Current state:** 8,042 products in `BASE_PRODUCTS` (max id 8117), 1 active paid-style advertiser slide (Zia IT Support, slot 14) — all August "free offer" advertiser slides have been retired back to placeholder banners.

---

## 1. Current live state (as of commit `893d7df6`)

- **Catalog:** 8,042 products across Co-op, Morrisons, M&S, Waitrose, Iceland, Alliance.
- **Two data formats coexist** in `BASE_PRODUCTS` (`src/App.jsx`):
  - Legacy: `prices:sp(BASE,[c,m,ms,w,i,a=0])` — differential array, `store_price = max(0, round(BASE+diff,2))`. No `upd` field.
  - Modern: `prices:{coop:X,morrisons:X,ms:X,waitrose:X,iceland:X,alliance:X}, upd:"D Mon"`. Used for all new entries going forward.
  - Roughly 90% of the catalog is still legacy-format with no `upd` date. See §4.
- **Advertiser carousel (`AD_SLIDES`):** only **Zia IT Support** (slot 14, "AUGUST FREE OFFER — SPOT 9 OF 12" eyebrow — note the eyebrow text is now stale copy since the promo ended, see §5) has real `ctaButtons`/`advertiser` fields. Every other slot (1, 2, 3, 4, 5, 6, 7, 12, 15, etc.) is back to a generic "Your Business Here — Claim this slot" placeholder. This revert was done intentionally via the web session on 1 Sept (commit `893d7df6`) since the August promotion period ended — Domino Cabs, Dirt Blasterz, PrimeScapes Construction, Tommy Green Thumb, We Deliver, Crystal Carpet Cleaning, Kyle Simon Mobile Mechanic, and 4 Group are all currently NOT showing on the live site, even though their slide data/logos still exist in git history if they need to come back.
- **Excel mirror:** `JerseyBasket-Product-Database.xlsx` kept in sync with `BASE_PRODUCTS` throughout — same ids, prices, categories. Columns: ID, Product Name, Category, Icon, then Price+Till Desc pairs per store, then Lowest Price, Cheapest Store, App Last Updated, Notes.

---

## 2. What happened this session, roughly chronologically

### Bug fixes
- **Mobile viewport bug** — the ad banner/footer floated above the true bottom of the screen on phones (especially home-screen PWA installs), exposing a product row underneath. Took 3 attempts: `100vh`→`100dvh` (worked in browser, not on installed icon) → flexbox restructuring (still failed) → **JS-measured `--app-height` custom property** fed from `window.visualViewport.height`, updated on resize/orientationchange (in `public/index.html`). This was the fix that actually worked and is still in place.
- **Service worker was completely non-functional** — `public/service-worker.js` had been silently saved as UTF-16 (null byte after every character) since it was first written, so it had never actually registered on any device. Rewrote as proper UTF-8, added real versioning (`SW_VERSION` auto-generated per build via `scripts/inject-sw-version.js`, `NOTIFY_VERSION` hand-maintained to gate the "Update now" banner for significant releases). Verified live that registration went from empty to `active`.
- **Search box disappearing behind the mobile keyboard** — two attempts:
  1. First tried `scrollIntoView` triggered on focus + `visualViewport` resize. Didn't work — user reported it still failed.
  2. **Real root cause found**: the footer+`AdBanner` block is a `flexShrink:0` sibling of the scrollable content pane (deliberately, so it stays pinned to the true bottom edge — see the mobile viewport fix above). When the keyboard shrinks `--app-height`, that block keeps its full height and eats nearly all the remaining space, squeezing the scrollable pane (which holds the search box) down to almost nothing — no amount of scrolling could reveal it. **Fix:** hide the footer+banner block entirely while the search input is focused (`{!searchFocused && (...)}` in the main render), freeing that space back to the actual content. This is the fix that's actually live and working now.
- **Mobile CTA buttons overflowing off-screen** when a slide has 3+ buttons (Tommy Green Thumb was the trigger case) — the `.jb-ad-headrow` (eyebrow+headline) has `flexShrink:0` and no `min-width:0`, so on narrow screens it doesn't shrink and overflows rightward, painting underneath the CTA buttons instead of ever getting its own line. Fixed with a comprehensive `@media (max-width:640px)` block on `.jb-ad-outer`/`.jb-ad-content`/`.jb-ad-left`/`.jb-ad-headrow`/`.jb-ad-eyebrow`/`.jb-ad-headline`/`.jb-ad-sub`/`.jb-ad-ctas` (search `AdBanner` in `src/App.jsx`). This is the one CSS block to check first if any *new* advertiser slide ever looks broken on mobile — it's already comprehensive, so a broken slide usually means bad content (e.g. an unusually wide logo image or unusually long headline text), not a missing CSS rule.
- **Vercel missed-webhook deployment** — after two very fast successive pushes, the second commit's Vercel build never triggered (GitHub commit-status API showed `total_count:0` for 6+ minutes). Fixed with `git commit --allow-empty` + push to force a fresh trigger. Worth knowing as a diagnostic pattern if a push ever "doesn't show up" on the live site.
- **Product data display**: products without a real `upd` date now show **"Catalog price"** instead of blank, so shoppers can tell "recently verified via a real receipt" apart from "not individually re-checked." See §4 for why this is a fallback label rather than a full data migration.

### Advertiser slides added (all now retired except Zia — see §1)
Dirt Blasterz Jersey (slot 2), Crystal Carpet Cleaning (slot 12), Tommy Green Thumb (slot 5), Kyle Simon Mobile Mechanic (slot 6), 4 Group (slot 15), **Zia IT Support (slot 14) — still live**. Logo assets for all of these are still in `public/` even where the slide itself is currently a placeholder.

### Analytics
GA4 event tracking added for advertiser interactions — `trackAdvertiserClick(s, source, buttonLabel, url)` fires a `gtag('event','advertiser_click', {advertiser, click_source, button_label, link_url})` on both CTA-button clicks and whole-banner taps. Verified working end-to-end via the user's own GA4 UI after they set up 3 Custom Dimensions (Advertiser, Click Source, Button Label). Reminder: GA4 custom dimensions don't backfill — events before a dimension was created show as "(not set)" permanently, that's expected and not a bug.

### Catalog reconciliation (receipts → live prices)
Multiple large batches this session, each following the same pattern: decode till receipt photos, cross-check against `BASE_PRODUCTS` by name, update the matching store's price field on a match (refreshing `upd`), add as a new modern-format entry if genuinely new, skip anything too garbled/blurry/a clearance price rather than guess. Roughly, across the session:
- Waitrose Food Cupboard full department listing sync — ~97 price corrections + **270 new products** added.
- 6 receipts (Alliance, Morrisons, Co-op ×2, Waitrose ×2) — 47 price updates, 35 new products.
- 2 receipts (M&S, Co-op) — 4 price updates, 35 new products.
- 2 Waitrose receipts — 12 price updates, 15 new products.
- 8 receipts (Waitrose ×3, Co-op ×5, two of them 70+ and 88+ items) — ~18 price updates, 26 new products. **Caught and reverted one real data-quality slip**: two unrelated products (Cadbury Biscoff, Mr Kipling Bakewell Slices) had both landed on an identical £1.58 from the same receipt — almost certainly a transcription misread, not a genuine coincidence. Reverted both to their prior confirmed values before pushing. Worth remembering as a pattern: if two unrelated items from the same receipt land on an identical price, double-check before trusting it.
- One manual single-item edit (Waitrose King Prawns 150g, user-edited directly in the file) — committed, and the `upd` date + Excel mirror were updated to match on request.

**Methodology note for future reconciliation passes:** for anything beyond a couple of receipts, this session delegated the actual grep/match/edit work to a background general-purpose agent with a fully pre-decoded item list (store mapping, prices, explicit skip list for illegible items, cross-referenced existing product ids where already known) — trying to hand-edit thousands of lines directly in the main conversation doesn't scale. The orchestrating session still did its own static verification afterward every time (brace/bracket balance, null-byte/encoding check, duplicate-id check, spot-checking a few specific price computations) before ever committing — don't skip that step just because an agent reported success.

### Social/marketing assets produced (not code, but delivered this session)
A set of branded 1080×1080 PNG graphics (monthly-savings hero, yearly-savings hero, basket cheapest-vs-priciest comparison, and a "Win a £15 voucher" competition post with Jersey-residents-only eligibility) built with PIL directly (no Node available — see §6), using real computed catalog statistics (not invented numbers) as the basis for the savings claims. Files were sent to the user via SendUserFile, not committed to the repo.

---

## 3. Outstanding / things to do

- **`JERSEYBASKET/THINGS TO DO.md`** exists in the project root — check it directly, it's kept current. As of this write-up its one tracked item (the `upd` date coverage gap) is marked resolved (see §4).
- **Zia IT Support's eyebrow text** still says "AUGUST FREE OFFER — SPOT 9 OF 12" even though the August promotion is over and it's now the only real advertiser showing — this copy is now stale/inaccurate and should probably be updated or removed next time anyone touches that slide.
- **No decision has been made yet** about whether/when to bring back any of the retired advertiser slides (Dirt Blasterz, Crystal Carpet, Tommy Green Thumb, Kyle Simon, 4 Group, PrimeScapes, We Deliver, Domino Cabs) — their data is intact in git history (see commit `893d7df6`'s parent for the last state each was live), just currently switched back to placeholder banners.
- **Legacy-format product migration** (see §4) — deliberately NOT done as a full data migration. If ever revisited, don't repeat the git-blame approach (see §6, it doesn't work in this environment).

---

## 4. Why most products show "Catalog price" instead of a date

The user wanted every product to show when its price was last verified. Only the ~10% of the catalog in the modern data format carries a real `upd` date; the legacy `sp()`-format majority never had one.

Two approaches were tried and rejected before landing on the current fix:
1. **Backdate everything to today** — rejected as dishonest; would falsely imply the whole catalog was just re-verified in-store.
2. **Pull real historical per-product dates from git history** (`git blame`) — technically the "right" answer, but **abandoned because it doesn't work in this environment**: any git history operation broader than a small `-N` limited log (`git blame`, unrestricted `git log`, path-filtered `git log -- src/App.jsx`) reliably times out, seemingly a combination of this file's size/edit-density and OneDrive recall overhead (see §6). Don't attempt this again without first solving the OneDrive-in-`.git` problem structurally (e.g. moving the repo out of OneDrive entirely).

**What actually shipped:** a one-line display fix. Products with a real `upd` show it; products without one show **"Catalog price"** instead of blank. Honest, small, safe. See `src/App.jsx`, search for `"Catalog price"`.

---

## 5. Known stale copy / minor issues not yet fixed
- Zia IT Support slide's "AUGUST FREE OFFER" eyebrow (see §3).
- Nothing else currently flagged as broken as of this write-up — the live site was verified deploying successfully as of commit `893d7df6`.

---

## 6. Environment notes for whoever (human or AI) picks this up next

- **No Node.js/npm on this machine.** Can't run `npm start`, can't build locally, can't get a live browser preview of changes. Verification this session relied on: (a) static checks — brace/bracket/paren balance, null-byte/encoding checks, duplicate-id checks, computing `sp()` prices by hand in Python and comparing before/after; (b) pushing to a short-named preview branch (keep branch names short — Vercel's `project-git-branch-team.vercel.app` alias silently 404s if the combined name exceeds ~63 chars) and checking the built preview via the GitHub deployment API's `environment_url` (NOT by guessing the alias URL — guessing it wrong wastes time, and the guessed alias format also does not reliably match what Vercel actually assigns); (c) building faithful CSS/HTML mockups of individual ad-banner slides in isolated iframes (real `@media` breakpoints only trigger correctly with a real isolated viewport — an iframe with a `width` attribute, not just a narrow `<div>` on a wide page) to check for overlap bugs before shipping.
- **Vercel deployment protection blocks preview links from being opened directly** — they redirect to a Vercel login wall. Getting the actual preview `environment_url` via `GET /repos/{owner}/{repo}/deployments/{id}/statuses` (the GitHub Deployments API, not the simpler Statuses API which only gives an inspect-page URL requiring login) is the reliable way to get a working link; still won't be openable by someone without Vercel dashboard access unless the project's Deployment Protection setting is changed.
- **OneDrive + `.git` is a real, recurring problem, not a one-off.** The user deliberately keeps OneDrive **stopped** most of the day (roughly 8am–midnight) for their own workability reasons, and only starts it when asked. This repo lives inside `OneDrive\Desktop\JERSEYBASKET`. With OneDrive stopped (or even sometimes just after it's been restarted but hasn't fully resynced), `.git`'s internal pack files can be cloud-only placeholders, and git commands that need to actually read pack contents — `git blame`, `git gc`, `git fetch`, sometimes even `git push` — fail with `fatal: mmap failed: Invalid argument` or `.NET`-level errors like "The cloud file provider is not running" / "The cloud operation is invalid." Plain `git status`/`git log -N`/`git commit` seem to tolerate it stopped more often than not, but not reliably.
  - **Fix when it happens:** ask the user to start OneDrive, then retry. If a plain retry still fails, the most reliable un-stick method found this session was having the user select the affected folder in **File Explorer** (not a scripted read) and choose **"Always keep on this device"** — do this on the smallest folder that covers the problem (e.g. `.git\objects\pack` specifically) rather than the whole project folder, because pinning a large parent folder (e.g. the whole Desktop) can trigger OneDrive to re-walk everything under it (seen once ballooning to "76,054 items" and taking a long time).
  - **This has also caused local git state to silently regress** — twice-pushed commits vanished from the local reflog entirely (while remaining correctly on GitHub) after OneDrive resync activity, with no error shown at the time. If local state ever looks stale or contradicts what was clearly pushed, don't assume the push failed — check GitHub directly (`git fetch` + compare, or the GitHub API) before concluding anything, since local `.git` is the less trustworthy source of truth in this specific setup.
  - **Longer-term recommendation** (declined so far, still on the table): move the project to a plain local folder outside OneDrive entirely (e.g. `C:\JerseyBasket`) — the code itself is already fully backed up via GitHub regardless, so OneDrive's backup of it is redundant, and this would eliminate the whole class of problem. The user's preference so far has been to keep it in place and just ask them to start/stop OneDrive as needed — respect that unless they raise it again.
- **This machine's Claude Code CLI is pinned to an older version (`2.0.76`)** on at least one of the user's laptops — a newer version crashed with "Illegal instruction" (a known Bun-runtime/AVX-CPU-support issue on that specific older hardware). Not relevant to this desktop session directly, but worth knowing if the user mentions Claude Code crashing on a different machine — don't suggest `claude update` there without checking this history first.

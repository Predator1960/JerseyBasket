# JerseyBasket "June Price Hunt" competition: reconstruction notes

Reconstructed on 24 Oct 2026 from the git history (`git log`, `git show`), the code as it stood before it was removed
(`git show 1c317ee2~1:src/App.jsx`), and other files in this project. Nothing here is guessed. Anything I could not
find is in section 7 and is marked **UNKNOWN**. Commit hashes are given so each fact can be checked.

**It was June 2026, not August.** The only competition in the history is the **June Price Hunt (1 to 30 June 2026)**.
August was a free-advertising campaign (a home-screen banner), not a competition.

---

## 1. How people entered, and what they had to submit

- They submitted **prices from a shopping receipt**, from any of Jersey's supermarkets (6 stores once Alliance was added on 13 June).
- Entry was through an in-app form (`SubmitPriceModal` in `src/App.jsx`), reached from a "June Price Hunt" banner on the home screen,
  from the "June Price Hunt!" onboarding slide, and from the "Submit a Price Now" button inside the competition modal.
- **Form fields (final June version, checked at commit b58d08e5, 29 Jun):**
  - Name, **required**. "First name, nickname or alias", for example "IslandShopper". Only this appeared on the leaderboard.
  - Mobile number and email. **At least one of the two was required, not both** (commit edd571b7, 6 Jun).
  - Receipt photo, marked required in the form wording.
  - The Submit button was disabled until a name plus a mobile or an email was filled in. **The photo was not actually enforced in code.**
- **The form sent the entry to Formspree** (`FORMSPREE_ID` in `App.jsx`) as an email-style submission with the subject
  `🏆 June Competition Receipt — <name>` and the body "JUNE COMPETITION ENTRY" plus name, mobile, email and receipt filename.
- **Important: the photo itself never went through the form.** Commit 76817ec6 (8 Sep) confirms Formspree's free tier does not allow file
  attachments ("File Uploads Not Permitted"), so only the **file name** was sent. See section 7 for how the photos reached you (unknown).
- **Rules shown to entrants (in `CompetitionModal`, removed 8 Sep):**
  - Each receipt can only be submitted once.
  - The receipt must show the store name and date clearly.
  - All receipts are manually checked before prices are counted.
  - Only receipts dated within June 2026 are valid.
  - Prices must be from Jersey stores only.
  - Only new prices not already in the app count.
  - Any name or alias is shown on the leaderboard, and real details are never shared.
  - The competition closes 30 June 2026 at midnight. The winner is announced 1 July 2026 at 12:00pm.
  - The winner is contacted by the email or phone provided.
  - JerseyBasket's decision is final.
- **Extra rules recorded in `The Creation Of JerseyBasket.je/generate_logbook.py` (not shown in the app):**
  - What counts: new grocery or food items not already in the app.
  - What does not count: products already in the app, carrier bags and non-food items.
  - The receipt must show a visible date.
  - **Carmen1971 was disqualified from winning (Eamonn's wife).**
- A social graphic, "Win a £15 voucher", with **Jersey-residents-only eligibility**, is mentioned in `MD/V20-JERSEYBASKET-HANDOFF.md` (line ~53).
  The in-app rules above do not say "residents only".

## 2. How entries were scored and ranked, and how the leaderboard worked

- **Score = number of new, verified product prices from that person's receipts.** The leaderboard showed it as "N prices"
  (`count` in the `LEADERBOARD` array). Commit messages call the same thing "points", for example "Kate 62pts".
- Ranking was **highest count first**, sorted in code (`[...LEADERBOARD].sort((a,b)=>b.count-a.count)`, added 16 Jun in commit edb962fc).
- **The leaderboard was edited by hand.** `LEADERBOARD` was a constant array in `App.jsx`
  (`{ name, store, count, date }`). After checking receipts, the entry was edited and the app redeployed. Many of the leaderboard commits
  in June also added the products from that receipt (for example "Kate Waitrose receipt 10 new products").
- Display: the modal showed the **top 10** (the code used `.slice(0,10)`) even though the "How it works" text said "Top 5 shown on the leaderboard";
  "Updated weekly throughout June" was the wording, though the commits show updates every few days.
- Ties were shown as equal positions in the 24 June logbook table (two entrants on 9 prices, both "7th").
- Pending entries were tracked outside the app: the logbook lists **Lucy Lemos, 10 prices, PENDING**, "Date needed on ScanPayGo receipt".

**Final leaderboard constant (as last edited, 29 Jun, commit b58d08e5; it stayed in the file until 8 Sep):**

| Pos | Name | Store | Prices | Date |
|---|---|---|---|---|
| 1 | Jason S | Iceland | 117 | 29 Jun |
| 2 | Kate | Waitrose | 93 | 27 Jun |
| 3 | Leticia | CI Co-op | 85 | 26 Jun |
| (not eligible) | Carmen1971 | CI Co-op | 34 | 23 Jun |
| 5 | 19Margaret37 | CI Co-op | 14 | 13 Jun |
| 6 | Nicole1 | Waitrose | 12 | 11 Jun |
| 7= | Sharon | Morrisons | 9 | 07 Jun |
| 7= | dreamer1977 | CI Co-op | 9 | 06 Jun |

Notes on this table:
- Snapshot **24 June** from the logbook: Kate 83, Leticia 62, Jason S 33, Lucia Sousa 20, 19Margaret37 14, Nicole1 12, Sharon 9, dreamer1977 9, Carmen1971 34 (not eligible).
- Lucia Sousa (20 pts on 23 Jun) was **merged into Leticia** (commit d0ee398f, 27 Jun, "Leticia 85pts (merged Lucia Sousa), Lucia removed"), which is why she is not in the final table.
- Your notes mention "12 Waitrose prices, 9 Morrisons prices on 7 June". In the code, **Sharon / Morrisons / 9 prices is dated 07 Jun** (commit 36b97c46).
  The **12 Waitrose prices** match two entries on other dates: Nicole1 on 11 Jun (commit 4565fd35) and Jason's first 12 Waitrose products on 15 Jun (commit 62b4664a).
  Neither of those is 7 June.
- The "Store" column is one store per entrant, but several entrants submitted at more than one store (the logbook lists Leticia as "Co-op / Waitrose", Jason S as "Waitrose / M&S").
  The store shown in the final constant is therefore not a full record.

## 3. The prize, the dates, and how winners were chosen

- **Dates:** 1 June 2026 to 30 June 2026 at midnight. Winner announced **1 July 2026 at 12:00pm**. The code first appears in commit c7124cdd (1 Jun, "v37").
- **Prizes:**
  - **One £10 gift voucher** until 9 June (the text replaced by commit 51718d15 said "Win a £10 gift voucher"). I did not check the very first commit's wording.
  - **Upgraded on 10 June to 1st £15, 2nd £10, 3rd £5** gift vouchers, "store of winner's choice" (commit 51718d15, "1000 users milestone").
  - `MD/JerseyBasket-Business-Plan.md` records **"Competition prizes (June): £30.00 (paid July 2026)"**, which is £15 + £10 + £5.
- **How winners were chosen:** by **highest count of verified new prices**, with every receipt checked manually and duplicates rejected.
  Per the final leaderboard the top three eligible entrants were **Jason S (117), Kate (93), Leticia (85)**.
  Treat that as the implied result only: **no winner name was ever recorded in the code** (`COMP_WINNER` was `""` in every commit).
- **When the banner ended:** the comments say "auto-expires at midnight 30 June" (commit 98eb2a9f), but **I found no date check in the code**.
  `COMP_ACTIVE` stayed `true` and was removed by hand in commit 0e709668 (5 Jul, v83). The remaining dead code was deleted in commit 1c317ee2 (8 Sep).

## 4. Where entry data is stored and how to export it

- **June entries (name, mobile, email, receipt filename):** sent to **Formspree** (form ID in `FORMSPREE_ID` in the pre-removal `App.jsx`, still used for other forms).
  They arrive as emails to the Formspree account owner and sit in the Formspree dashboard.
  **UNKNOWN:** which email address receives them, and whether Formspree's free plan still holds the June submissions or allows CSV export.
  Check the Formspree dashboard directly: log in, open the form, look under Submissions.
- **Leaderboard names and counts:** only in git history, in the `LEADERBOARD` constant (see section 2) and in `generate_logbook.py` (24 June snapshot).
- **Receipt photos for June:** **not stored by the app at all** (see section 7).
- **Since 8 Sep (commit 76817ec6), receipt photos go to Google Apps Script:** `SubmitPriceModal` posts the photo plus name, mobile, email, store and date to the
  `RECEIPT_WEBAPP_URL` web app. The script saves the photo to a **Google Drive folder** and logs each submission to a **Google Sheet**.
  - Export: open the Sheet and use File > Download > CSV.
  - **UNKNOWN:** the Drive folder and Sheet names or links. They are not in the repo, so check the Google account that owns the Apps Script.
  - The shared secret is visible in the shipped JavaScript, as commit 76817ec6 itself notes, so treat it as a light deterrent only.
- The Business Plan (`MD/JerseyBasket-Business-Plan.md`, lines ~183 to 188) lists entrants' names, emails and mobile numbers as personal data kept "solely for competition administration".

## 5. Which parts of the code could be reused for a rerun

The competition code was deleted from `src/App.jsx` in commit 1c317ee2. To recover any of it:
`git show 1c317ee2~1:src/App.jsx > old_app.jsx` (or `git show b58d08e5:src/App.jsx` for the 29 June version).

| What | Where in the old file (1c317ee2~1) | Reuse notes |
|---|---|---|
| `CompetitionModal` (header, how it works, rules, leaderboard, buttons) | ~line 11092 | Hard-codes June 2026 dates, prizes and "6 supermarkets". Needs new wording. |
| `LEADERBOARD` array and `COMP_WINNER` | ~lines 8700 to 8715 | Manual update by editing and redeploying. |
| State `showCompetition` and the modal render | ~lines 8737 and 9871 | |
| Leaderboard block and "Enter Competition" button branch inside `WelcomeModal`'s last slide | ~lines 10344 to 10360 and 10448 | Dead code by then; removed in 1c317ee2. |
| Home-screen competition banner (`COMP_ACTIVE`) | **only in the June versions**, for example `git show b58d08e5:src/App.jsx`, ~line 1849 | Orange gradient banner that opened the modal. Removed 5 Jul (commit 0e709668). |
| Onboarding slide "June Price Hunt!" (`competition: true`) | **only in the June versions**, same file, ~line 2794 | Removed 5 Jul (commit 0e709668). |

**Still in `App.jsx` today and usable for a rerun:**
- `SubmitPriceModal`, the current photo-first receipt form (store pills, date taken, up to 4 photos, auto-shrink, parallel upload to the Apps Script).
- The Apps Script endpoint (`RECEIPT_WEBAPP_URL`), which already saves photos to Drive and logs to a Sheet.
- Tooling for adding products from receipts: `marketing-tools/` and `coop-refresh/` scripts.

**Not built, if you rerun:**
- Any way to count entries per person (the old design had no entry ID or counter).
- Any automatic check for duplicate receipts.

## 6. What I found elsewhere in the project

- `The Creation Of JerseyBasket.je/generate_logbook.py`: June Price Hunt section with rules, the 24 June leaderboard and the disqualification note.
- `MD/JerseyBasket-Business-Plan.md`: prize cost (£30, paid July 2026) and data-protection wording.
- `MD/V20-JERSEYBASKET-HANDOFF.md`: mentions the "Win a £15 voucher" graphic with Jersey-residents-only eligibility.
- Git messages (search `git log --grep='leaderboard'`): the week-by-week record of who submitted what.

## 7. Unknown, or not found

1. **Who won, and how it was announced.** `COMP_WINNER` was never set. The final table implies Jason S, Kate and Leticia, but nothing records the actual result, any adjustment after 29 June, or the announcement on 1 July.
2. **How the June receipt photos reached you.** The form only sent the file name (commit 76817ec6). An early version told entrants to "email it to hello@jerseybasket.je" (removed in commit 26bc6985), and the form's error message also pointed to that address, but I could not confirm the actual routes used (email, Messenger, WhatsApp or elsewhere).
3. **The total number of entries and entrants.** Only the leaderboard names exist in the repo, not the full Formspree list.
4. **Whether "Lucy Lemos" (10 pending prices) was ever accepted.** She is not in the final table. The 24 June note says "Date needed on ScanPayGo receipt".
5. **Which of Jason's and Nicole1's receipts equal your note of "12 Waitrose prices"** (two candidates, section 2).
6. **The email that receives Formspree submissions**, and whether Formspree still holds the June entries (section 4).
7. **The Drive folder and Google Sheet** that hold receipts since 8 September (section 4).
8. **Any terms and conditions beyond the in-app rules.** No separate T&Cs document was found, and nothing records a legal check on the competition.
9. **Why `Jason S` is shown against "Iceland"** in the final table, when the logbook lists Waitrose and M&S for him.
10. **Total points per person by store** (for example how many of Leticia's 85 prices came from each store). Only the per-commit messages hint at this.

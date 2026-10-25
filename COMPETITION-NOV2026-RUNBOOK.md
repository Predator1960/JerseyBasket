# November Price Hunt 2026: how to run it

**Receipts dated 1 to 30 November 2026. Winners announced Tuesday 1 December 2026.**
Prizes: Channel Islands Charity Christmas Draw tickets. 1st = 7, 2nd = 5, 3rd = 3 (draw date Thursday 17 December 2026).
Background on the June 2026 competition: `COMPETITION-NOTES.md`.

## What was built

| Piece | Where | What it does |
|---|---|---|
| Competition settings | `COMP` in `src/App.jsx` | Dates, name, double-points stores. `enabled:false` hides everything. |
| Home banner | home screen of the app | Shows only from 1 Nov 00:00 until 8 Dec. Before then the public sees nothing. |
| Competition screen | `CompetitionModal` | Prizes, how it works, "fill the gaps" store progress bars, leaderboard, rules, Enter button. |
| Entry in the receipt form | `SubmitPriceModal` | A pre-ticked "Enter me" box. Name or alias plus a mobile or email are required only while it is ticked. Details are remembered on the phone. Optional "who told you" box. After sending: leaderboard and "tell a friend" buttons. |
| Standings | `public/leaderboard.json` | The app reads this file. Update it with the tool below and push. |
| Tools | `marketing-tools/update_leaderboard.js`, `draw_third_prize.js` | Build the standings from your checked receipts; draw 3rd prize. |
| Graphic | `November Price Hunt (square) DRAFT - needs Lottery OK.png` | Draft only. Script: `marketing-tools/make_comp_graphic.py`. |

**Preview before launch:** open the app with `?comp=preview` on the end of the address, for example `https://www.jerseybasket.je/?comp=preview`.
Only you see it that way; everyone else sees nothing until 1 November.

## Before 1 November: checklist

1. [ ] Ask the Channel Islands Lottery whether giving their tickets as a prize is fine and whether the ticket image / branding may be used. Until they answer, do not post the graphic.
2. [ ] Confirm legally that a free-entry prize competition is fine in Jersey (Jersey Gambling Commission). I could not verify the current rules.
3. [ ] Have the 15 tickets safely put away, unscratched. Note the numbers privately (do not publish them).
4. [ ] Read the rules text in `CompetitionModal` and the "Rules" wording in the posts. Change anything you disagree with (see "Assumptions" below).
5. [x] Done 25 Oct: test entry sent from the preview link; the email, Sheet row (columns F to J), Drive photo name and remembered details all worked. Still worth trying it once on your phone.
6. [x] Done 25 Oct: the Sheet shows the photo name and competition tag in columns I and J.
7. [ ] Decide who checks receipts (you, or you and Laura) and how often (suggest once a day).

## How entries arrive

The form uploads each photo to your Google Apps Script (the one that saves to Drive and the Sheet). Because that script is not in this project, I made the entry details travel in places it already records:
- The **photo file name** starts with `COMP-NOV26_` and, if given, `REF-<alias>_` (the "who told you" answer), then date, store and original name. Example: `COMP-NOV26_REF-Kate_2026-11-08_Waitrose_receipt.jpg`.
- **Name/alias, mobile and email** are sent as before.
- The form also sends `competition`, `referredBy`, `store` and `dateTaken`. **Checked 25 Oct:** your running Apps Script ignores these (its Sheet had only time, name, mobile, email and photo link). **Fixed on 25 Oct 2026:** the updated script (`apps-script/receipts.gs`) is deployed. The Sheet now records store, date taken, photo name, competition and referred-by in columns F to J, and the notification email lists them too. A test entry confirmed all of it.

## Daily routine (about 10 minutes)

1. Open the Drive folder or the Sheet. For each new `COMP-NOV26_` receipt, check it is dated 1 to 30 Nov, shows the store name and date, and has not been entered before.
2. Count the correct prices you accept from it. Add a row to your **entries.csv** (keep this file private, outside the repo is best):

```
alias,store,verified_prices,referred_by
Kate,Waitrose,10,
Leticia,Morrisons,6,Kate
```

   - `alias`: the name they typed. `store`: Waitrose, M&S, Morrisons, Co-op, Iceland or Alliance. `verified_prices`: how many you accepted. `referred_by`: their "who told you" alias, if any.
3. Rebuild the standings and publish:

```
node marketing-tools/update_leaderboard.js entries.csv --exclude "Carmen1971"
git add public/leaderboard.json
git commit -m "Update Price Hunt standings"
git push
```

   (`--exclude` lists anyone who must not win, such as your family. They are kept off the board and out of the draw.) The app shows the new standings within a few minutes of the push.
4. Add the accepted prices to the catalogue as usual.

**Scoring recap:** 1 point per correct price, 2 at Morrisons, Waitrose and M&S, plus 5 to the person named in "who told you" once per friend who has a checked receipt.

## After 30 November

1. Check the last receipts (anything sent by midnight on 30 Nov with a receipt dated in November counts).
2. Rebuild the standings one last time (step 3 above).
3. **1st and 2nd:** the top two on the board. If scores tie, decide the rule in advance and say so (suggest: earliest checked receipt wins).
4. **3rd:** run the random draw and film or screenshot it:

```
node marketing-tools/draw_third_prize.js entries.csv --exclude "Carmen1971"
```

5. Put the three winners into `public/leaderboard.json` under `"winners": { "first": "", "second": "", "third": "" }`, push, and the app shows a winners box.
6. Announce on **Tuesday 1 December 2026**. Contact the winners by their mobile or email, and arrange to hand over the tickets whole and unscratched, in person or by recorded delivery. Note which ticket numbers went to whom. The draw is on Thursday 17 December.
7. **Delete** the names, mobile numbers and emails afterwards. Keep only the winners' names if they agreed to be named.

## Turning it off early

Set `enabled: false` in `COMP` in `src/App.jsx` (or ask me), push, and everything disappears.

## Assumptions I made. Change any you disagree with

- Double points apply for the **whole month** (not only the first two weeks).
- 3rd prize is a **random draw among all entrants** with a checked receipt (1st and 2nd go to the highest scores).
- Open to **Jersey residents aged 18 or over**; the organiser's family cannot win.
- Receipts must be dated within November and show the store name and date.
- The store goal on each progress bar is **100 checked prices**; change `goal` in `public/leaderboard.json`.
- Winners are announced by you on Facebook and in the app; the winners box appears when you fill in `winners`.

## Not done / unknown

- The Lottery's permission and any legal check.
- The Apps Script itself (not in this project), so I could not change what it stores.
- No tie-break or appeals process beyond "JerseyBasket's decision is final".
- The posts (Facebook, Instagram, LinkedIn) and the final graphic are not written or approved yet.

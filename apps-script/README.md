# Receipt receiver (Google Apps Script)

> **WHICH SCRIPT IS LIVE (19 Nov 2026):** since 10 Nov the app posts to **"JerseyBasket Receipts"** in the
> **jerseybasket.receipts** Google account (deployment ID `AKfycbxc5KqEc5...`, matches `RECEIPT_WEBAPP_URL`).
> "JerseyBasketReceiptReceiver" in the personal account (`AKfycbwf8Jwd...`) is the OLD one and receives nothing.
> To update the live one: sign in to script.google.com as jerseybasket.receipts, open JerseyBasket Receipts,
> replace everything from `function doPost(e) {` to the end with the same part of `receipts.gs` (keeps its own
> folder / sheet / secret / email settings), save, then Deploy > Manage deployments > Edit > New version.
> The `-PRIVATE.gs` files hold the OLD script's values. Extensions > Apps Script on the sheet makes a NEW empty
> project, not this one. Version 3 (19 Nov 15:55): mobile check (column K), script lock, mobile kept as text.

The app (`RECEIPT_WEBAPP_URL` in `src/App.jsx`) posts each receipt photo to a Google Apps Script web app. The script saves the photo to a Drive folder, adds a row to a Google Sheet, and emails a notification.

| File | What it is | In git? |
|---|---|---|
| `receipts-original-PRIVATE.gs` | The script exactly as it was running on 25 Oct 2026 (real folder ID, sheet ID, shared secret, email) | **No** (ignored on purpose) |
| `receipts.gs` | The same script with placeholders, **plus** extra Sheet columns F to J (store, date taken, photo name, competition, referred by), richer notification email, and `addNewColumnHeaders()` | Yes |

## What the original script stored (important for the Price Hunt)
Sheet columns A to E only: time, name, mobile, email, photo link. It did **not** store the store, the date, the competition tag or "who told you". For competition entries those details were only in the **photo's file name** in Drive (for example `COMP-NOV26_REF-Kate_2026-11-08_Waitrose_receipt.jpg`).

## Status: DEPLOYED and tested on 25 Oct 2026
The steps below were carried out and the test entry worked. Keep them in case it ever needs redeploying.

## To start recording them in the Sheet (before 1 Nov)
1. Open the script (script.google.com, or the Sheet > Extensions > Apps Script). Keep a copy first: File > Make a copy.
2. Paste `receipts.gs` over the code, then put the four real values back from `receipts-original-PRIVATE.gs`.
3. Run `addNewColumnHeaders` once (it writes the new headers in F1:J1).
4. Deploy > Manage deployments > pencil (Edit) > Version: **New version** > Deploy. Keep the same deployment so the web address in the app does not change.
5. Send one test entry from the app (`?comp=preview`) and check the Sheet row and the email.

Deployment settings noted in the original comment: Execute as "Me", Access "Anyone" (confirm in Manage deployments).

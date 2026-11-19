// ============================================================
// JerseyBasket Receipt Receiver — Google Apps Script  (backup copy, placeholders instead of the real values)
// Saves receipt photos straight into a Drive folder, and logs
// each submission into a Sheet, then emails a notification.
// Deploy as a Web App: Execute as "Me", Access "Anyone"
//   (taken from the original script's own comment; confirm in Deploy > Manage deployments).
//
// CHANGES vs the original (25 Oct 2026), for the November Price Hunt:
//   * the Sheet now also records store, date taken, photo name, competition tag and "referred by"
//     in columns F to J, to the right of the original five (nothing existing moves);
//   * the notification email includes the same fields;
//   * addNewColumnHeaders() writes the five new header cells once.
// 18 Nov 2026: mobile check. Column K "Mobile check" flags an email / bad number / missing mobile on
//   entries (old app versions can still send them), the mobile cell turns orange and the email subject
//   starts with a warning sign. Receipts are never rejected. Run addMobileCheckHeader() once after deploying.
// 19 Nov 2026: a script lock around the sheet write, so photos sent together can't overwrite each
//   other's row (Mary's IMG_3109 was lost that way), and mobiles are written as text so the 0 stays.
// The real FOLDER_ID, SHEET_ID, secret and email are in receipts-original-PRIVATE.gs (not in git).
// To deploy: paste this over the script, put the four real values back at the top,
//   then Deploy > Manage deployments > Edit > Version: New version > Deploy.
// ============================================================

// ---- CONFIGURE THESE VALUES BEFORE DEPLOYING ----
const FOLDER_ID = 'PUT-DRIVE-FOLDER-ID-HERE';
const SHEET_ID  = 'PUT-SHEET-ID-HERE'; // leave as '' to skip the spreadsheet log
const SHARED_SECRET = 'PUT-SECRET-HERE';
const NOTIFY_EMAIL = 'PUT-EMAIL-HERE';
// ---------------------------------------------------------

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.secret !== SHARED_SECRET) {
      return jsonResponse({ ok: false, error: 'unauthorized' });
    }

    const folder = DriveApp.getFolderById(FOLDER_ID);

    let fileUrl = '';
    if (data.photoBase64 && data.photoName) {
      const bytes = Utilities.base64Decode(data.photoBase64);
      const blob = Utilities.newBlob(bytes, data.photoMimeType || 'image/jpeg', data.photoName);
      const file = folder.createFile(blob);
      fileUrl = file.getUrl();
    }

    // Mobile check (18 Nov 2026): phones running an old copy of the app can still send an email
    // in the mobile box. Never reject the receipt; flag it in column K, colour the cell, mark the email.
    const mobileFlag = mobileProblem(data.mobile, !!data.competition);

    if (SHEET_ID) {
      // 19 Nov 2026: the app sends every photo of a receipt at the same moment; without a lock two
      // appendRow calls can land on the same row and one is overwritten (its email still goes out).
      const lock = LockService.getScriptLock();
      lock.waitLock(30000);
      try {
      const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
      sheet.appendRow([
        new Date(),
        data.name || '',
        data.mobile ? "'" + data.mobile : '',   // leading apostrophe keeps the 0 (Sheets turns 0779... into a number)
        data.email || '',
        fileUrl || 'No photo attached',
        data.store || '',
        data.dateTaken || '',
        data.photoName || '',
        data.competition || '',
        data.referredBy || '',
        mobileFlag,
      ]);
      if (mobileFlag) sheet.getRange(sheet.getLastRow(), 3).setBackground('#fed7aa');
      SpreadsheetApp.flush();
      } finally {
        lock.releaseLock();
      }
    }

    // Notify by email the moment a new receipt comes in
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: `${mobileFlag ? '⚠ ' : ''}[JerseyBasket] New receipt from ${data.name || 'unknown'}${data.competition ? ' (Price Hunt entry)' : ''}`,
      body: `New receipt submission:\n\nName: ${data.name || ''}\nMobile: ${data.mobile || ''}${mobileFlag ? '  (' + mobileFlag + ')' : ''}\nEmail: ${data.email || ''}\nStore: ${data.store || ''}\nDate taken: ${data.dateTaken || ''}\nCompetition: ${data.competition || 'no'}\nWho told them: ${data.referredBy || ''}\nPhoto: ${fileUrl || 'No photo attached'}`,
    });

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

// '' when fine, otherwise a short warning. A real mobile is 11 digits starting 07, or +44 7... / 0044 7...
// Competition entries must have one; other submissions are only flagged if something odd was typed.
function mobileProblem(mobile, isEntry) {
  const m = String(mobile || '').trim();
  if (!m) return isEntry ? '⚠ no mobile' : '';
  const digits = m.replace(/\D/g, '');
  const ok = /^07\d{9}$/.test(digits) || /^447\d{9}$/.test(digits) || /^00447\d{9}$/.test(digits);
  if (ok) return '';
  return /@/.test(m) ? '⚠ email in mobile box' : '⚠ mobile not valid';
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Run once by hand: writes the headers for the five new columns (F to J) in row 1.
function addNewColumnHeaders() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
  sheet.getRange(1, 6, 1, 5).setValues([['Store', 'Date taken', 'Photo name', 'Competition', 'Referred by']]);
}

// Run once by hand after deploying the 18 Nov 2026 version: header for the new column K.
function addMobileCheckHeader() {
  SpreadsheetApp.openById(SHEET_ID).getActiveSheet().getRange(1, 11).setValue('Mobile check');
}

function testAuth() {
  MailApp.sendEmail(NOTIFY_EMAIL, 'Test', 'This is a test to trigger authorization.');
}

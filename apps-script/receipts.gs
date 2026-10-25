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

    if (SHEET_ID) {
      const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
      sheet.appendRow([
        new Date(),
        data.name || '',
        data.mobile || '',
        data.email || '',
        fileUrl || 'No photo attached',
        data.store || '',
        data.dateTaken || '',
        data.photoName || '',
        data.competition || '',
        data.referredBy || '',
      ]);
    }

    // Notify by email the moment a new receipt comes in
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: `[JerseyBasket] New receipt from ${data.name || 'unknown'}${data.competition ? ' (Price Hunt entry)' : ''}`,
      body: `New receipt submission:\n\nName: ${data.name || ''}\nMobile: ${data.mobile || ''}\nEmail: ${data.email || ''}\nStore: ${data.store || ''}\nDate taken: ${data.dateTaken || ''}\nCompetition: ${data.competition || 'no'}\nWho told them: ${data.referredBy || ''}\nPhoto: ${fileUrl || 'No photo attached'}`,
    });

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
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

function testAuth() {
  MailApp.sendEmail(NOTIFY_EMAIL, 'Test', 'This is a test to trigger authorization.');
}

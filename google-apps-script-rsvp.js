const SHEET_NAME = 'Ответы гостей';

function doGet() {
  return ContentService
    .createTextOutput('RSVP endpoint is working. Answers will be saved to Google Sheets.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const props = PropertiesService.getScriptProperties();
    const spreadsheetId = props.getProperty('SPREADSHEET_ID');

    if (!spreadsheetId) {
      return makeJson({ ok: false, error: 'SPREADSHEET_ID is missing' });
    }

    const data = e && e.parameter ? e.parameter : {};
    const name = clean(data.name || '');
    const answer = clean(data.answer || 'Ответ не выбран');
    const couple = clean(data.couple || 'Muhammadjon and Mehrona');
    const place = clean(data.place || 'Ресторан Стамбул, Москва');
    const eventDate = clean(data.eventDate || '26.06.2026');
    const eventTime = clean(data.eventTime || '18:00');
    const page = clean(data.page || '');
    const createdAt = Utilities.formatDate(new Date(), 'Europe/Moscow', 'dd.MM.yyyy HH:mm:ss');

    if (!name) {
      return makeJson({ ok: false, error: 'Guest name is empty' });
    }

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = getOrCreateSheet(spreadsheet);
    ensureHeader(sheet);

    const row = [name, answer, createdAt, couple, eventDate, eventTime, place, page];
    upsertGuest(sheet, row);
    sortGuests(sheet);

    return makeJson({ ok: true });
  } catch (error) {
    return makeJson({ ok: false, error: String(error) });
  }
}

function getOrCreateSheet(spreadsheet) {
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeader(sheet) {
  const headers = ['ФИО', 'Ответ', 'Дата ответа', 'Пара', 'Дата свадьбы', 'Время', 'Место', 'Страница'];
  const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const hasHeader = current.some(function (value) {
    return String(value).trim() !== '';
  });

  if (!hasHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.autoResizeColumns(1, headers.length);
  }
}

function upsertGuest(sheet, row) {
  const lastRow = sheet.getLastRow();
  const guestName = normalizeName(row[0]);

  if (lastRow > 1) {
    const names = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < names.length; i += 1) {
      if (normalizeName(names[i][0]) === guestName) {
        sheet.getRange(i + 2, 1, 1, row.length).setValues([row]);
        return;
      }
    }
  }

  sheet.appendRow(row);
}

function sortGuests(sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  if (lastRow <= 2) return;

  sheet
    .getRange(2, 1, lastRow - 1, lastColumn)
    .sort({ column: 1, ascending: true });

  sheet.autoResizeColumns(1, lastColumn);
}

function makeJson(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function clean(value) {
  return String(value).replace(/\s+/g, ' ').trim().slice(0, 500);
}

function normalizeName(value) {
  return clean(value).toLowerCase();
}

function doGet() {
  return ContentService
    .createTextOutput('RSVP endpoint is working')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('TELEGRAM_BOT_TOKEN');
  const chatId = props.getProperty('TELEGRAM_CHAT_ID');

  if (!token || !chatId) {
    return makeJson({ ok: false, error: 'Telegram token or chat id is missing' });
  }

  const data = e && e.parameter ? e.parameter : {};
  const name = clean(data.name || 'Без ФИО');
  const answer = clean(data.answer || 'Ответ не выбран');
  const couple = clean(data.couple || 'Muhammadjon and Mehrona');
  const place = clean(data.place || 'Ресторан Стамбул, Москва');
  const eventDate = clean(data.eventDate || '26.06.2026');
  const eventTime = clean(data.eventTime || '18:00');
  const createdAt = clean(data.createdAt || new Date().toLocaleString('ru-RU'));
  const page = clean(data.page || '');

  const text = [
    '💌 <b>Новый ответ на свадебное приглашение</b>',
    '',
    '<b>Гость:</b> ' + escapeHtml(name),
    '<b>Ответ:</b> ' + escapeHtml(answer),
    '<b>Свадьба:</b> ' + escapeHtml(couple),
    '<b>Дата:</b> ' + escapeHtml(eventDate) + ' в ' + escapeHtml(eventTime),
    '<b>Место:</b> ' + escapeHtml(place),
    '<b>Время ответа:</b> ' + escapeHtml(createdAt),
    page ? '<b>Страница:</b> ' + escapeHtml(page) : ''
  ].filter(Boolean).join('\n');

  const response = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    payload: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })
  });

  return makeJson({
    ok: response.getResponseCode() >= 200 && response.getResponseCode() < 300
  });
}

function makeJson(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function clean(value) {
  return String(value).trim().slice(0, 500);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (char) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return map[char];
  });
}

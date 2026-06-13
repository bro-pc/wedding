# Свадебная открытка - Muhammadjon & Mehrona

Готовая онлайн-открытка для GitHub Pages.

## Что внутри

- красивый первый экран с плавным открытием;
- музыка после клика;
- основной экран приглашения;
- дата, время и место;
- таймер до свадьбы;
- карта ресторана;
- форма подтверждения присутствия;
- отправка ФИО и ответа гостя в Telegram организатору;
- адаптация под телефон;
- файл календаря `wedding.ics`.

## Как добавить фото

Положи рядом с `index.html` файл с названием:

```text
photo.jpg
```

Он автоматически станет фоном главного экрана. Если фото не добавить, будет красивый градиентный фон.

## Как добавить свою музыку

Положи рядом с `index.html` файл:

```text
music.mp3
```

Если файла нет, открытка использует лёгкую встроенную мелодию через браузер.

## Как подключить отправку ответов в Telegram

GitHub Pages хранит только статические файлы, поэтому токен Telegram-бота нельзя вставлять прямо в `script.js`. Для отправки ответов используется отдельный маленький backend на Google Apps Script.

### 1. Создай Telegram-бота

1. Открой Telegram.
2. Найди `@BotFather`.
3. Отправь команду `/newbot`.
4. Создай бота и скопируй токен.
5. Открой своего бота и нажми `Start`, чтобы бот мог отправлять тебе сообщения.

### 2. Узнай свой Telegram chat_id

После того как ты нажал `Start` в своём боте, открой в браузере ссылку:

```text
https://api.telegram.org/botТВОЙ_ТОКЕН/getUpdates
```

В ответе найди:

```json
"chat":{"id":123456789
```

Число `123456789` - это твой `TELEGRAM_CHAT_ID`.

### 3. Создай backend в Google Apps Script

1. Открой `https://script.google.com/`.
2. Создай новый проект.
3. Удали весь код из файла `Code.gs`.
4. Скопируй туда код из файла `google-apps-script-rsvp.js`.
5. Открой `Project Settings`.
6. В блоке `Script Properties` добавь две переменные:

```text
TELEGRAM_BOT_TOKEN = токен от BotFather
TELEGRAM_CHAT_ID = твой chat_id
```

### 4. Опубликуй Google Apps Script как Web App

1. Нажми `Deploy` -> `New deployment`.
2. Тип выбери `Web app`.
3. Execute as: `Me`.
4. Who has access: `Anyone`.
5. Нажми `Deploy`.
6. Скопируй ссылку Web app. Она будет похожа на:

```text
https://script.google.com/macros/s/XXXXXXXXXXXX/exec
```

### 5. Вставь ссылку в сайт

Открой `script.js` и найди в начале:

```js
rsvpEndpoint: '',
```

Вставь ссылку Google Apps Script:

```js
rsvpEndpoint: 'https://script.google.com/macros/s/XXXXXXXXXXXX/exec',
```

После этого каждый гость сможет написать ФИО, выбрать `Я приду` или `Не смогу`, нажать `Отправить ответ`, и тебе придёт сообщение в Telegram.

## Как выложить на GitHub Pages

1. Создай новый репозиторий на GitHub, например `wedding`.
2. Загрузи туда все файлы из этой папки.
3. Открой `Settings` -> `Pages`.
4. В `Build and deployment` выбери:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Нажми `Save`.
6. Ссылка будет примерно такая:

```text
https://твой-логин.github.io/wedding/
```

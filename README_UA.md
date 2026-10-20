# 🎧 SonicRange Pro — Інструкція з розгортання (Web, PWA, macOS та Windows)

Ця папка містить одразу **всі 3 формати** додатка для студентів-звукорежисерів та студійних комп'ютерів.

---

## 📦 Варіант 1. Портативний однофайловий додаток (для флешки, Telegram або студії без інтернету)

- **Файл:** [`SonicRange_Studio_Portable.html`](./SonicRange_Studio_Portable.html) (74 КБ — містить увесь код, стилі та аудіорушій в одному файлі).
- **Як користуватися:**
  - Перешліть цей один файл студентам у Telegram / Moodle або скопіюйте на студійні комп'ютери (macOS чи Windows).
  - Відкривається подвійним кліком у будь-якому браузері без інтернету та без прав адміністратора.
- **Запуск в окремому вікні програми (без вкладок браузера):**
  - На **macOS**: двічі клікніть на програму **`SonicRange Pro.app`** (її можна перетягнути у папку `/Applications` або на панель Dock) чи скрипт [`Start_SonicRange_Mac.command`](./Start_SonicRange_Mac.command).
  - На **Windows**: двічі клікніть на [`Start_SonicRange_Windows.bat`](./Start_SonicRange_Windows.bat).

---

## 🌐 Варіант 2. Розміщення в Інтернеті + Встановлення як PWA (macOS, Windows, iOS, Android)

Усі веб-файли (`index.html`, `styles.css`, `app.js`, `manifest.json`, `sw.js`, `icon.svg`) вже налаштовані як **Progressive Web App (PWA)** з офлайн-кешуванням.

### Спосіб А — Публікація за 30 секунд через Netlify Drop:
1. Відкрийте у браузері [https://app.netlify.com/drop](https://app.netlify.com/drop).
2. Перетягніть туди готовий архів **`SonicRange_Web_Deploy.zip`** (або саму папку проєкту).
3. Ви миттєво отримаєте публічне посилання вигляду `https://...netlify.app`, яке можна дати студентам.
4. Коли студент відкриє посилання у Chrome або Edge на Mac/Windows/Android, у верхній панелі додатка з'явиться кнопка **«📲 ВСТАНОВИТИ ДОДАТОК»** — після кліку програма встановиться на робочий стіл і працюватиме навіть без інтернету.

### Спосіб Б — Публікація на GitHub Pages:
1. Завантажте файли `index.html`, `styles.css`, `app.js`, `manifest.json`, `sw.js`, `icon.svg` у репозиторій GitHub.
2. Увімкніть **Settings → Pages → Deploy from branch (`main`)**.

---

## 🖥️ Варіант 3. Збірка окремих інсталяторів `.dmg` (macOS) та `.exe` (Windows) через Electron

У проєкті вже створені файли [`package.json`](./package.json) та [`electron-main.js`](./electron-main.js). Якщо ви захочете зібрати автономні бінарні інсталятори (потрібен встановлений [Node.js](https://nodejs.org/)):

```bash
# 1. Встановити залежності Electron
npm install

# 2. Запустити у режимі нативного десктопного вікна
npm start

# 3. Зібрати інсталятор .dmg для macOS
npm run dist:mac

# 4. Зібрати портативний .exe та інсталятор для Windows
npm run dist:win
```
Готові інсталятори з'являться у папці `dist/`.

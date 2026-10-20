# 🎧 SonicRange Pro — Studio Hearing Range, Audiogram & Ear Training Lab

[![Live Web App](https://img.shields.io/badge/🌐_Live_Web_App-mozhenko.github.io-00d4ff?style=for-the-badge)](https://mozhenko.github.io/sonic-range-analyzer/)
[![Portable HTML](https://img.shields.io/badge/📦_Portable_HTML-Download-18e299?style=for-the-badge)](https://mozhenko.github.io/sonic-range-analyzer/SonicRange_Studio_Portable.html)
[![macOS & Windows Pack](https://img.shields.io/badge/💻_macOS_%26_Windows_ZIP-Download-ffaa00?style=for-the-badge)](https://github.com/mozhenko/sonic-range-analyzer/raw/main/SonicRange_Portable_Mac_Win.zip)

**[🇺🇦 Українська версія нижче](#-українська-версія--опис-та-інструкція) | [🇬🇧 English Version Below](#-english-version--documentation--guide)**

---

## 🇺🇦 Українська версія — Опис та інструкція

**SonicRange Pro** — це професійний навчально-практичний додаток для звукорежисерів та студентів аудіоінженерії, розроблений на базі **Web Audio API**. Додаток підтримує **українську (🇺🇦 UA)** та **англійську (🇬🇧 EN)** мови інтерфейсу (перемикач у верхній панелі).

### Основні можливості:
1. **〰️ Вимірювання діапазону чутності (15 Hz – 22 000 Hz):**
   - Плавний логарифмічний генератор та автоматичні свіпи НЧ (`120 Hz → 15 Hz`) і ВЧ (`8 kHz → 22 kHz`).
   - Три типи сигналу: **Pure Sine** (чистий синус), **Warble Tone** (частотно-модульований тон FM ±4.5% для уникнення стоячих хвиль у кімнаті), **Pulsed Sine** (пульсуючий тон для точного визначення порогу).
   - Окремий тест **Лівого (L)**, **Правого (R)** та **Стерео (L+R)** каналів із розрахунком діапазону в октавах, музичної ноти та довжини хвилі при $20^\circ\text{C}$.
2. **📊 Студійна Аудіограма (15 смуг EQ):**
   - Покрокове визначення порогу чутності в `dBFS` для Лівого та Правого вуха на стандартних частотах еквалайзера (`20 Hz` – `20 kHz`) із побудовою кривої АЧХ слуху відносно еталона ISO.
3. **🎓 Тренажер-Вікторина «Вгадай частоту» для студентів:**
   - Сліпий режим (спектроаналізатор і табло частоти приховані до моменту відповіді).
   - 3 рівні складності (*Початковий*, *Середній*, *Експерт із плавним повзунком*), кнопка **«🔔 Еталон 1 kHz»** для калібрування слуху, оцінювання за 1000-бальною шкалою (10 раундів) та журнал відповідей.
4. **🎚️ Аналітичний звіт звукорежисера:**
   - Персональні рекомендації щодо еквалізації (`Sub-Bass`, `Presence`, `Brilliance / Air`), діагностика L/R асиметрії та експорт у **PDF / JSON**.

---

### 🚀 Як користуватися додатком (Усі платформи)

#### 1. 🌐 Онлайн у браузері (без встановлення)
Перейдіть за посиланням: **[https://mozhenko.github.io/sonic-range-analyzer/](https://mozhenko.github.io/sonic-range-analyzer/)**

#### 2. 💻 Завантаження для macOS та Windows (офлайн для студії)
- **Універсальний портативний пакет (macOS `.app` + Windows `.bat` + Portable HTML):**
  👉 **[Завантажити SonicRange_Portable_Mac_Win.zip](https://github.com/mozhenko/sonic-range-analyzer/raw/main/SonicRange_Portable_Mac_Win.zip)**
- **Автономний однофайловий додаток (75 КБ, працює з флешки без інтернету):**
  👉 **[Відкрити / Зберегти SonicRange_Studio_Portable.html](https://mozhenko.github.io/sonic-range-analyzer/SonicRange_Studio_Portable.html)**
- **Окремі інсталятори `.dmg` (macOS) та `.exe` (Windows):**
  👉 Доступні у розділі **[GitHub Releases](https://github.com/mozhenko/sonic-range-analyzer/releases/latest)**

#### 3. 📱 Встановлення на iPhone, iPad та Android
Додаток підтримує технологію **PWA (Progressive Web App)** і встановлюється як рідна мобільна програма без App Store чи Google Play:
- **На iPhone та iPad (Safari):**
  1. Відкрийте [https://mozhenko.github.io/sonic-range-analyzer/](https://mozhenko.github.io/sonic-range-analyzer/) у браузері **Safari**.
  2. Натисніть кнопку **«Поділитися» (Share)** (квадрат зі стрілкою вгору).
  3. Оберіть **«На Початковий екран» (Add to Home Screen)** → **Додати**.
  4. На екрані iPhone/iPad з’явиться іконка **SonicRange Pro**, яка запускається на весь екран і працює офлайн!
- **На Android (Chrome):**
  1. Відкрийте посилання у **Chrome**.
  2. Натисніть кнопку **«📲 ВСТАНОВИТИ ДОДАТОК»** у верхній панелі програми (або меню `⋮` → **Встановити додаток**).

#### ⌨️ Гарячі клавіші у студії:
- `Space` — Увімкнути / Зупинити тон-генератор (або загаданий тон у вікторині)
- `L` — Зафіксувати нижню межу чутності (НЧ)
- `H` — Зафіксувати верхню межу чутності (ВЧ)
- `Esc` — Миттєве вимкнення звуку (`PANIC MUTE`)

---
---

## 🇬🇧 English Version — Documentation & Guide

**SonicRange Pro** is a studio-grade web & desktop application designed for **sound engineers, mixing/mastering engineers, and audio production students** to measure human hearing frequency range, plot Left/Right ear sensitivity audiograms, and practice blind frequency recognition.

Interface languages: **🇺🇦 Ukrainian (UA)** & **🇬🇧 English (EN)** (toggle in the top header).

### Key Features:
1. **〰️ Precision Frequency Range & Sweep Analyzer (15 Hz – 22,000 Hz):**
   - Continuous logarithmic frequency control with fine `±1 Hz / ±10 Hz / ±100 Hz` steps and automated LF (`120 Hz → 15 Hz`) and HF (`8 kHz → 22 kHz`) sweeps.
   - Three signal modes: **Pure Sine**, **Warble Tone** (FM ±4.5% to eliminate room standing waves when testing on studio monitors), and **Pulsed Sine** (for accurate threshold perception).
   - Independent **Left (L)**, **Right (R)**, and **Stereo (L+R)** channel testing with real-time musical note/cent readout and acoustic wavelength calculation at $20^\circ\text{C}$.
2. **📊 Studio Audiogram (15 ISO / EQ Bands):**
   - Step-by-step hearing threshold measurement in `dBFS` across 15 standard frequencies (`20 Hz` to `20 kHz`) for Left and Right ears, plotted against an ISO reference curve.
3. **🎓 Blind Ear Training Quiz ("Guess the Frequency"):**
   - True blind test mode (masks the frequency readout and spectrum analyzer until the student submits an answer).
   - 3 difficulty levels (*Beginner Octave Bands*, *Intermediate 15 EQ Bands*, *Expert Continuous Slider*), a **1 kHz Reference Tone** button, octave-error calculation, streak counter, and a 10-round student grading log.
4. **🎚️ Sound Engineer Analytical Report:**
   - Tailored mixing & mastering advice based on measured thresholds, L/R ear symmetry check, ISO 7029 age reference table, and **JSON / PDF** report export.

---

### 🚀 How to Use & Install

#### 1. 🌐 Run Online in Browser
Open **[https://mozhenko.github.io/sonic-range-analyzer/](https://mozhenko.github.io/sonic-range-analyzer/)**

#### 2. 💻 Desktop Downloads for macOS & Windows (Offline Studio Use)
- **Portable macOS & Windows Bundle (`.app` + `.bat` + Single-File HTML):**
  👉 **[Download SonicRange_Portable_Mac_Win.zip](https://github.com/mozhenko/sonic-range-analyzer/raw/main/SonicRange_Portable_Mac_Win.zip)**
- **Single-File Self-Contained HTML (75 KB, runs offline from any USB drive):**
  👉 **[Open / Save SonicRange_Studio_Portable.html](https://mozhenko.github.io/sonic-range-analyzer/SonicRange_Studio_Portable.html)**
- **Native `.dmg` (macOS) and `.exe` (Windows) Installers:**
  👉 Available under **[GitHub Releases](https://github.com/mozhenko/sonic-range-analyzer/releases/latest)**

#### 3. 📱 Install on iPhone, iPad & Android
- **iPhone & iPad (Safari):** Open [https://mozhenko.github.io/sonic-range-analyzer/](https://mozhenko.github.io/sonic-range-analyzer/) in Safari → tap **Share** → **Add to Home Screen**. Runs full-screen and works 100% offline.
- **Android (Chrome):** Open the link in Chrome and tap **📲 INSTALL APP** in the top bar.

#### 🛠️ Building Native Desktop Installers from Source (Electron)
```bash
git clone https://github.com/mozhenko/sonic-range-analyzer.git
cd sonic-range-analyzer
npm install
npm start          # Launch native desktop window
npm run dist:mac   # Build macOS .dmg & .zip in dist/
npm run dist:win   # Build Windows .exe in dist/
```

---
**Author / Repository:** [@mozhenko](https://github.com/mozhenko) — [https://github.com/mozhenko/sonic-range-analyzer](https://github.com/mozhenko/sonic-range-analyzer)

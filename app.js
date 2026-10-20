/**
 * SonicRange Pro — Studio Hearing Frequency Range, Audiogram & Ear Training Quiz
 * Bilingual Edition (Українська / English)
 * Repository: https://github.com/mozhenko/sonic-range-analyzer
 */

const MIN_FREQ = 15;
const MAX_FREQ = 22000;
const SPEED_OF_SOUND = 343; // m/s at 20°C

const AUDIOGRAM_FREQS = [
  20, 31.5, 63, 125, 250, 500, 1000, 2000, 4000, 6000, 8000, 10000, 12500, 16000, 20000
];

const ISO_REF_CURVE = {
  20: -18,
  31.5: -28,
  63: -40,
  125: -50,
  250: -58,
  500: -64,
  1000: -68,
  2000: -70,
  4000: -72,
  6000: -66,
  8000: -62,
  10000: -58,
  12500: -52,
  16000: -40,
  20000: -22
};

const QUIZ_POOLS = {
  beginner: [63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000],
  intermediate: [31.5, 63, 100, 160, 250, 400, 630, 1000, 1600, 2500, 4000, 6300, 10000, 12500, 16000]
};

// Bilingual Localization Dictionary (UA / EN)
const I18N = {
  uk: {
    pageTitle: 'SonicRange Pro — Аудіометрія та тест слуху для звукорежисерів',
    appSubtitle: 'Лабораторія вимірювання частотного діапазону та АЧХ слуху звукорежисера',
    installAppBtn: '📲 ВСТАНОВИТИ ДОДАТОК',
    masterLevelLabel: 'MASTER LEVEL:',
    panicMuteBtn: '⏹ PANIC MUTE (ESC)',
    tabSweep: '1. Діапазон частот (Sweep)',
    tabAudiogram: '2. Студійна Аудіограма (L/R)',
    tabQuiz: '3. Вікторина: Вгадай частоту',
    tabReport: '4. Профіль & Звіт',
    lblFreq: 'ЧАСТОТА',
    lblNote: 'НОТА / ОКТАВА',
    lblMixBand: 'ДІАПАЗОН МІКСУ',
    lblWavelength: 'ДОВЖИНА ХВИЛІ (20°C)',
    lblMonitorChan: 'КАНАЛ МОНІТОРИНГУ:',
    earLeftBtn: '🎧 L (Лівий)',
    earBothBtn: '🎧 L+R (Стерео)',
    earRightBtn: '🎧 R (Правий)',
    sweepModuleTitle: '🎛️ Генератор та Логарифмічний Свіп',
    sweepBadge: 'Чистий синус / Warble',
    freqSliderLabel: 'Плавне регулювання частоти (15 Hz — 22 000 Hz)',
    lblSignalType: 'Тип тестового сигналу',
    optSine: 'Pure Sine (Чистий синус — стандарт)',
    optWarble: 'Warble Tone (FM ±5% — для моніторів у кімнаті)',
    optPulsed: 'Pulsed Sine (Пульсуючий 2.5 Гц — легше помітити поріг)',
    optSineShort: 'Чистий синус (Pure Sine)',
    optPulsedShort: 'Пульсуючий тон (Pulsed Sine)',
    optWarbleShort: 'Warble Tone (Частотно-модульований)',
    lblSweepSpeed: 'Швидкість авто-свіпу',
    speedSlow: 'Повільна (Точний вимір — 35 сек)',
    speedMed: 'Середня (Стандартна — 20 сек)',
    speedFast: 'Швидка (Оглядова — 10 сек)',
    btnGenStart: '▶ УВІМКНУТИ ТОН-ГЕНЕРАТОР',
    btnGenStop: '⏸ ВИМКНУТИ ТОН-ГЕНЕРАТОР',
    btnSweepStop: '⏸ ЗУПИНИТИ АВТО-СВІП',
    btnLowSweep: '📉 Тест НЧ (120 Hz → 15 Hz)',
    btnHighSweep: '📈 Тест ВЧ (8 kHz → 22 kHz)',
    btnFullSweep: '🔄 Повний свіп (20 Hz → 22 kHz)',
    captureHint: '💡 <strong>Як фіксувати межі:</strong> Під час свіпу або ручного руху повзунка натисніть кнопку нижче (або клавіші <kbd>L</kbd> / <kbd>H</kbd> / <kbd>Space</kbd>), щойно звук з’явиться чи зникне.',
    btnMarkLow: '📍 Зафіксувати НИЖНЮ межу (НЧ) [L]',
    btnMarkHigh: '📍 Зафіксувати ВЕРХНЮ межу (ВЧ) [H]',
    limitsModuleTitle: '🎯 Зафіксований діапазон чутності',
    btnResetLimits: 'Скинути заміри',
    cardStereoTitle: '🎧 СТЕРЕО (L+R)',
    cardLeftTitle: '◀ ЛІВЕ ВУХО (L)',
    cardRightTitle: '▶ ПРАВЕ ВУХО (R)',
    lblLowLim: 'Нижній поріг (Sub)',
    lblHighLim: 'Верхній поріг (Air)',
    lblBandwidth: 'Смуга пропускання',
    octavesUnit: 'октав',
    lblQuickPresets: 'Швидка перевірка контрольних частот:',
    agModuleTitle: '📊 Побудова АЧХ чутливості слуху (Ліве та Праве вухо)',
    btnLoadDemo: 'Завантажити приклад',
    btnClearGraph: 'Очистити графік',
    agModuleDesc: 'Для звукорежисера важливо знати не лише крайні межі (Гц), а й <strong>рівномірність чутності між Лівим і Правим вухом</strong> у ключових смугах еквалайзера. Оберіть частоту, плавно піднімайте рівень з <code>-75 dBFS</code> до моменту, коли ледь почуєте пульсуючий тон, і натисніть <strong>«Записати поріг»</strong>.',
    agStepTitle: '🎚️ Покроковий вимір порогу',
    agStepBadgePrefix: 'Частота',
    lblActiveFreq: 'АКТИВНА ЧАСТОТА',
    lblChannel: 'КАНАЛ',
    lblTestLevel: 'РІВЕНЬ ТЕСТУ',
    earLeftName: '◀ Ліве вухо (L)',
    earRightName: '▶ Праве вухо (R)',
    btnMeasureL: 'Вимірювати Ліве вухо (L)',
    btnMeasureR: 'Вимірювати Праве вухо (R)',
    lblRaiseLevel: 'Рівень тестового тону (піднімайте до ледь чутного звуку):',
    btnAgPlay: '▶ Прослухати пульс-тон',
    btnAgStop: '⏸ Зупинити пульс-тон',
    btnRecordThreshold: '✅ Записати поріг та далі →',
    agLegendL: '● Ліве вухо (L)',
    agLegendR: '● Праве вухо (R)',
    agLegendIso: '--- Еталон ISO',
    quizModuleTitle: '🎓 Тренажер-Вікторина: Вгадай частоту на слух',
    quizRoundPrefix: 'Раунд',
    lblQuizDiff: 'Рівень складності',
    diffBeg: 'Початковий (9 октавних частот ISO: 63 Hz – 16 kHz)',
    diffInt: 'Середній (15 студійних смуг EQ: 31.5 Hz – 16 kHz)',
    diffPro: 'Експерт (Довільна частота + точний пошук повзунком)',
    lblMysteryFreq: 'ЗАГАДАНА ЧАСТОТА',
    quizHintWaiting: 'Слухайте тон (та за потреби еталон 1 kHz) і оберіть частоту нижче',
    btnQuizPlay: '🔊 СЛУХАТИ ЗАГАДАНИЙ ТОН',
    btnQuizStop: '⏸ ЗУПИНИТИ ЗАГАДАНИЙ ТОН',
    btnRefPlay: '🔔 Еталон 1 kHz (Референс)',
    btnRefStop: '⏸ Вимкнути Еталон 1 kHz',
    btnNextQuestion: '⏭ Наступне питання →',
    lblPickFreq: 'Оберіть частоту, яка зараз звучить:',
    lblYourGuess: 'Ваша відповідь на шкалі:',
    btnSubmitGuess: '✅ Підтвердити відповідь',
    quizInitialBanner: 'Оберіть рівень складності та натисніть <strong>«Слухати загаданий тон»</strong>, щоб розпочати тренування слуху.',
    quizScoreTitle: '🏆 Результати студента та статистика',
    btnNewQuizSeries: '🔄 Нова серія (10 питань)',
    lblScore: 'Рахунок (Бали)',
    lblStreak: 'Серія (Streak)',
    lblAccuracy: 'Середня точність',
    lblGrade: 'Оцінка',
    lblHistoryTitle: 'Журнал відповідей поточної серії:',
    thTarget: 'Загадано',
    thAnswer: 'Відповідь',
    thError: 'Похибка',
    thPoints: 'Бали',
    noAnswersYet: 'Ще немає відповідей у цій серії',
    blindNoteMask: '🔒 Сліпий тест',
    blindBandMask: '🔒 Вгадайте частоту',
    blindCanvasText: '🎓 СЛІПИЙ РЕЖИМ ВІКТОРИНИ — СПЕКТРОАНАЛІЗАТОР ПРИХОВАНО ДО ВАШОЇ ВІДПОВІДІ',
    reportModuleTitle: '🎚️ Аналітичний звіт для звукорежисера',
    btnExportJson: '💾 Експорт JSON-профілю',
    btnPrintReport: '🖨️ Друк / PDF Звіт',
    reportAdviceHeading: '🔍 Вплив вашого діапазону на зведення та мастеринг',
    reportSymmetryHeading: '⚖️ Аналіз L/R симетрії та вікові норми ISO 7029',
    thAgeCat: 'Категорія / Досвід',
    thTypHigh: 'Типовий верхній поріг ВЧ',
    thMonNotes: 'Особливості моніторингу'
  },
  en: {
    pageTitle: 'SonicRange Pro — Hearing Range & Audiogram Analyzer for Sound Engineers',
    appSubtitle: 'Studio Hearing Frequency Range, L/R Audiometry & Ear Training Lab',
    installAppBtn: '📲 INSTALL APP',
    masterLevelLabel: 'MASTER LEVEL:',
    panicMuteBtn: '⏹ PANIC MUTE (ESC)',
    tabSweep: '1. Frequency Range (Sweep)',
    tabAudiogram: '2. Studio Audiogram (L/R)',
    tabQuiz: '3. Ear Training Quiz',
    tabReport: '4. Engineer Profile & Report',
    lblFreq: 'FREQUENCY',
    lblNote: 'NOTE / OCTAVE',
    lblMixBand: 'MIXING BAND',
    lblWavelength: 'WAVELENGTH (20°C)',
    lblMonitorChan: 'MONITOR CHANNEL:',
    earLeftBtn: '🎧 L (Left)',
    earBothBtn: '🎧 L+R (Stereo)',
    earRightBtn: '🎧 R (Right)',
    sweepModuleTitle: '🎛️ Tone Generator & Logarithmic Sweep',
    sweepBadge: 'Pure Sine / Warble',
    freqSliderLabel: 'Continuous Logarithmic Frequency Control (15 Hz — 22,000 Hz)',
    lblSignalType: 'Test Signal Type',
    optSine: 'Pure Sine (Standard Reference)',
    optWarble: 'Warble Tone (FM ±5% — prevents room standing waves)',
    optPulsed: 'Pulsed Sine (2.5 Hz Gate — easier threshold detection)',
    optSineShort: 'Pure Sine',
    optPulsedShort: 'Pulsed Sine',
    optWarbleShort: 'Warble Tone (FM Modulated)',
    lblSweepSpeed: 'Auto-Sweep Speed',
    speedSlow: 'Slow (High Precision — 35 sec)',
    speedMed: 'Medium (Standard — 20 sec)',
    speedFast: 'Fast (Quick Check — 10 sec)',
    btnGenStart: '▶ START TONE GENERATOR',
    btnGenStop: '⏸ STOP TONE GENERATOR',
    btnSweepStop: '⏸ STOP AUTO-SWEEP',
    btnLowSweep: '📉 Sub/LF Sweep (120 Hz → 15 Hz)',
    btnHighSweep: '📈 HF/Air Sweep (8 kHz → 22 kHz)',
    btnFullSweep: '🔄 Full Sweep (20 Hz → 22 kHz)',
    captureHint: '💡 <strong>How to mark limits:</strong> During a sweep or manual slider movement, click a button below (or press <kbd>L</kbd> / <kbd>H</kbd> / <kbd>Space</kbd>) the moment the tone appears or disappears.',
    btnMarkLow: '📍 Mark LOWER Limit (LF) [L]',
    btnMarkHigh: '📍 Mark UPPER Limit (HF) [H]',
    limitsModuleTitle: '🎯 Recorded Hearing Range',
    btnResetLimits: 'Reset Measurements',
    cardStereoTitle: '🎧 STEREO (L+R)',
    cardLeftTitle: '◀ LEFT EAR (L)',
    cardRightTitle: '▶ RIGHT EAR (R)',
    lblLowLim: 'Lower Limit (Sub)',
    lblHighLim: 'Upper Limit (Air)',
    lblBandwidth: 'Audible Bandwidth',
    octavesUnit: 'octaves',
    lblQuickPresets: 'Quick Reference Frequencies:',
    agModuleTitle: '📊 Hearing Sensitivity Audiogram (Left vs Right Ear)',
    btnLoadDemo: 'Load Demo Data',
    btnClearGraph: 'Clear Graph',
    agModuleDesc: 'For a sound engineer, knowing the <strong>balance between Left and Right ears</strong> across key EQ bands is essential. Select a frequency, slowly raise the level from <code>-75 dBFS</code> until the pulsed tone is barely audible, and click <strong>"Record Threshold"</strong>.',
    agStepTitle: '🎚️ Step-by-Step Threshold Test',
    agStepBadgePrefix: 'Band',
    lblActiveFreq: 'ACTIVE FREQUENCY',
    lblChannel: 'CHANNEL',
    lblTestLevel: 'TEST LEVEL',
    earLeftName: '◀ Left Ear (L)',
    earRightName: '▶ Right Ear (R)',
    btnMeasureL: 'Measure Left Ear (L)',
    btnMeasureR: 'Measure Right Ear (R)',
    lblRaiseLevel: 'Test tone level (raise until barely audible):',
    btnAgPlay: '▶ Play Pulsed Tone',
    btnAgStop: '⏸ Stop Pulsed Tone',
    btnRecordThreshold: '✅ Record Threshold & Next →',
    agLegendL: '● Left Ear (L)',
    agLegendR: '● Right Ear (R)',
    agLegendIso: '--- ISO Reference',
    quizModuleTitle: '🎓 Ear Training Quiz: Guess the Frequency',
    quizRoundPrefix: 'Round',
    lblQuizDiff: 'Difficulty Level',
    diffBeg: 'Beginner (9 ISO Octave Bands: 63 Hz – 16 kHz)',
    diffInt: 'Intermediate (15 Studio EQ Bands: 31.5 Hz – 16 kHz)',
    diffPro: 'Expert (Random Frequency + Continuous Slider)',
    lblMysteryFreq: 'MYSTERY FREQUENCY',
    quizHintWaiting: 'Listen to the mystery tone (and 1 kHz reference if needed) and pick your answer below',
    btnQuizPlay: '🔊 PLAY MYSTERY TONE',
    btnQuizStop: '⏸ STOP MYSTERY TONE',
    btnRefPlay: '🔔 1 kHz Reference Tone',
    btnRefStop: '⏸ Stop 1 kHz Reference',
    btnNextQuestion: '⏭ Next Question →',
    lblPickFreq: 'Select the frequency currently playing:',
    lblYourGuess: 'Your frequency guess:',
    btnSubmitGuess: '✅ Submit Guess',
    quizInitialBanner: 'Choose a difficulty level and click <strong>"Play Mystery Tone"</strong> to start your ear training session.',
    quizScoreTitle: '🏆 Student Scoreboard & Statistics',
    btnNewQuizSeries: '🔄 New Series (10 Rounds)',
    lblScore: 'Total Score',
    lblStreak: 'Hot Streak',
    lblAccuracy: 'Avg Accuracy',
    lblGrade: 'Engineer Grade',
    lblHistoryTitle: 'Current Session Attempt Log:',
    thTarget: 'Target',
    thAnswer: 'Your Guess',
    thError: 'Error (Oct)',
    thPoints: 'Points',
    noAnswersYet: 'No attempts recorded in this series yet',
    blindNoteMask: '🔒 Blind Test',
    blindBandMask: '🔒 Guess the Band',
    blindCanvasText: '🎓 BLIND QUIZ MODE ACTIVE — SPECTRUM ANALYZER HIDDEN UNTIL YOU ANSWER',
    reportModuleTitle: '🎚️ Sound Engineer Analytical Report',
    btnExportJson: '💾 Export JSON Profile',
    btnPrintReport: '🖨️ Print / Save PDF',
    reportAdviceHeading: '🔍 Mixing & Mastering Implications',
    reportSymmetryHeading: '⚖️ L/R Symmetry & ISO 7029 Age Reference',
    thAgeCat: 'Category / Experience',
    thTypHigh: 'Typical Upper HF Limit',
    thMonNotes: 'Monitoring Considerations'
  }
};

const state = {
  lang: 'uk',
  audioCtx: null,
  osc: null,
  lfoOsc: null,
  lfoGain: null,
  pulseGain: null,
  toneGain: null,
  panner: null,
  masterGain: null,
  analyser: null,

  activeTab: 'sweep',
  isPlaying: false,
  isSweeping: false,
  sweepRafId: null,
  pulseIntervalId: null,

  currentFreq: 1000,
  masterDb: -18,
  currentEar: 'both',
  toneMode: 'sine',

  limits: {
    both: { low: null, high: null },
    L: { low: null, high: null },
    R: { low: null, high: null }
  },

  audiogram: {
    activeFreqIndex: 6,
    activeEar: 'L',
    currentDb: -50,
    isPlayingAg: false,
    points: {
      L: {},
      R: {}
    }
  },

  quiz: {
    difficulty: 'intermediate',
    timbre: 'sine',
    round: 1,
    maxRounds: 10,
    secretFreq: 1000,
    sliderGuessFreq: 1000,
    revealed: false,
    isPlayingMystery: false,
    isPlayingRef: false,
    score: 0,
    streak: 0,
    history: []
  }
};

function t(key) {
  return (I18N[state.lang] && I18N[state.lang][key]) || I18N.uk[key] || key;
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem('sonicrange_pro_state_v1');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed.lang && (parsed.lang === 'uk' || parsed.lang === 'en')) {
      state.lang = parsed.lang;
    }
    if (parsed.limits) state.limits = parsed.limits;
    if (parsed.audiogramPoints) state.audiogram.points = parsed.audiogramPoints;
  } catch (e) {
    console.warn('Could not load saved state:', e);
  }
}

function saveState() {
  try {
    localStorage.setItem(
      'sonicrange_pro_state_v1',
      JSON.stringify({
        lang: state.lang,
        limits: state.limits,
        audiogramPoints: state.audiogram.points
      })
    );
  } catch (e) {}
}

function applyLanguage(lang) {
  state.lang = lang === 'en' ? 'en' : 'uk';
  document.documentElement.lang = state.lang;
  document.title = t('pageTitle');

  document.querySelectorAll('#langSelector button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === state.lang);
  });

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val) el.innerHTML = val;
  });

  saveState();
  updateFrequencyReadouts();
  updatePlaybackUI();
  renderLimitCards();
  updateAudiogramUI();
  drawAudiogramCanvas();
  renderQuizScoreboard();
  renderSoundEngineerReport();
}

function sliderToFreq(sliderVal) {
  const norm = Number(sliderVal) / 1000;
  return MIN_FREQ * Math.pow(MAX_FREQ / MIN_FREQ, norm);
}

function freqToSlider(freq) {
  const clamped = Math.max(MIN_FREQ, Math.min(MAX_FREQ, freq));
  return 1000 * (Math.log(clamped / MIN_FREQ) / Math.log(MAX_FREQ / MIN_FREQ));
}

function dbToLinear(db) {
  return Math.pow(10, db / 20);
}

function freqToNoteInfo(freq) {
  const noteStrings = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const midiFloat = 69 + 12 * Math.log2(freq / 440);
  const midi = Math.round(midiFloat);
  const cents = Math.round((midiFloat - midi) * 100);
  if (midi < 0 || midi > 135) return 'Sub / Ultra';
  const noteName = noteStrings[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  const sign = cents >= 0 ? `+${cents}` : `${cents}`;
  return `${noteName}${octave} (${sign}¢)`;
}

function getMixingBand(freq) {
  const isEn = state.lang === 'en';
  if (freq < 20) return 'INFRA-SUB (<20 Hz)';
  if (freq < 60) return isEn ? 'SUB-BASS (20–60 Hz)' : 'SUB-BASS (Суб-бас)';
  if (freq < 250) return isEn ? 'BASS (Body / Punch)' : 'BASS (Фундамент / Тіло)';
  if (freq < 500) return isEn ? 'LOW MID (Warmth / Mud)' : 'LOW MID (Нижня середина)';
  if (freq < 2000) return isEn ? 'MID (Core / Focal)' : 'MID (Основна середина)';
  if (freq < 4000) return isEn ? 'UPPER MID (Attack / Bite)' : 'UPPER MID (Атака / Розбірливість)';
  if (freq < 6000) return isEn ? 'PRESENCE (Clarity)' : 'PRESENCE (Присутність)';
  if (freq < 16000) return isEn ? 'BRILLIANCE (Sibilance / Sparkle)' : 'BRILLIANCE (Сибілянти / Яскравість)';
  return isEn ? 'AIR (Ultra-HF >16 kHz)' : 'AIR (Повітря / Ультра-ВЧ)';
}

function ensureAudioEngine() {
  if (!state.audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    state.audioCtx = new AudioContextClass();

    state.masterGain = state.audioCtx.createGain();
    state.masterGain.gain.value = dbToLinear(state.masterDb);

    state.panner = state.audioCtx.createStereoPanner();
    updatePanningNode();

    state.analyser = state.audioCtx.createAnalyser();
    state.analyser.fftSize = 4096;
    state.analyser.smoothingTimeConstant = 0.82;

    state.panner.connect(state.masterGain);
    state.masterGain.connect(state.analyser);
    state.analyser.connect(state.audioCtx.destination);

    const sr = state.audioCtx.sampleRate;
    document.getElementById('sampleRateDisplay').textContent = `${sr} Hz`;
    document.getElementById('nyquistDisplay').textContent = `${Math.floor(sr / 2)} Hz`;
  }

  if (state.audioCtx.state === 'suspended') {
    state.audioCtx.resume();
  }
}

function updatePanningNode() {
  if (!state.panner || !state.audioCtx) return;
  const panVal = state.currentEar === 'L' ? -1 : state.currentEar === 'R' ? 1 : 0;
  state.panner.pan.setTargetAtTime(panVal, state.audioCtx.currentTime, 0.015);
}

function startOscillator(customDb = null) {
  ensureAudioEngine();
  stopOscillatorImmediate();

  const ctx = state.audioCtx;
  const now = ctx.currentTime;

  state.osc = ctx.createOscillator();
  state.osc.type = 'sine';
  state.osc.frequency.setValueAtTime(state.currentFreq, now);

  state.pulseGain = ctx.createGain();
  state.pulseGain.gain.setValueAtTime(1.0, now);

  state.toneGain = ctx.createGain();
  const targetAmp = customDb !== null ? dbToLinear(customDb) : 1.0;

  state.toneGain.gain.setValueAtTime(0.00001, now);
  state.toneGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, targetAmp), now + 0.04);

  if (state.toneMode === 'warble') {
    state.lfoOsc = ctx.createOscillator();
    state.lfoGain = ctx.createGain();
    state.lfoOsc.frequency.value = 5.5;
    state.lfoGain.gain.value = state.currentFreq * 0.045;
    state.lfoOsc.connect(state.lfoGain);
    state.lfoGain.connect(state.osc.frequency);
    state.lfoOsc.start(now);
  }

  if (state.toneMode === 'pulsed' || customDb !== null) {
    let gateOn = true;
    state.pulseIntervalId = setInterval(() => {
      if (!state.pulseGain || !state.audioCtx) return;
      gateOn = !gateOn;
      const tNow = state.audioCtx.currentTime;
      state.pulseGain.gain.setTargetAtTime(gateOn ? 1.0 : 0.02, tNow, 0.025);
    }, 220);
  }

  state.osc.connect(state.pulseGain);
  state.pulseGain.connect(state.toneGain);
  state.toneGain.connect(state.panner);

  state.osc.start(now);
  state.isPlaying = true;
  updatePlaybackUI();
}

function stopOscillatorImmediate() {
  if (state.pulseIntervalId) {
    clearInterval(state.pulseIntervalId);
    state.pulseIntervalId = null;
  }
  if (state.sweepRafId) {
    cancelAnimationFrame(state.sweepRafId);
    state.sweepRafId = null;
    state.isSweeping = false;
  }

  if (state.osc && state.audioCtx) {
    const now = state.audioCtx.currentTime;
    try {
      state.toneGain.gain.setTargetAtTime(0.00001, now, 0.015);
      const oldOsc = state.osc;
      const oldLfo = state.lfoOsc;
      setTimeout(() => {
        try {
          oldOsc.stop();
          oldOsc.disconnect();
          if (oldLfo) {
            oldLfo.stop();
            oldLfo.disconnect();
          }
        } catch (e) {}
      }, 60);
    } catch (e) {}
  }

  state.osc = null;
  state.lfoOsc = null;
  state.isPlaying = false;
  state.audiogram.isPlayingAg = false;
  state.quiz.isPlayingMystery = false;
  state.quiz.isPlayingRef = false;
  updatePlaybackUI();
}

function setFrequency(freq, updateSlider = true) {
  const clamped = Math.max(MIN_FREQ, Math.min(MAX_FREQ, Number(freq)));
  state.currentFreq = clamped;

  if (state.osc && state.audioCtx) {
    const now = state.audioCtx.currentTime;
    state.osc.frequency.setTargetAtTime(clamped, now, 0.012);
    if (state.lfoGain) {
      state.lfoGain.gain.setTargetAtTime(clamped * 0.045, now, 0.012);
    }
  }

  if (updateSlider) {
    const slider = document.getElementById('freqLogSlider');
    if (slider) slider.value = freqToSlider(clamped).toFixed(2);
  }

  updateFrequencyReadouts();
}

function isQuizBlindMasked() {
  return state.activeTab === 'quiz' && !state.quiz.revealed && !state.quiz.isPlayingRef;
}

function updateFrequencyReadouts() {
  if (isQuizBlindMasked()) {
    document.getElementById('currentFreqReadout').innerHTML = `🔒 ??? <small>Hz</small>`;
    document.getElementById('currentNoteReadout').textContent = t('blindNoteMask');
    document.getElementById('currentBandReadout').textContent = t('blindBandMask');
    document.getElementById('currentWavelengthReadout').textContent = '🔒 —';
    return;
  }

  const f = state.currentFreq;
  const freqDisplay = f >= 1000
    ? `${(f / 1000).toFixed(3)} <small>kHz</small> (${Math.round(f)} Hz)`
    : `${f.toFixed(1)} <small>Hz</small>`;

  document.getElementById('currentFreqReadout').innerHTML = freqDisplay;
  document.getElementById('currentNoteReadout').textContent = freqToNoteInfo(f);
  document.getElementById('currentBandReadout').textContent = getMixingBand(f);

  const wavelengthM = SPEED_OF_SOUND / f;
  const unitM = state.lang === 'en' ? 'm' : 'м';
  const unitCm = state.lang === 'en' ? 'cm' : 'см';
  const waveText = wavelengthM >= 1
    ? `${wavelengthM.toFixed(2)} ${unitM}`
    : `${(wavelengthM * 100).toFixed(1)} ${unitCm}`;
  document.getElementById('currentWavelengthReadout').textContent = waveText;
}

function updatePlaybackUI() {
  const led = document.getElementById('audioStatusLed');
  const toggleBtn = document.getElementById('toggleToneBtn');
  const agPlayBtn = document.getElementById('agPlayToneBtn');
  const quizPlayBtn = document.getElementById('quizPlayMysteryBtn');
  const quizRefBtn = document.getElementById('quizPlayRefBtn');

  if (state.isPlaying) {
    led.classList.add('active');
    toggleBtn.classList.add('playing');
    toggleBtn.textContent = state.isSweeping ? t('btnSweepStop') : t('btnGenStop');
  } else {
    led.classList.remove('active');
    toggleBtn.classList.remove('playing');
    toggleBtn.textContent = t('btnGenStart');
  }

  if (agPlayBtn) {
    agPlayBtn.textContent = state.audiogram.isPlayingAg ? t('btnAgStop') : t('btnAgPlay');
    agPlayBtn.classList.toggle('playing', state.audiogram.isPlayingAg);
  }

  if (quizPlayBtn) {
    quizPlayBtn.textContent = state.quiz.isPlayingMystery ? t('btnQuizStop') : t('btnQuizPlay');
    quizPlayBtn.classList.toggle('playing', state.quiz.isPlayingMystery);
  }

  if (quizRefBtn) {
    quizRefBtn.textContent = state.quiz.isPlayingRef ? t('btnRefStop') : t('btnRefPlay');
    quizRefBtn.classList.toggle('playing', state.quiz.isPlayingRef);
  }
}

function startFrequencySweep(startFreq, endFreq) {
  const speedMap = { slow: 35000, medium: 20000, fast: 10000 };
  const speedSelect = document.getElementById('sweepSpeedSelect').value;
  const durationMs = speedMap[speedSelect] || 20000;

  setFrequency(startFreq, true);
  startOscillator();
  state.isSweeping = true;
  updatePlaybackUI();

  const startTime = performance.now();

  function step(now) {
    if (!state.isSweeping || !state.isPlaying) return;
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / durationMs);
    const current = startFreq * Math.pow(endFreq / startFreq, progress);
    setFrequency(current, true);

    if (progress < 1) {
      state.sweepRafId = requestAnimationFrame(step);
    } else {
      state.isSweeping = false;
      updatePlaybackUI();
    }
  }

  state.sweepRafId = requestAnimationFrame(step);
}

function recordLimit(boundType) {
  const ear = state.currentEar;
  const freqRounded = Math.round(state.currentFreq * 10) / 10;
  state.limits[ear][boundType] = freqRounded;

  saveState();
  renderLimitCards();
  renderSoundEngineerReport();
}

function renderLimitCards() {
  const octUnit = t('octavesUnit');
  ['both', 'L', 'R'].forEach((ear) => {
    const low = state.limits[ear].low;
    const high = state.limits[ear].high;

    document.getElementById(`lowLimit-${ear}`).textContent =
      low !== null ? `${low.toFixed(1)} Hz` : '— Hz';
    document.getElementById(`highLimit-${ear}`).textContent =
      high !== null ? `${Math.round(high)} Hz` : '— Hz';

    const bwEl = document.getElementById(`bandwidth-${ear}`);
    const octEl = document.getElementById(`spanOctaves-${ear}`);
    const barEl = document.getElementById(`rangeBar-${ear}`);

    if (low !== null && high !== null && high > low) {
      const bw = Math.round(high - low);
      const octaves = Math.log2(high / low).toFixed(2);
      bwEl.textContent = `${bw.toLocaleString()} Hz`;
      octEl.textContent = `${octaves} ${octUnit}`;

      const leftPct = Math.max(0, Math.min(100, freqToSlider(low) / 10));
      const rightPct = Math.max(0, Math.min(100, freqToSlider(high) / 10));
      barEl.style.left = `${leftPct}%`;
      barEl.style.width = `${Math.max(2, rightPct - leftPct)}%`;
    } else {
      bwEl.textContent = '— Hz';
      octEl.textContent = `— ${octUnit}`;
      barEl.style.left = '0%';
      barEl.style.width = '0%';
    }
  });

  document.querySelectorAll('.ear-result-card').forEach((card) => {
    card.classList.toggle('active-card', card.dataset.cardEar === state.currentEar);
  });
}

function initSpectrumVisualizer() {
  const canvas = document.getElementById('spectrumCanvas');
  const ctx = canvas.getContext('2d');
  const freqData = new Uint8Array(2048);

  function draw() {
    requestAnimationFrame(draw);

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const gridFreqs = [20, 50, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 20000];
    ctx.strokeStyle = '#182232';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#52637a';
    ctx.font = '11px monospace';

    gridFreqs.forEach((gf) => {
      const x = (freqToSlider(gf) / 1000) * w;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
      const label = gf >= 1000 ? `${gf / 1000}k` : `${gf}`;
      ctx.fillText(label, x + 4, h - 8);
    });

    if (isQuizBlindMasked()) {
      ctx.fillStyle = 'rgba(255, 170, 0, 0.85)';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(t('blindCanvasText'), w / 2, h / 2);
      ctx.textAlign = 'left';
      return;
    }

    const activeLim = state.limits[state.currentEar];
    if (activeLim.low && activeLim.high && activeLim.high > activeLim.low) {
      const x1 = (freqToSlider(activeLim.low) / 1000) * w;
      const x2 = (freqToSlider(activeLim.high) / 1000) * w;
      ctx.fillStyle = 'rgba(24, 226, 153, 0.08)';
      ctx.fillRect(x1, 0, x2 - x1, h);
    }

    if (state.analyser && state.isPlaying) {
      state.analyser.getByteFrequencyData(freqData);
      const nyquist = state.audioCtx.sampleRate / 2;

      ctx.beginPath();
      ctx.moveTo(0, h);

      for (let i = 1; i < freqData.length; i++) {
        const binFreq = (i / freqData.length) * nyquist;
        if (binFreq < MIN_FREQ || binFreq > MAX_FREQ) continue;
        const x = (freqToSlider(binFreq) / 1000) * w;
        const val = freqData[i] / 255;
        const y = h - val * (h - 24);
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const cursorX = (freqToSlider(state.currentFreq) / 1000) * w;
    ctx.strokeStyle = state.isPlaying ? '#18e299' : '#ffaa00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cursorX, 0);
    ctx.lineTo(cursorX, h);
    ctx.stroke();

    ctx.fillStyle = state.isPlaying ? '#18e299' : '#ffaa00';
    ctx.beginPath();
    ctx.arc(cursorX, 22, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  draw();
}

// ==========================================
// TAB 2: STUDIO AUDIOGRAM (L/R THRESHOLD)
// ==========================================
function initAudiogramUI() {
  const container = document.getElementById('audiogramFreqButtons');
  container.innerHTML = '';

  AUDIOGRAM_FREQS.forEach((freq, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ag-freq-btn';
    btn.textContent = freq >= 1000 ? `${freq / 1000}k` : `${freq}Hz`;
    btn.addEventListener('click', () => selectAudiogramFreq(idx));
    container.appendChild(btn);
  });

  updateAudiogramUI();
  drawAudiogramCanvas();
}

function selectAudiogramFreq(index) {
  state.audiogram.activeFreqIndex = index;
  const freq = AUDIOGRAM_FREQS[index];
  const savedVal = state.audiogram.points[state.audiogram.activeEar][freq];
  if (typeof savedVal === 'number') {
    state.audiogram.currentDb = savedVal;
    document.getElementById('agLevelSlider').value = savedVal;
  }
  if (state.audiogram.isPlayingAg) {
    playAudiogramTone();
  }
  updateAudiogramUI();
  drawAudiogramCanvas();
}

function updateAudiogramUI() {
  const idx = state.audiogram.activeFreqIndex;
  const freq = AUDIOGRAM_FREQS[idx];
  const ear = state.audiogram.activeEar;

  document.getElementById('audiogramStepBadge').textContent =
    `${t('agStepBadgePrefix')} ${idx + 1} / ${AUDIOGRAM_FREQS.length}`;
  document.getElementById('agActiveFreq').textContent =
    freq >= 1000 ? `${freq / 1000} kHz (${freq} Hz)` : `${freq} Hz`;
  document.getElementById('agActiveEar').textContent =
    ear === 'L' ? t('earLeftName') : t('earRightName');
  document.getElementById('agCurrentDb').textContent = `${state.audiogram.currentDb} dBFS`;

  const buttons = document.querySelectorAll('#audiogramFreqButtons .ag-freq-btn');
  buttons.forEach((btn, i) => {
    const f = AUDIOGRAM_FREQS[i];
    const hasL = typeof state.audiogram.points.L[f] === 'number';
    const hasR = typeof state.audiogram.points.R[f] === 'number';
    btn.classList.toggle('active', i === idx);
    btn.classList.toggle('done', hasL || hasR);
  });

  document.querySelectorAll('[data-ag-ear]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.agEar === ear);
  });
}

function playAudiogramTone() {
  const freq = AUDIOGRAM_FREQS[state.audiogram.activeFreqIndex];
  state.currentEar = state.audiogram.activeEar;
  updateEarButtonsUI();
  updatePanningNode();

  setFrequency(freq, true);
  state.audiogram.isPlayingAg = true;
  startOscillator(state.audiogram.currentDb);
  updatePlaybackUI();
}

function drawAudiogramCanvas() {
  const canvas = document.getElementById('audiogramCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const padL = 58;
  const padR = 26;
  const padT = 26;
  const padB = 42;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  ctx.clearRect(0, 0, w, h);

  const dbLevels = [-80, -70, -60, -50, -40, -30, -20, -10];
  ctx.font = '11px monospace';

  dbLevels.forEach((db) => {
    const normY = (db - -5) / (-80 - -5);
    const y = padT + normY * plotH;
    ctx.strokeStyle = '#1b2434';
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(w - padR, y);
    ctx.stroke();

    ctx.fillStyle = '#7e90aa';
    ctx.fillText(`${db} dB`, 8, y + 4);
  });

  AUDIOGRAM_FREQS.forEach((freq, i) => {
    const x = padL + (i / (AUDIOGRAM_FREQS.length - 1)) * plotW;
    ctx.strokeStyle = i === state.audiogram.activeFreqIndex ? '#2d4466' : '#161e2c';
    ctx.beginPath();
    ctx.moveTo(x, padT);
    ctx.lineTo(x, h - padB);
    ctx.stroke();

    ctx.fillStyle = i === state.audiogram.activeFreqIndex ? '#00d4ff' : '#7e90aa';
    const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
    ctx.fillText(label, x - 12, h - 16);
  });

  ctx.save();
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = 'rgba(255, 170, 0, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  AUDIOGRAM_FREQS.forEach((freq, i) => {
    const refDb = ISO_REF_CURVE[freq] ?? -50;
    const x = padL + (i / (AUDIOGRAM_FREQS.length - 1)) * plotW;
    const normY = (refDb - -5) / (-80 - -5);
    const y = padT + normY * plotH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.restore();

  function drawEarCurve(earKey, color) {
    const pts = [];
    AUDIOGRAM_FREQS.forEach((freq, i) => {
      const db = state.audiogram.points[earKey][freq];
      if (typeof db === 'number') {
        const x = padL + (i / (AUDIOGRAM_FREQS.length - 1)) * plotW;
        const normY = (db - -5) / (-80 - -5);
        const y = padT + normY * plotH;
        pts.push({ x, y, db, freq });
      }
    });

    if (pts.length > 1) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      pts.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }

    pts.forEach((p) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawEarCurve('L', '#38bdf8');
  drawEarCurve('R', '#fb7185');

  ctx.fillStyle = '#38bdf8';
  ctx.fillText(t('agLegendL'), w - 350, 18);
  ctx.fillStyle = '#fb7185';
  ctx.fillText(t('agLegendR'), w - 230, 18);
  ctx.fillStyle = '#ffaa00';
  ctx.fillText(t('agLegendIso'), w - 115, 18);
}

// ==========================================
// TAB 3: EAR TRAINING FREQUENCY QUIZ
// ==========================================
function formatFreqLabel(f) {
  if (f >= 1000) {
    const k = f / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(2).replace(/0$/, '')} kHz`;
  }
  return `${Math.round(f * 10) / 10} Hz`;
}

function getShortBandTag(f) {
  if (f < 60) return 'Sub-Bass';
  if (f < 250) return 'Bass';
  if (f < 500) return 'Low Mid';
  if (f < 2000) return 'Mid';
  if (f < 4000) return 'Upper Mid';
  if (f < 6000) return 'Presence';
  return 'Brilliance/Air';
}

function initQuizUI() {
  pickNewQuizQuestion(false);
  renderQuizScoreboard();
}

function pickNewQuizQuestion(autoPlay = false) {
  const q = state.quiz;
  q.revealed = false;

  const prevSecret = q.secretFreq;
  if (q.difficulty === 'beginner' || q.difficulty === 'intermediate') {
    const pool = QUIZ_POOLS[q.difficulty];
    let candidate = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && candidate === prevSecret) {
      candidate = pool[(pool.indexOf(candidate) + 1) % pool.length];
    }
    q.secretFreq = candidate;
  } else {
    const minLog = Math.log(35);
    const maxLog = Math.log(15500);
    const randFreq = Math.exp(minLog + Math.random() * (maxLog - minLog));
    q.secretFreq = Math.round(randFreq);
  }

  const choicesBox = document.getElementById('quizChoicesContainer');
  const proSliderBox = document.getElementById('quizProSliderContainer');
  if (q.difficulty === 'pro') {
    choicesBox.style.display = 'none';
    proSliderBox.style.display = 'flex';
  } else {
    choicesBox.style.display = 'flex';
    proSliderBox.style.display = 'none';
    renderQuizOptionButtons();
  }

  const mysteryBox = document.getElementById('quizMysteryDisplay');
  mysteryBox.classList.remove('revealed');
  document.getElementById('quizSecretFreqText').textContent = '??? Hz';
  document.getElementById('quizSecretHintText').textContent = t('quizHintWaiting');
  document.getElementById('quizRoundBadge').textContent =
    `${t('quizRoundPrefix')} ${Math.min(q.round, q.maxRounds)} / ${q.maxRounds}`;

  updateFrequencyReadouts();

  if (autoPlay) {
    playQuizMysteryTone();
  } else if (state.isPlaying) {
    stopOscillatorImmediate();
  }
}

function renderQuizOptionButtons() {
  const grid = document.getElementById('quizOptionsGrid');
  grid.innerHTML = '';
  const pool = QUIZ_POOLS[state.quiz.difficulty] || QUIZ_POOLS.intermediate;

  pool.forEach((freq) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quiz-opt-btn';
    btn.dataset.freq = freq;
    btn.innerHTML = `<span>${formatFreqLabel(freq)}</span><small>${getShortBandTag(freq)}</small>`;
    btn.addEventListener('click', () => submitQuizGuess(freq, btn));
    grid.appendChild(btn);
  });
}

function playQuizMysteryTone() {
  state.toneMode = state.quiz.timbre;
  state.quiz.isPlayingMystery = true;
  state.quiz.isPlayingRef = false;
  setFrequency(state.quiz.secretFreq, false);
  startOscillator();
  state.quiz.isPlayingMystery = true;
  updatePlaybackUI();
  updateFrequencyReadouts();
}

function playQuizReferenceTone() {
  state.toneMode = 'sine';
  state.quiz.isPlayingRef = true;
  state.quiz.isPlayingMystery = false;
  setFrequency(1000, false);
  startOscillator();
  state.quiz.isPlayingRef = true;
  updatePlaybackUI();
  updateFrequencyReadouts();
}

function submitQuizGuess(guessedFreq, clickedBtn = null) {
  const q = state.quiz;
  if (q.revealed) return;

  q.revealed = true;
  const secret = q.secretFreq;
  const octaveError = Math.abs(Math.log2(guessedFreq / secret));

  let pts = 0;
  if (octaveError < 0.05) pts = 100;
  else if (octaveError <= 0.36) pts = 85;
  else if (octaveError <= 0.55) pts = 70;
  else if (octaveError <= 1.02) pts = 45;
  else if (octaveError <= 1.5) pts = 20;
  else pts = 0;

  if (pts >= 85) q.streak += 1;
  else q.streak = 0;

  q.score += pts;
  q.history.push({
    round: q.history.length + 1,
    secret,
    guess: guessedFreq,
    octaveError,
    pts
  });

  setFrequency(secret, true);
  const mysteryBox = document.getElementById('quizMysteryDisplay');
  mysteryBox.classList.add('revealed');
  document.getElementById('quizSecretFreqText').textContent =
    `${formatFreqLabel(secret)} (${Math.round(secret)} Hz)`;
  document.getElementById('quizSecretHintText').textContent =
    `${getMixingBand(secret)} • ${freqToNoteInfo(secret)}`;

  document.querySelectorAll('#quizOptionsGrid .quiz-opt-btn').forEach((btn) => {
    const bf = parseFloat(btn.dataset.freq);
    btn.disabled = true;
    if (bf === secret) btn.classList.add('correct');
    else if (btn === clickedBtn && bf !== secret) btn.classList.add('wrong');
  });

  const banner = document.getElementById('quizFeedbackBanner');
  banner.className = 'quiz-feedback-banner';
  const isEn = state.lang === 'en';

  if (pts === 100) {
    banner.classList.add('good');
    banner.innerHTML = isEn
      ? `🎯 <strong>Spot-on (+100 pts)!</strong> That was <code>${formatFreqLabel(secret)}</code> (${getMixingBand(secret)}). Click "Next Question →" to continue.`
      : `🎯 <strong>Бездоганне влучання (+100 балів)!</strong> Це дійсно <code>${formatFreqLabel(secret)}</code> (${getMixingBand(secret)}). Натисніть «Наступне питання →» для продовження.`;
  } else if (pts >= 70) {
    banner.classList.add('good');
    banner.innerHTML = isEn
      ? `👍 <strong>Very close (+${pts} pts)!</strong> You guessed <code>${formatFreqLabel(guessedFreq)}</code>, actual was <code>${formatFreqLabel(secret)}</code> (error: ${octaveError.toFixed(2)} oct).`
      : `👍 <strong>Дуже близько (+${pts} балів)!</strong> Ви обрали <code>${formatFreqLabel(guessedFreq)}</code>, а звучало <code>${formatFreqLabel(secret)}</code> (похибка: ${octaveError.toFixed(2)} октави).`;
  } else if (pts >= 40) {
    banner.classList.add('warn');
    banner.innerHTML = isEn
      ? `⚠️ <strong>Within an octave (+${pts} pts):</strong> You guessed <code>${formatFreqLabel(guessedFreq)}</code>, actual was <code>${formatFreqLabel(secret)}</code> (${octaveError.toFixed(2)} oct).`
      : `⚠️ <strong>Похибка в межах октави (+${pts} балів):</strong> Ваша відповідь <code>${formatFreqLabel(guessedFreq)}</code>, правильна частота — <code>${formatFreqLabel(secret)}</code> (${octaveError.toFixed(2)} октави).`;
  } else {
    banner.classList.add('bad');
    banner.innerHTML = isEn
      ? `❌ <strong>Missed (+${pts} pts):</strong> You picked <code>${formatFreqLabel(guessedFreq)}</code>, actual was <code>${formatFreqLabel(secret)}</code> (${octaveError.toFixed(2)} oct off). Use the 1 kHz Reference to calibrate!`
      : `❌ <strong>Промах (+${pts} балів):</strong> Ви обрали <code>${formatFreqLabel(guessedFreq)}</code>, а насправді звучало <code>${formatFreqLabel(secret)}</code> (різниця ${octaveError.toFixed(2)} октави). Послухайте еталон 1 kHz!`;
  }

  if (q.round < q.maxRounds) {
    q.round += 1;
  }

  renderQuizScoreboard();
}

function renderQuizScoreboard() {
  const q = state.quiz;
  const count = q.history.length;
  const maxPossible = Math.max(1, count) * 100;
  const avgAccuracy = count > 0 ? Math.round((q.score / maxPossible) * 100) : null;
  const isEn = state.lang === 'en';

  document.getElementById('quizTotalScore').textContent = `${q.score} / ${q.maxRounds * 100}`;
  document.getElementById('quizStreakVal').textContent = `${q.streak} 🔥`;
  document.getElementById('quizAccuracyVal').textContent =
    avgAccuracy !== null ? `${avgAccuracy}%` : '— %';

  let grade = '—';
  if (avgAccuracy !== null) {
    if (avgAccuracy >= 90) grade = isEn ? 'A+ (Golden Ears)' : 'A+ (Золоті вуха)';
    else if (avgAccuracy >= 78) grade = isEn ? 'A (Excellent)' : 'A (Відмінно)';
    else if (avgAccuracy >= 65) grade = isEn ? 'B (Good)' : 'B (Добре)';
    else if (avgAccuracy >= 50) grade = isEn ? 'C (Fair)' : 'C (Задовільно)';
    else grade = isEn ? 'Needs Practice' : 'Потрібна практика';
  }
  document.getElementById('quizGradeVal').textContent = grade;

  const tbody = document.getElementById('quizHistoryBody');
  if (count === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">${t('noAnswersYet')}</td></tr>`;
    return;
  }

  const octShort = isEn ? 'oct' : 'окт.';
  tbody.innerHTML = q.history
    .slice()
    .reverse()
    .map(
      (item) => `
      <tr>
        <td>#${item.round}</td>
        <td><strong>${formatFreqLabel(item.secret)}</strong></td>
        <td>${formatFreqLabel(item.guess)}</td>
        <td>${item.octaveError.toFixed(2)} ${octShort}</td>
        <td style="color:${item.pts >= 80 ? 'var(--accent-green)' : item.pts >= 45 ? 'var(--accent-amber)' : 'var(--accent-red)'}; font-weight:700;">+${item.pts}</td>
      </tr>
    `
    )
    .join('');
}

function resetQuizSession() {
  state.quiz.round = 1;
  state.quiz.score = 0;
  state.quiz.streak = 0;
  state.quiz.history = [];
  pickNewQuizQuestion(false);
  renderQuizScoreboard();
  const banner = document.getElementById('quizFeedbackBanner');
  banner.className = 'quiz-feedback-banner';
  banner.innerHTML = t('quizInitialBanner');
}

// ==========================================
// TAB 4: SOUND ENGINEER ANALYTICS & REPORT
// ==========================================
function renderSoundEngineerReport() {
  const isEn = state.lang === 'en';
  const bestLow =
    state.limits.both.low ??
    state.limits.L.low ??
    state.limits.R.low ??
    24;
  const bestHigh =
    state.limits.both.high ??
    state.limits.L.high ??
    state.limits.R.high ??
    16800;

  const octaves = bestHigh > bestLow ? Math.log2(bestHigh / bestLow).toFixed(2) : '—';
  const airCoveragePct = Math.min(100, Math.max(0, Math.round(((bestHigh - 10000) / 10000) * 100)));

  const summaryGrid = document.getElementById('reportSummaryGrid');
  summaryGrid.innerHTML = isEn
    ? `
    <div class="summary-stat">
      <span class="s-title">Working Frequency Range</span>
      <span class="s-value">${bestLow.toFixed(1)} Hz – ${Math.round(bestHigh)} Hz</span>
      <span class="s-sub">Lower and upper hearing thresholds</span>
    </div>
    <div class="summary-stat">
      <span class="s-title">Octave Span</span>
      <span class="s-value">${octaves} octaves</span>
      <span class="s-sub">Out of ~10.0 theoretical octaves (20Hz–20kHz)</span>
    </div>
    <div class="summary-stat">
      <span class="s-title">Air Band Control (10k–20k)</span>
      <span class="s-value">${airCoveragePct}%</span>
      <span class="s-sub">${bestHigh >= 16500 ? 'High HF resolution' : 'Use visual spectrum analyzer above 15 kHz'}</span>
    </div>
    <div class="summary-stat">
      <span class="s-title">Sub-Bass Control (<40 Hz)</span>
      <span class="s-value">${bestLow <= 28 ? 'Full' : bestLow <= 42 ? 'Moderate' : 'Limited'}</span>
      <span class="s-sub">Lower limit: ${bestLow.toFixed(1)} Hz</span>
    </div>
  `
    : `
    <div class="summary-stat">
      <span class="s-title">Робочий діапазон частот</span>
      <span class="s-value">${bestLow.toFixed(1)} Hz – ${Math.round(bestHigh)} Hz</span>
      <span class="s-sub">Нижня та верхня межа чутності</span>
    </div>
    <div class="summary-stat">
      <span class="s-title">Охоплення в октавах</span>
      <span class="s-value">${octaves} октав</span>
      <span class="s-sub">Зі ~10.0 теоретичних октав (20Hz–20kHz)</span>
    </div>
    <div class="summary-stat">
      <span class="s-title">Контроль Air-діапазону (10k–20k)</span>
      <span class="s-value">${airCoveragePct}%</span>
      <span class="s-sub">${bestHigh >= 16500 ? 'Висока роздільна здатність ВЧ' : 'Потребує візуального аналізатора ВЧ'}</span>
    </div>
    <div class="summary-stat">
      <span class="s-title">Контроль Sub-Bass (<40 Hz)</span>
      <span class="s-value">${bestLow <= 28 ? 'Повний' : bestLow <= 42 ? 'Помірний' : 'Обмежений'}</span>
      <span class="s-sub">Нижній поріг: ${bestLow.toFixed(1)} Hz</span>
    </div>
  `;

  const adviceList = document.getElementById('engineeringAdviceList');
  const tips = [];

  if (bestHigh >= 17000) {
    tips.push({
      cls: 'good',
      text: isEn
        ? `<strong>Excellent Brilliance & Air Control (up to ${Math.round(bestHigh)} Hz):</strong> You can hear ultra-high harmonics and High-Shelf EQ boosts at 12–16 kHz directly without over-brightening the mix.`
        : `<strong>Відмінний контроль Brilliance & Air (до ${Math.round(bestHigh)} Hz):</strong> Ви чуєте ультрависокі гармоніки та роботу чистих High-Shelf еквалайзерів на 12–16 кГц без ризику випадково переяскравити мікс.`
    });
  } else if (bestHigh >= 14000) {
    tips.push({
      cls: 'good',
      text: isEn
        ? `<strong>Standard Professional HF Range (up to ${Math.round(bestHigh)} Hz):</strong> Full control over sibilance (5–9 kHz) and air up to 14+ kHz. Cross-check ultra-HF shelves (>15 kHz) with a spectrum analyzer (e.g. FabFilter Pro-Q or Voxengo SPAN).`
        : `<strong>Стандартний професійний діапазон ВЧ (до ${Math.round(bestHigh)} Hz):</strong> Ви повністю контролюєте зону сибілянтів (5–9 кГц) та повітря до 14+ кГц. Під час роботи з полицями вище 15 кГц звіряйтеся зі спектроаналізатором.`
    });
  } else {
    tips.push({
      cls: 'warn',
      text: isEn
        ? `<strong>Caution with High-Shelf EQ above ${Math.round(bestHigh)} Hz:</strong> Reduced sensitivity above this threshold can tempt you to over-boost highs. Always use reference tracks and visual spectrum meters for the 12–20 kHz region.`
        : `<strong>Обережність із High-Shelf вище ${Math.round(bestHigh)} Hz:</strong> Через спад чутливості вище цієї межі виникає спокуса надмірно піднімати верхні частоти. Використовуйте референс-треки та візуальний контроль спектра у зоні 12–20 кГц.`
    });
  }

  if (bestLow <= 25) {
    tips.push({
      cls: 'good',
      text: isEn
        ? `<strong>Deep Sub-Bass Monitoring (${bestLow.toFixed(1)} Hz):</strong> Your headphones/monitors and hearing allow accurate control of kick fundamentals and 808 sub-bass.`
        : `<strong>Глибокий моніторинг Sub-Bass (${bestLow.toFixed(1)} Hz):</strong> Ваші навушники/монітори та слух дозволяють контролювати інфра-низ і фундамент бочки (Kick) та 808-басу.`
    });
  } else {
    tips.push({
      cls: 'warn',
      text: isEn
        ? `<strong>Lower Limit ${bestLow.toFixed(1)} Hz:</strong> Your current playback system likely rolls off sub-bass. Check 20–45 Hz rumble on a visual analyzer.`
        : `<strong>Нижній поріг ${bestLow.toFixed(1)} Hz:</strong> Ймовірно, поточна акустика або навушники мають спад на суб-басі. Перевіряйте зону 20–45 Hz за аналізатором.`
    });
  }

  tips.push({
    cls: '',
    text: isEn
      ? `<strong>Optimal Monitoring Level (ISO 226 Equal-Loudness):</strong> Human hearing is flattest around <strong>78–83 dB SPL (C-weighted)</strong>. Mixing too quietly hides sub-bass and air, while >85 dB SPL causes rapid ear fatigue.`
      : `<strong>Оптимальний рівень моніторингу (Криві рівної гучності ISO 226):</strong> Максимальна лінійність людського слуху досягається при гучності моніторингу <strong>78–83 dB SPL (C-weighted)</strong>.`
  });

  adviceList.innerHTML = tips.map((item) => `<li class="${item.cls}">${item.text}</li>`).join('');

  const asymBox = document.getElementById('asymmetryReportBox');
  const lHigh = state.limits.L.high;
  const rHigh = state.limits.R.high;

  let asymHtml = '';
  if (lHigh && rHigh) {
    const diffHz = Math.abs(lHigh - rHigh);
    asymHtml += isEn
      ? `<p style="font-size:0.85rem; margin-bottom:8px;"><strong>L/R Upper Threshold Comparison:</strong> Left = <code>${Math.round(lHigh)} Hz</code>, Right = <code>${Math.round(rHigh)} Hz</code> (Δ <code>${Math.round(diffHz)} Hz</code>).</p>`
      : `<p style="font-size:0.85rem; margin-bottom:8px;"><strong>Порівняння ВЧ-порогу L/R:</strong> Ліве вухо = <code>${Math.round(lHigh)} Hz</code>, Праве вухо = <code>${Math.round(rHigh)} Hz</code> (Різниця: <code>${Math.round(diffHz)} Hz</code>).</p>`;
  } else {
    asymHtml += isEn
      ? `<p style="font-size:0.83rem; color:var(--text-muted);">Measure <strong>Left (L)</strong> and <strong>Right (R)</strong> channels separately in Tab 1 or Tab 2 to unlock L/R stereo symmetry diagnostics.</p>`
      : `<p style="font-size:0.83rem; color:var(--text-muted);">Щоб отримати аналіз симетрії L/R для панорамування міксу, проведіть заміри окремо для <strong>Лівого (L)</strong> та <strong>Правого (R)</strong> каналу.</p>`;
  }

  asymBox.innerHTML = asymHtml;

  // Populate ISO 7029 Table in current language
  const isoBody = document.getElementById('isoTableBody');
  if (isoBody) {
    isoBody.innerHTML = isEn
      ? `
        <tr>
          <td>Reference Youth (under 20 yrs)</td>
          <td>18,500 – 20,000 Hz</td>
          <td>Full perception of Air band and ultra-high harmonics</td>
        </tr>
        <tr>
          <td>Studio Engineer (25–35 yrs)</td>
          <td>15,500 – 17,800 Hz</td>
          <td>Full control of presence & sibilance; visual check >17 kHz</td>
        </tr>
        <tr>
          <td>Senior Producer / Mixer (35–50 yrs)</td>
          <td>13,500 – 15,500 Hz</td>
          <td>Critical midrange accuracy; verify HF air shelves via analyzer</td>
        </tr>
        <tr>
          <td>Industry Veteran (50+ yrs)</td>
          <td>11,000 – 13,500 Hz</td>
          <td>Deep musical balance & M/S focus; visual metering above 12 kHz</td>
        </tr>
      `
      : `
        <tr>
          <td>Еталонний діапазон (до 20 років)</td>
          <td>18 500 – 20 000 Hz</td>
          <td>Повний контроль Air-діапазону та ультрависоких гармонік</td>
        </tr>
        <tr>
          <td>Активний студійний інженер (25–35 років)</td>
          <td>15 500 – 17 800 Hz</td>
          <td>Повний контроль присутності та сибілянтів, Air >17kHz за аналізатором</td>
        </tr>
        <tr>
          <td>Досвідчений продюсер / інженер (35–50 років)</td>
          <td>13 500 – 15 500 Hz</td>
          <td>Висока чутливість до середини; контроль ВЧ-полиць через SPAN / Pro-Q</td>
        </tr>
        <tr>
          <td>Ветеран індустрії (50+ років)</td>
          <td>11 000 – 13 500 Hz</td>
          <td>Фокус на музичному балансі; обов'язковий візуальний контроль вище 12 кГц</td>
        </tr>
      `;
  }
}

function updateEarButtonsUI() {
  document.querySelectorAll('#earSelector button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.ear === state.currentEar);
  });
  renderLimitCards();
}

// ==========================================
// EVENT LISTENERS & INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadSavedState();
  initSpectrumVisualizer();
  initAudiogramUI();
  initQuizUI();
  applyLanguage(state.lang);

  // Language switcher (UA / EN)
  document.querySelectorAll('#langSelector button').forEach((btn) => {
    btn.addEventListener('click', () => {
      applyLanguage(btn.dataset.lang);
      if (state.quiz.difficulty !== 'pro') {
        renderQuizOptionButtons();
      }
    });
  });

  // Tab navigation
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      stopOscillatorImmediate();
      state.activeTab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
      updateFrequencyReadouts();
      if (btn.dataset.tab === 'audiogram') drawAudiogramCanvas();
      if (btn.dataset.tab === 'report') renderSoundEngineerReport();
    });
  });

  // Master level fader
  const masterSlider = document.getElementById('masterGainSlider');
  masterSlider.addEventListener('input', (e) => {
    state.masterDb = parseFloat(e.target.value);
    document.getElementById('masterGainValue').textContent = `${state.masterDb} dBFS`;
    if (state.masterGain && state.audioCtx) {
      state.masterGain.gain.setTargetAtTime(
        dbToLinear(state.masterDb),
        state.audioCtx.currentTime,
        0.015
      );
    }
  });

  document.getElementById('panicStopBtn').addEventListener('click', () => {
    stopOscillatorImmediate();
  });

  document.querySelectorAll('#earSelector button').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.currentEar = btn.dataset.ear;
      updateEarButtonsUI();
      updatePanningNode();
    });
  });

  const freqSlider = document.getElementById('freqLogSlider');
  freqSlider.addEventListener('input', (e) => {
    state.isSweeping = false;
    const freq = sliderToFreq(e.target.value);
    setFrequency(freq, false);
  });

  document.querySelectorAll('.fine-step-btns button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const step = parseFloat(btn.dataset.step);
      setFrequency(state.currentFreq + step, true);
    });
  });

  document.getElementById('toneModeSelect').addEventListener('change', (e) => {
    state.toneMode = e.target.value;
    if (state.isPlaying) startOscillator();
  });

  document.getElementById('toggleToneBtn').addEventListener('click', () => {
    if (state.isPlaying) stopOscillatorImmediate();
    else startOscillator();
  });

  document.getElementById('startLowSweepBtn').addEventListener('click', () => {
    startFrequencySweep(120, 15);
  });

  document.getElementById('startHighSweepBtn').addEventListener('click', () => {
    startFrequencySweep(8000, 22000);
  });

  document.getElementById('startFullSweepBtn').addEventListener('click', () => {
    startFrequencySweep(20, 22000);
  });

  document.getElementById('markLowLimitBtn').addEventListener('click', () => {
    recordLimit('low');
  });

  document.getElementById('markHighLimitBtn').addEventListener('click', () => {
    recordLimit('high');
  });

  document.getElementById('resetLimitsBtn').addEventListener('click', () => {
    state.limits = {
      both: { low: null, high: null },
      L: { low: null, high: null },
      R: { low: null, high: null }
    };
    saveState();
    renderLimitCards();
    renderSoundEngineerReport();
  });

  document.querySelectorAll('#quickFreqPills button').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.isSweeping = false;
      const f = parseFloat(btn.dataset.freq);
      setFrequency(f, true);
      if (!state.isPlaying) startOscillator();
    });
  });

  document.querySelectorAll('[data-ag-ear]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.audiogram.activeEar = btn.dataset.agEar;
      updateAudiogramUI();
      if (state.audiogram.isPlayingAg) playAudiogramTone();
    });
  });

  const agLevelSlider = document.getElementById('agLevelSlider');
  agLevelSlider.addEventListener('input', (e) => {
    state.audiogram.currentDb = parseInt(e.target.value, 10);
    updateAudiogramUI();
    if (state.audiogram.isPlayingAg && state.toneGain && state.audioCtx) {
      state.toneGain.gain.setTargetAtTime(
        dbToLinear(state.audiogram.currentDb),
        state.audioCtx.currentTime,
        0.02
      );
    }
  });

  document.getElementById('agDbDownBtn').addEventListener('click', () => {
    agLevelSlider.value = Math.max(-80, state.audiogram.currentDb - 2);
    agLevelSlider.dispatchEvent(new Event('input'));
  });

  document.getElementById('agDbUpBtn').addEventListener('click', () => {
    agLevelSlider.value = Math.min(-5, state.audiogram.currentDb + 2);
    agLevelSlider.dispatchEvent(new Event('input'));
  });

  document.getElementById('agPlayToneBtn').addEventListener('click', () => {
    if (state.audiogram.isPlayingAg) stopOscillatorImmediate();
    else playAudiogramTone();
  });

  document.getElementById('agRecordPointBtn').addEventListener('click', () => {
    const freq = AUDIOGRAM_FREQS[state.audiogram.activeFreqIndex];
    const ear = state.audiogram.activeEar;
    state.audiogram.points[ear][freq] = state.audiogram.currentDb;
    saveState();
    drawAudiogramCanvas();
    renderSoundEngineerReport();

    if (state.audiogram.activeFreqIndex < AUDIOGRAM_FREQS.length - 1) {
      selectAudiogramFreq(state.audiogram.activeFreqIndex + 1);
    } else {
      updateAudiogramUI();
    }
  });

  document.getElementById('loadDemoAudiogramBtn').addEventListener('click', () => {
    state.audiogram.points = {
      L: {
        20: -20, 31.5: -30, 63: -42, 125: -51, 250: -58, 500: -64,
        1000: -68, 2000: -70, 4000: -69, 6000: -63, 8000: -60,
        10000: -55, 12500: -48, 16000: -34, 20000: -14
      },
      R: {
        20: -21, 31.5: -29, 63: -41, 125: -50, 250: -57, 500: -63,
        1000: -67, 2000: -69, 4000: -65, 6000: -60, 8000: -58,
        10000: -54, 12500: -46, 16000: -31, 20000: -12
      }
    };
    state.limits.both = { low: 21.5, high: 17450 };
    state.limits.L = { low: 21.5, high: 17600 };
    state.limits.R = { low: 22.0, high: 17200 };
    saveState();
    renderLimitCards();
    updateAudiogramUI();
    drawAudiogramCanvas();
    renderSoundEngineerReport();
  });

  document.getElementById('clearAudiogramBtn').addEventListener('click', () => {
    state.audiogram.points = { L: {}, R: {} };
    saveState();
    updateAudiogramUI();
    drawAudiogramCanvas();
    renderSoundEngineerReport();
  });

  // Ear Training Quiz Event Listeners
  document.getElementById('quizDifficultySelect').addEventListener('change', (e) => {
    state.quiz.difficulty = e.target.value;
    pickNewQuizQuestion(false);
  });

  document.getElementById('quizTimbreSelect').addEventListener('change', (e) => {
    state.quiz.timbre = e.target.value;
    if (state.quiz.isPlayingMystery) playQuizMysteryTone();
  });

  document.getElementById('quizPlayMysteryBtn').addEventListener('click', () => {
    if (state.quiz.isPlayingMystery) stopOscillatorImmediate();
    else playQuizMysteryTone();
  });

  document.getElementById('quizPlayRefBtn').addEventListener('click', () => {
    if (state.quiz.isPlayingRef) stopOscillatorImmediate();
    else playQuizReferenceTone();
  });

  document.getElementById('quizNextQuestionBtn').addEventListener('click', () => {
    if (state.quiz.history.length >= state.quiz.maxRounds) {
      resetQuizSession();
      playQuizMysteryTone();
    } else {
      pickNewQuizQuestion(true);
    }
  });

  const quizGuessSlider = document.getElementById('quizGuessSlider');
  quizGuessSlider.addEventListener('input', (e) => {
    const f = Math.round(sliderToFreq(e.target.value));
    state.quiz.sliderGuessFreq = f;
    document.getElementById('quizSliderReadout').textContent = `${formatFreqLabel(f)} (${f} Hz)`;
  });

  document.getElementById('quizSubmitSliderBtn').addEventListener('click', () => {
    submitQuizGuess(state.quiz.sliderGuessFreq);
  });

  document.getElementById('quizResetBtn').addEventListener('click', () => {
    resetQuizSession();
  });

  // Export JSON Profile
  document.getElementById('exportJsonBtn').addEventListener('click', () => {
    const payload = {
      app: 'SonicRange Pro — Sound Engineer Hearing Profile',
      repository: 'https://github.com/mozhenko/sonic-range-analyzer',
      timestamp: new Date().toISOString(),
      limitsHz: state.limits,
      audiogramDbFS: state.audiogram.points,
      quizResults: {
        score: state.quiz.score,
        history: state.quiz.history
      }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sonicrange-hearing-profile-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('printReportBtn').addEventListener('click', () => {
    window.print();
  });

  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

    if (e.code === 'Escape') {
      stopOscillatorImmediate();
    } else if (e.code === 'Space') {
      e.preventDefault();
      if (state.activeTab === 'quiz') {
        if (state.quiz.isPlayingMystery) stopOscillatorImmediate();
        else playQuizMysteryTone();
      } else {
        if (state.isPlaying) stopOscillatorImmediate();
        else startOscillator();
      }
    } else if (e.code === 'KeyL' && state.activeTab === 'sweep') {
      recordLimit('low');
    } else if (e.code === 'KeyH' && state.activeTab === 'sweep') {
      recordLimit('high');
    }
  });

  let deferredInstallPrompt = null;
  const installBtn = document.getElementById('installPwaBtn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (installBtn) installBtn.style.display = 'inline-flex';
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      installBtn.style.display = 'none';
    });
  }

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});

/**
 * SonicRange Pro — Studio Hearing Frequency Range & Audiogram Analyzer
 * Built for Sound Engineers (Web Audio API)
 */

const MIN_FREQ = 15;
const MAX_FREQ = 22000;
const SPEED_OF_SOUND = 343; // m/s at 20°C

const AUDIOGRAM_FREQS = [
  20, 31.5, 63, 125, 250, 500, 1000, 2000, 4000, 6000, 8000, 10000, 12500, 16000, 20000
];

// Reference normal threshold curve approximation in dBFS (relative studio reference)
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

const state = {
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
  currentEar: 'both', // 'L' | 'R' | 'both'
  toneMode: 'sine',   // 'sine' | 'warble' | 'pulsed'

  // Measured frequency limits per ear
  limits: {
    both: { low: null, high: null },
    L: { low: null, high: null },
    R: { low: null, high: null }
  },

  // Audiogram state
  audiogram: {
    activeFreqIndex: 6, // 1000 Hz default
    activeEar: 'L',
    currentDb: -50,
    isPlayingAg: false,
    points: {
      L: {},
      R: {}
    }
  },

  // Ear Training Quiz state
  quiz: {
    difficulty: 'intermediate', // 'beginner' | 'intermediate' | 'pro'
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

// Load saved state from localStorage if available
function loadSavedState() {
  try {
    const raw = localStorage.getItem('sonicrange_pro_state_v1');
    if (!raw) return;
    const parsed = JSON.parse(raw);
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
        limits: state.limits,
        audiogramPoints: state.audiogram.points
      })
    );
  } catch (e) {
    // ignore storage errors
  }
}

// Logarithmic slider conversion (0..1000 <-> 15..22000 Hz)
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

// Frequency to musical note & cents
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

// Mixing band classification for sound engineers
function getMixingBand(freq) {
  if (freq < 20) return 'INFRA-SUB (<20 Hz)';
  if (freq < 60) return 'SUB-BASS (Суб-бас)';
  if (freq < 250) return 'BASS (Фундамент / Тіло)';
  if (freq < 500) return 'LOW MID (Нижня середина / Муть)';
  if (freq < 2000) return 'MID (Основна середина / Фокус)';
  if (freq < 4000) return 'UPPER MID (Атака / Розбірливість)';
  if (freq < 6000) return 'PRESENCE (Присутність / Близькість)';
  if (freq < 16000) return 'BRILLIANCE (Сибілянти / Яскравість)';
  return 'AIR (Повітря / Ультра-ВЧ)';
}

// Initialize Web Audio Context & Graph
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

    // Update Sample Rate & Nyquist readouts
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

// Start clean studio oscillator with anti-click envelope
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

  // Anti-click soft fade-in
  state.toneGain.gain.setValueAtTime(0.00001, now);
  state.toneGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, targetAmp), now + 0.04);

  // Configure Warble Tone (FM modulation ±5% at 5 Hz to prevent room standing waves)
  if (state.toneMode === 'warble') {
    state.lfoOsc = ctx.createOscillator();
    state.lfoGain = ctx.createGain();
    state.lfoOsc.frequency.value = 5.5; // 5.5 Hz warble
    state.lfoGain.gain.value = state.currentFreq * 0.045;
    state.lfoOsc.connect(state.lfoGain);
    state.lfoGain.connect(state.osc.frequency);
    state.lfoOsc.start(now);
  }

  // Configure Pulsed Tone (2.5 Hz gentle gate for threshold detection)
  if (state.toneMode === 'pulsed' || customDb !== null) {
    let gateOn = true;
    state.pulseIntervalId = setInterval(() => {
      if (!state.pulseGain || !state.audioCtx) return;
      gateOn = !gateOn;
      const t = state.audioCtx.currentTime;
      state.pulseGain.gain.setTargetAtTime(gateOn ? 1.0 : 0.02, t, 0.025);
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
    document.getElementById('currentNoteReadout').textContent = '🔒 Сліпий тест';
    document.getElementById('currentBandReadout').textContent = '🔒 Вгадайте частоту';
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
  const waveText = wavelengthM >= 1
    ? `${wavelengthM.toFixed(2)} м`
    : `${(wavelengthM * 100).toFixed(1)} см`;
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
    toggleBtn.textContent = state.isSweeping
      ? '⏸ ЗУПИНИТИ АВТО-СВІП'
      : '⏸ ВИМКНУТИ ТОН-ГЕНЕРАТОР';
  } else {
    led.classList.remove('active');
    toggleBtn.classList.remove('playing');
    toggleBtn.textContent = '▶ УВІМКНУТИ ТОН-ГЕНЕРАТОР';
  }

  if (agPlayBtn) {
    agPlayBtn.textContent = state.audiogram.isPlayingAg
      ? '⏸ Зупинити пульс-тон'
      : '▶ Прослухати пульс-тон';
    agPlayBtn.classList.toggle('playing', state.audiogram.isPlayingAg);
  }

  if (quizPlayBtn) {
    quizPlayBtn.textContent = state.quiz.isPlayingMystery
      ? '⏸ ЗУПИНИТИ ЗАГАДАНИЙ ТОН'
      : '🔊 СЛУХАТИ ЗАГАДАНИЙ ТОН';
    quizPlayBtn.classList.toggle('playing', state.quiz.isPlayingMystery);
  }

  if (quizRefBtn) {
    quizRefBtn.textContent = state.quiz.isPlayingRef
      ? '⏸ Вимкнути Еталон 1 kHz'
      : '🔔 Еталон 1 kHz (Референс)';
    quizRefBtn.classList.toggle('playing', state.quiz.isPlayingRef);
  }
}

// Automated Logarithmic Frequency Sweep
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

    // Exponential interpolation for constant octave/sec perception
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

// Record Lower or Upper Hearing Limit for Current Ear
function recordLimit(boundType) {
  const ear = state.currentEar;
  const freqRounded = Math.round(state.currentFreq * 10) / 10;
  state.limits[ear][boundType] = freqRounded;

  // If measured in stereo and L/R are empty, keep stereo independent
  saveState();
  renderLimitCards();
  renderSoundEngineerReport();
}

function renderLimitCards() {
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
      bwEl.textContent = `${bw.toLocaleString('uk-UA')} Hz`;
      octEl.textContent = `${octaves} октав`;

      const leftPct = Math.max(0, Math.min(100, freqToSlider(low) / 10));
      const rightPct = Math.max(0, Math.min(100, freqToSlider(high) / 10));
      barEl.style.left = `${leftPct}%`;
      barEl.style.width = `${Math.max(2, rightPct - leftPct)}%`;
    } else {
      bwEl.textContent = '— Hz';
      octEl.textContent = '— октав';
      barEl.style.left = '0%';
      barEl.style.width = '0%';
    }
  });

  // Highlight active ear card
  document.querySelectorAll('.ear-result-card').forEach((card) => {
    card.classList.toggle('active-card', card.dataset.cardEar === state.currentEar);
  });
}

// Real-time Spectrum & Frequency Marker Visualizer
function initSpectrumVisualizer() {
  const canvas = document.getElementById('spectrumCanvas');
  const ctx = canvas.getContext('2d');
  const freqData = new Uint8Array(2048);

  function draw() {
    requestAnimationFrame(draw);

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background grid lines (logarithmic frequencies)
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
      ctx.fillText('🎓 СЛІПИЙ РЕЖИМ ВІКТОРИНИ — СПЕКТРОАНАЛІЗАТОР ПРИХОВАНО ДО ВАШОЇ ВІДПОВІДІ', w / 2, h / 2);
      ctx.textAlign = 'left';
      return;
    }

    // Draw recorded range shaded zone for current ear
    const activeLim = state.limits[state.currentEar];
    if (activeLim.low && activeLim.high && activeLim.high > activeLim.low) {
      const x1 = (freqToSlider(activeLim.low) / 1000) * w;
      const x2 = (freqToSlider(activeLim.high) / 1000) * w;
      ctx.fillStyle = 'rgba(24, 226, 153, 0.08)';
      ctx.fillRect(x1, 0, x2 - x1, h);
    }

    // Draw FFT spectrum if audio is active
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

    // Draw current frequency cursor line
    const cursorX = (freqToSlider(state.currentFreq) / 1000) * w;
    ctx.strokeStyle = state.isPlaying ? '#18e299' : '#ffaa00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cursorX, 0);
    ctx.lineTo(cursorX, h);
    ctx.stroke();

    // Draw glowing dot on cursor
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
    `Частота ${idx + 1} / ${AUDIOGRAM_FREQS.length}`;
  document.getElementById('agActiveFreq').textContent =
    freq >= 1000 ? `${freq / 1000} kHz (${freq} Hz)` : `${freq} Hz`;
  document.getElementById('agActiveEar').textContent =
    ear === 'L' ? '◀ Ліве вухо (L)' : '▶ Праве вухо (R)';
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

  // dB grid (-80 dBFS at bottom to -5 dBFS at top)
  const dbLevels = [-80, -70, -60, -50, -40, -30, -20, -10];
  ctx.font = '11px monospace';

  dbLevels.forEach((db) => {
    const normY = (db - -5) / (-80 - -5); // -5 at top (0), -80 at bottom (1)
    const y = padT + normY * plotH;
    ctx.strokeStyle = '#1b2434';
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(w - padR, y);
    ctx.stroke();

    ctx.fillStyle = '#7e90aa';
    ctx.fillText(`${db} dB`, 8, y + 4);
  });

  // Frequency columns
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

  // Draw Reference Normal Threshold Curve (dashed)
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

  // Helper to draw L and R ear curves
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

  // Legend in top-right
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('● Ліве вухо (L)', w - 340, 18);
  ctx.fillStyle = '#fb7185';
  ctx.fillText('● Праве вухо (R)', w - 220, 18);
  ctx.fillStyle = '#ffaa00';
  ctx.fillText('--- Еталон ISO', w - 110, 18);
}

// ==========================================
// TAB 3: SOUND ENGINEER ANALYTICS & REPORT
// ==========================================
function renderSoundEngineerReport() {
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
  summaryGrid.innerHTML = `
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

  // Generate tailored mixing & mastering recommendations
  const adviceList = document.getElementById('engineeringAdviceList');
  const tips = [];

  if (bestHigh >= 17000) {
    tips.push({
      cls: 'good',
      text: `<strong>Відмінний контроль Brilliance & Air (до ${Math.round(bestHigh)} Hz):</strong> Ви чуєте ультрависокі гармоніки та роботу чистих High-Shelf еквалайзерів на 12–16 кГц без ризику випадково переяскравити мікс.`
    });
  } else if (bestHigh >= 14000) {
    tips.push({
      cls: 'good',
      text: `<strong>Стандартний професійний діапазон ВЧ (до ${Math.round(bestHigh)} Hz):</strong> Ви повністю контролюєте зону сибілянтів (5–9 кГц) та повітря до 14+ кГц. Під час роботи з полицями вище 15 кГц (Air EQ) звіряйтеся зі спектроаналізатором (наприклад, FabFilter Pro-Q або Voxengo SPAN).`
    });
  } else {
    tips.push({
      cls: 'warn',
      text: `<strong>Обережність із High-Shelf вище ${Math.round(bestHigh)} Hz:</strong> Через спад чутливості вище цієї межі виникає спокуса надмірно піднімати верхні частоти при зведенні. Використовуйте референс-треки та обрізний Low-Pass або візуальний контроль спектра у зоні 12–20 кГц.`
    });
  }

  if (bestLow <= 25) {
    tips.push({
      cls: 'good',
      text: `<strong>Глибокий моніторинг Sub-Bass (${bestLow.toFixed(1)} Hz):</strong> Ваші навушники/монітори та слух дозволяють контролювати інфра-низ і фундамент бочки (Kick) та 808-басу. Не забувайте перевіряти Low-Cut фільтри на 20–30 Гц.`
    });
  } else {
    tips.push({
      cls: 'warn',
      text: `<strong>Нижній поріг ${bestLow.toFixed(1)} Hz:</strong> Ймовірно, поточна акустика або навушники мають спад на суб-басі. При роботі з саб-басом (20–45 Hz) використовуйте гармонічне насичення або перевіряйте рівень сабу за аналізатором.`
    });
  }

  tips.push({
    cls: '',
    text: `<strong>Оптимальний рівень моніторингу (Криві рівної гучності ISO 226):</strong> Максимальна лінійність людського слуху досягається при гучності моніторингу <strong>78–83 dB SPL (C-weighted)</strong>. На занадто тихій гучності вухо гірше чує суб-бас та верх, а вище 85 dB SPL швидко настає слухова втома (Ear Fatigue).`
  });

  adviceList.innerHTML = tips.map((t) => `<li class="${t.cls}">${t.text}</li>`).join('');

  // Calculate L/R symmetry diagnostics
  const asymBox = document.getElementById('asymmetryReportBox');
  const lHigh = state.limits.L.high;
  const rHigh = state.limits.R.high;

  let asymHtml = '';
  if (lHigh && rHigh) {
    const diffHz = Math.abs(lHigh - rHigh);
    const strongerEar = lHigh > rHigh ? 'Ліве (L)' : 'Праве (R)';
    asymHtml += `<p style="font-size:0.85rem; margin-bottom:8px;">
      <strong>Порівняння ВЧ-порогу L/R:</strong> Ліве вухо = <code>${Math.round(lHigh)} Hz</code>, Праве вухо = <code>${Math.round(rHigh)} Hz</code> (Різниця: <code>${Math.round(diffHz)} Hz</code>).
      ${diffHz > 1200 ? `<br><span style="color:var(--accent-amber)">⚠️ Помітна асиметрія ВЧ (сильніше ${strongerEar} вухо). Рекомендується періодично міняти місцями канали (L/R Swap) або перевіряти мікс у режимі MONO під час панорамування хай-хетів та гітар.</span>` : `<br><span style="color:var(--accent-green)">✅ Відмінна симетрія верхньої межі між лівим та правим вухом.</span>`}
    </p>`;
  } else {
    asymHtml += `<p style="font-size:0.83rem; color:var(--text-muted);">
      Щоб отримати точний аналіз симетрії L/R для панорамування міксу, проведіть заміри окремо для <strong>Лівого (L)</strong> та <strong>Правого (R)</strong> каналу у вкладці 1 або 2.
    </p>`;
  }

  // Check audiogram mid/high differences
  const diffs = [];
  AUDIOGRAM_FREQS.forEach((f) => {
    const lv = state.audiogram.points.L[f];
    const rv = state.audiogram.points.R[f];
    if (typeof lv === 'number' && typeof rv === 'number') {
      const d = Math.abs(lv - rv);
      if (d >= 5) diffs.push(`${f >= 1000 ? f / 1000 + 'kHz' : f + 'Hz'} (Δ ${d} dB)`);
    }
  });

  if (diffs.length > 0) {
    asymHtml += `<p style="font-size:0.83rem; color:var(--accent-amber); margin-top:6px;">
      <strong>Зони розбіжності порогу >5 dB за аудіограмою:</strong> ${diffs.join(', ')}. Враховуйте це при оцінці стереообразу.
    </p>`;
  }

  asymBox.innerHTML = asymHtml;
}

function updateEarButtonsUI() {
  document.querySelectorAll('#earSelector button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.ear === state.currentEar);
  });
  renderLimitCards();
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
    // Pro mode: random logarithmic frequency between 35 Hz and 15500 Hz
    const minLog = Math.log(35);
    const maxLog = Math.log(15500);
    const randFreq = Math.exp(minLog + Math.random() * (maxLog - minLog));
    q.secretFreq = Math.round(randFreq);
  }

  // Update UI containers for difficulty mode
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

  // Reset mystery display
  const mysteryBox = document.getElementById('quizMysteryDisplay');
  mysteryBox.classList.remove('revealed');
  document.getElementById('quizSecretFreqText').textContent = '??? Hz';
  document.getElementById('quizSecretHintText').textContent =
    'Слухайте тон (та за потреби еталон 1 kHz) і оберіть частоту нижче';
  document.getElementById('quizRoundBadge').textContent =
    `Раунд ${Math.min(q.round, q.maxRounds)} / ${q.maxRounds}`;

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
  if (q.revealed) return; // Already answered this round

  q.revealed = true;
  const secret = q.secretFreq;
  const octaveError = Math.abs(Math.log2(guessedFreq / secret));

  // Calculate score (0..100) based on octave proximity
  let pts = 0;
  if (octaveError < 0.05) {
    pts = 100;
  } else if (octaveError <= 0.36) {
    pts = 85;
  } else if (octaveError <= 0.55) {
    pts = 70;
  } else if (octaveError <= 1.02) {
    pts = 45;
  } else if (octaveError <= 1.5) {
    pts = 20;
  } else {
    pts = 0;
  }

  if (pts >= 85) {
    q.streak += 1;
  } else {
    q.streak = 0;
  }

  q.score += pts;
  q.history.push({
    round: q.history.length + 1,
    secret,
    guess: guessedFreq,
    octaveError,
    pts
  });

  // Reveal secret frequency on Mystery Deck & top readouts
  setFrequency(secret, true);
  const mysteryBox = document.getElementById('quizMysteryDisplay');
  mysteryBox.classList.add('revealed');
  document.getElementById('quizSecretFreqText').textContent =
    `${formatFreqLabel(secret)} (${Math.round(secret)} Hz)`;
  document.getElementById('quizSecretHintText').textContent =
    `${getMixingBand(secret)} • Нота: ${freqToNoteInfo(secret)}`;

  // Highlight multiple-choice buttons if applicable
  document.querySelectorAll('#quizOptionsGrid .quiz-opt-btn').forEach((btn) => {
    const bf = parseFloat(btn.dataset.freq);
    btn.disabled = true;
    if (bf === secret) {
      btn.classList.add('correct');
    } else if (btn === clickedBtn && bf !== secret) {
      btn.classList.add('wrong');
    }
  });

  // Update Feedback Banner
  const banner = document.getElementById('quizFeedbackBanner');
  banner.className = 'quiz-feedback-banner';
  if (pts === 100) {
    banner.classList.add('good');
    banner.innerHTML = `🎯 <strong>Бездоганне влучання (+100 балів)!</strong> Це дійсно <code>${formatFreqLabel(secret)}</code> (${getMixingBand(secret)}). Натисніть «Наступне питання →» для продовження.`;
  } else if (pts >= 70) {
    banner.classList.add('good');
    banner.innerHTML = `👍 <strong>Дуже близько (+${pts} балів)!</strong> Ви обрали <code>${formatFreqLabel(guessedFreq)}</code>, а звучало <code>${formatFreqLabel(secret)}</code> (похибка: ${octaveError.toFixed(2)} октави).`;
  } else if (pts >= 40) {
    banner.classList.add('warn');
    banner.innerHTML = `⚠️ <strong>Похибка в межах октави (+${pts} балів):</strong> Ваша відповідь <code>${formatFreqLabel(guessedFreq)}</code>, правильна частота — <code>${formatFreqLabel(secret)}</code> (${octaveError.toFixed(2)} октави).`;
  } else {
    banner.classList.add('bad');
    banner.innerHTML = `❌ <strong>Промах (+${pts} балів):</strong> Ви обрали <code>${formatFreqLabel(guessedFreq)}</code>, а насправді звучало <code>${formatFreqLabel(secret)}</code> (різниця ${octaveError.toFixed(2)} октави). Послухайте еталон 1 kHz для калібрування слуху!`;
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

  document.getElementById('quizTotalScore').textContent = `${q.score} / ${q.maxRounds * 100}`;
  document.getElementById('quizStreakVal').textContent = `${q.streak} 🔥`;
  document.getElementById('quizAccuracyVal').textContent =
    avgAccuracy !== null ? `${avgAccuracy}%` : '— %';

  let grade = '—';
  if (avgAccuracy !== null) {
    if (avgAccuracy >= 90) grade = 'A+ (Золоті вуха)';
    else if (avgAccuracy >= 78) grade = 'A (Відмінно)';
    else if (avgAccuracy >= 65) grade = 'B (Добре)';
    else if (avgAccuracy >= 50) grade = 'C (Задовільно)';
    else grade = 'Потрібна практика';
  }
  document.getElementById('quizGradeVal').textContent = grade;

  const tbody = document.getElementById('quizHistoryBody');
  if (count === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Ще немає відповідей у цій серії</td></tr>`;
    return;
  }

  tbody.innerHTML = q.history
    .slice()
    .reverse()
    .map(
      (item) => `
      <tr>
        <td>#${item.round}</td>
        <td><strong>${formatFreqLabel(item.secret)}</strong></td>
        <td>${formatFreqLabel(item.guess)}</td>
        <td>${item.octaveError.toFixed(2)} окт.</td>
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
  banner.innerHTML = `Нову серію з 10 питань розпочато! Натисніть <strong>«Слухати загаданий тон»</strong>.`;
}

// ==========================================
// EVENT LISTENERS & INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadSavedState();
  updateFrequencyReadouts();
  renderLimitCards();
  initSpectrumVisualizer();
  initAudiogramUI();
  initQuizUI();
  renderSoundEngineerReport();

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

  // Panic stop button
  document.getElementById('panicStopBtn').addEventListener('click', () => {
    stopOscillatorImmediate();
  });

  // Ear selector (L / L+R / R)
  document.querySelectorAll('#earSelector button').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.currentEar = btn.dataset.ear;
      updateEarButtonsUI();
      updatePanningNode();
    });
  });

  // Main logarithmic frequency slider
  const freqSlider = document.getElementById('freqLogSlider');
  freqSlider.addEventListener('input', (e) => {
    state.isSweeping = false;
    const freq = sliderToFreq(e.target.value);
    setFrequency(freq, false);
  });

  // Fine frequency step buttons
  document.querySelectorAll('.fine-step-btns button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const step = parseFloat(btn.dataset.step);
      setFrequency(state.currentFreq + step, true);
    });
  });

  // Tone mode selector (Pure Sine / Warble / Pulsed)
  document.getElementById('toneModeSelect').addEventListener('change', (e) => {
    state.toneMode = e.target.value;
    if (state.isPlaying) {
      startOscillator();
    }
  });

  // Toggle tone generator button
  document.getElementById('toggleToneBtn').addEventListener('click', () => {
    if (state.isPlaying) {
      stopOscillatorImmediate();
    } else {
      startOscillator();
    }
  });

  // Automated Sweeps
  document.getElementById('startLowSweepBtn').addEventListener('click', () => {
    startFrequencySweep(120, 15);
  });

  document.getElementById('startHighSweepBtn').addEventListener('click', () => {
    startFrequencySweep(8000, 22000);
  });

  document.getElementById('startFullSweepBtn').addEventListener('click', () => {
    startFrequencySweep(20, 22000);
  });

  // Capture Low & High Hearing Limits
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

  // Quick frequency preset pills
  document.querySelectorAll('#quickFreqPills button').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.isSweeping = false;
      const f = parseFloat(btn.dataset.freq);
      setFrequency(f, true);
      if (!state.isPlaying) startOscillator();
    });
  });

  // Audiogram Controls
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
    if (state.audiogram.isPlayingAg) {
      stopOscillatorImmediate();
    } else {
      playAudiogramTone();
    }
  });

  document.getElementById('agRecordPointBtn').addEventListener('click', () => {
    const freq = AUDIOGRAM_FREQS[state.audiogram.activeFreqIndex];
    const ear = state.audiogram.activeEar;
    state.audiogram.points[ear][freq] = state.audiogram.currentDb;
    saveState();
    drawAudiogramCanvas();
    renderSoundEngineerReport();

    // Advance to next frequency automatically
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
    if (state.quiz.isPlayingMystery) {
      playQuizMysteryTone();
    }
  });

  document.getElementById('quizPlayMysteryBtn').addEventListener('click', () => {
    if (state.quiz.isPlayingMystery) {
      stopOscillatorImmediate();
    } else {
      playQuizMysteryTone();
    }
  });

  document.getElementById('quizPlayRefBtn').addEventListener('click', () => {
    if (state.quiz.isPlayingRef) {
      stopOscillatorImmediate();
    } else {
      playQuizReferenceTone();
    }
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

  // Print / Save PDF Report
  document.getElementById('printReportBtn').addEventListener('click', () => {
    window.print();
  });

  // Studio Keyboard Shortcuts
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

  // PWA Install Prompt & Offline Service Worker Registration
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



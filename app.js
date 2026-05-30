/**
 * Aurora Dashboard - Unified JavaScript Controller
 * High-performance, offline-capable, glassmorphic widget orchestrator.
 */

// --- 1. Global State Management & Persistence ---
const DEFAULT_STATE = {
  themeHue: 165,
  glassOpacity: 0.45,
  flowSpeed: 25,
  userName: 'Captain',
  monospaceNotes: false,
  notesText: 'Welcome to your Aurora Scratchpad!\n\n• Jot down quick ideas here.\n• State is autosaved as you type.\n• Toggle code monospace in the bottom right.\n\nEnjoy your workspace!',
  bookmarks: [
    { id: '1', title: 'GitHub', url: 'https://github.com', emoji: '💻' },
    { id: '2', title: 'Google', url: 'https://google.com', emoji: '🔍' },
    { id: '3', title: 'YouTube', url: 'https://youtube.com', emoji: '📺' },
    { id: '4', title: 'Spotify', url: 'https://open.spotify.com', emoji: '🎵' }
  ],
  tasks: [
    { id: 't1', text: 'Customize your dashboard accent color', column: 'today', completed: false, priority: 'high' },
    { id: 't2', text: 'Synthesize ambient rain and practice focus', column: 'today', completed: false, priority: 'medium' },
    { id: 't3', text: 'Bookmark your favorite search engines', column: 'backlog', completed: false, priority: 'low' },
    { id: 't4', text: 'Clear this task when finished', column: 'backlog', completed: true, priority: 'low' }
  ]
};

let state = {};

function initStorage() {
  const local = localStorage.getItem('aurora_dashboard_state');
  if (local) {
    try {
      state = JSON.parse(local);
      // Ensure migrations/defaults for any missing properties
      state = { ...DEFAULT_STATE, ...state };
    } catch (e) {
      state = { ...DEFAULT_STATE };
    }
  } else {
    state = { ...DEFAULT_STATE };
  }
}

function saveToStorage() {
  localStorage.setItem('aurora_dashboard_state', JSON.stringify(state));
}

// --- 2. Theme & Customization Controller ---
const swatches = document.querySelectorAll('.theme-swatch');
const opacitySlider = document.getElementById('opacity-slider');
const opacityValueLabel = document.getElementById('opacity-value-label');
const speedSlider = document.getElementById('speed-slider');
const speedValueLabel = document.getElementById('speed-value-label');
const settingsNameInput = document.getElementById('settings-name-input');

function applyStyles() {
  // 1. Apply accent theme hue
  document.documentElement.style.setProperty('--accent-hue', state.themeHue);
  // Calculate specific analogous accents for glass gradients
  document.documentElement.style.setProperty('--accent-secondary', `hsl(${parseInt(state.themeHue) + 40}, 100%, 55%)`);
  
  // Set RGB fallback string for overlays
  let rgb = "0, 255, 170"; // Teal
  if (state.themeHue == 280) rgb = "171, 71, 188"; // Violet
  if (state.themeHue == 35) rgb = "255, 167, 38"; // Orange
  if (state.themeHue == 195) rgb = "38, 198, 218"; // Cyan
  if (state.themeHue == 350) rgb = "255, 82, 82"; // Peach
  document.documentElement.style.setProperty('--accent-primary-rgb', rgb);

  // 2. Apply Glass Opacity
  document.documentElement.style.setProperty('--glass-opacity', state.glassOpacity);
  opacitySlider.value = state.glassOpacity * 100;
  opacityValueLabel.textContent = `${Math.round(state.glassOpacity * 100)}%`;

  // 3. Apply Background Speed
  document.documentElement.style.setProperty('--anim-speed', `${state.flowSpeed}s`);
  speedSlider.value = state.flowSpeed;
  
  let speedText = 'Medium';
  if (state.flowSpeed > 45) speedText = 'Calm / Frozen';
  else if (state.flowSpeed > 30) speedText = 'Slow Breeze';
  else if (state.flowSpeed < 18) speedText = 'Dynamic Flow';
  speedValueLabel.textContent = speedText;

  // 4. Update greeting names
  settingsNameInput.value = state.userName;
}

function initThemeListeners() {
  // Theme swatches
  swatches.forEach(swatch => {
    if (swatch.dataset.hue == state.themeHue) {
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
    }
    swatch.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      state.themeHue = swatch.dataset.hue;
      saveToStorage();
      applyStyles();
    });
  });

  // Opacity Slider
  opacitySlider.addEventListener('input', (e) => {
    state.glassOpacity = e.target.value / 100;
    saveToStorage();
    applyStyles();
  });

  // Speed Slider
  speedSlider.addEventListener('input', (e) => {
    state.flowSpeed = e.target.value;
    saveToStorage();
    applyStyles();
  });

  // Name Input
  settingsNameInput.addEventListener('input', (e) => {
    state.userName = e.target.value || 'Captain';
    saveToStorage();
    updateClockAndGreeting(); // Update header welcome instantly
  });
}

// --- 3. Clock & Greeting Module ---
const hoursEl = document.getElementById('clock-hours');
const minutesEl = document.getElementById('clock-minutes');
const secondsEl = document.getElementById('clock-seconds');
const periodEl = document.getElementById('clock-period');
const dateDisplayEl = document.getElementById('clock-date-display');
const greetingDisplayEl = document.getElementById('greeting-display');

function updateClockAndGreeting() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  // Format to 12-hour clock
  hours = hours % 12;
  hours = hours ? hours : 12; // '0' should be '12'
  const hoursStr = hours.toString().padStart(2, '0');

  // Update clock DOM
  if (hoursEl) hoursEl.textContent = hoursStr;
  if (minutesEl) minutesEl.textContent = minutes;
  if (secondsEl) secondsEl.textContent = seconds;
  if (periodEl) periodEl.textContent = ampm;

  // Format Calendar date (e.g. Wednesday, May 20)
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  dateDisplayEl.textContent = now.toLocaleDateString('en-US', options);

  // Dynamic Greeting based on time
  const currentHour = now.getHours();
  let greeting = "Good evening";
  if (currentHour >= 5 && currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good afternoon";
  }
  
  greetingDisplayEl.textContent = `${greeting}, ${state.userName}`;
}

// --- 4. Customized SVG Weather Widget ---
const weatherIconContainer = document.getElementById('weather-icon-svg');
const weatherTempDisplay = document.getElementById('weather-temp-display');
const weatherDescDisplay = document.getElementById('weather-desc-display');
const weatherHumidity = document.getElementById('weather-humidity');
const weatherWind = document.getElementById('weather-wind');
const weatherUv = document.getElementById('weather-uv');
const forecastAccordion = document.getElementById('weather-forecast');
const toggleForecastBtn = document.getElementById('toggle-forecast-btn');

const WEATHER_SVGS = {
  sunny: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="70" height="70" class="sun-icon">
      <circle cx="50" cy="50" r="18" fill="var(--accent-primary)" filter="drop-shadow(0 0 8px var(--accent-glow))" />
      <g stroke="var(--accent-primary)" stroke-width="4" stroke-linecap="round">
        <line x1="50" y1="12" x2="50" y2="22" />
        <line x1="50" y1="78" x2="50" y2="88" />
        <line x1="12" y1="50" x2="22" y2="50" />
        <line x1="78" y1="50" x2="88" y2="50" />
        <line x1="23" y1="23" x2="30" y2="30" />
        <line x1="70" y1="70" x2="77" y2="77" />
        <line x1="77" y1="23" x2="70" y2="30" />
        <line x1="30" y1="70" x2="23" y2="77" />
      </g>
    </svg>`,
  rainy: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="70" height="70">
      <path d="M30 65a12 12 0 0 1 0-24h.14A16 16 0 0 1 61.6 34.6 13 13 0 0 1 74 48a12 12 0 0 1-12 12m-32 5h32" fill="none" stroke="#6b7280" stroke-width="5" stroke-linejoin="round"/>
      <path d="M35 70l-3 10M50 72l-3 10M65 70l-3 10" stroke="var(--accent-primary)" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
  cloudy: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="70" height="70">
      <path d="M32 60a12 12 0 0 1 0-24h.14A16 16 0 0 1 63.6 29.6 13 13 0 0 1 76 43a12 12 0 0 1-12 12m-32 5h32" fill="none" stroke="var(--accent-primary)" stroke-width="5" stroke-linejoin="round"/>
      <path d="M22 68a10 10 0 0 1 0-20h.1a13 13 0 0 1 25.6-3.7A11 11 0 0 1 58 54a10 10 0 0 1-10 10" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="4" stroke-linejoin="round" />
    </svg>`,
  misty: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="70" height="70">
      <g stroke="var(--accent-primary)" stroke-width="5" stroke-linecap="round">
        <line x1="25" y1="35" x2="75" y2="35" stroke-dasharray="10 5" />
        <line x1="20" y1="48" x2="80" y2="48" />
        <line x1="30" y1="61" x2="70" y2="61" stroke-dasharray="5 8 10" />
      </g>
    </svg>`
};

function renderWeather() {
  // Let's create cozy preset states based on theme Hue so the dashboard matches visually!
  let weather = {
    temp: '68°F',
    desc: 'Mild Aurora Breeze',
    humidity: '48%',
    wind: '7 mph',
    uv: 'Low',
    icon: 'sunny',
    forecast: [
      { day: 'Tomorrow', icon: 'sunny', temps: '72° / 58°' },
      { day: 'Friday', icon: 'cloudy', temps: '69° / 55°' },
      { day: 'Saturday', icon: 'rainy', temps: '74° / 60°' }
    ]
  };

  // Alter weather description depending on chosen theme to look super cool!
  if (state.themeHue == 280) {
    weather.temp = '64°F';
    weather.desc = 'Cosmic Violet Fog';
    weather.humidity = '70%';
    weather.wind = '4 mph';
    weather.uv = 'None';
    weather.icon = 'misty';
  } else if (state.themeHue == 350) {
    weather.temp = '75°F';
    weather.desc = 'Peach Sunset Warmth';
    weather.humidity = '35%';
    weather.wind = '12 mph';
    weather.uv = 'High';
    weather.icon = 'sunny';
  } else if (state.themeHue == 35) {
    weather.temp = '81°F';
    weather.desc = 'Solar Flare Heat';
    weather.humidity = '20%';
    weather.wind = '15 mph';
    weather.uv = 'Extremely High';
    weather.icon = 'sunny';
  }

  // Populate basic weather content
  weatherTempDisplay.textContent = weather.temp;
  weatherDescDisplay.textContent = weather.desc;
  weatherHumidity.textContent = weather.humidity;
  weatherWind.textContent = weather.wind;
  weatherUv.textContent = weather.uv;
  weatherIconContainer.innerHTML = WEATHER_SVGS[weather.icon];

  // Populate 3-day forecast SVGs
  weather.forecast.forEach((fc, idx) => {
    const iconEl = document.getElementById(`forecast-icon-${idx + 1}`);
    if (iconEl) {
      iconEl.innerHTML = WEATHER_SVGS[fc.icon];
    }
  });

  // Handle Accordion Toggles
  toggleForecastBtn.addEventListener('click', () => {
    const isHidden = forecastAccordion.style.display === 'none';
    if (isHidden) {
      forecastAccordion.style.display = 'flex';
      toggleForecastBtn.style.transform = 'rotate(180deg)';
    } else {
      forecastAccordion.style.display = 'none';
      toggleForecastBtn.style.transform = 'rotate(0deg)';
    }
  });
}

// --- 5. Pomodoro Timer & Synthesized Ambient Soundscape ---
const timerCountdown = document.getElementById('timer-countdown');
const timerStateLabel = document.getElementById('timer-state-label');
const timerStartBtn = document.getElementById('timer-start-btn');
const timerResetBtn = document.getElementById('timer-reset-btn');
const timerProgressRing = document.getElementById('timer-progress-ring');
const soundToggleBtn = document.getElementById('ambient-sound-toggle');
const soundSelect = document.getElementById('ambient-sound-select');
const modeButtons = document.querySelectorAll('.timer-mode-btn');

let timerInterval = null;
let timerRunning = false;
let currentMode = 'work'; // work, short, long
let timeLeft = 25 * 60; // seconds

const TIMER_CONFIGS = {
  work: { label: 'Focusing', duration: 25 * 60 },
  short: { label: 'Short Break', duration: 5 * 60 },
  long: { label: 'Long Break', duration: 15 * 60 }
};

// Circumference of radial circle = 2 * PI * r = 2 * PI * 45 = 282.74
const RING_CIRCUMFERENCE = 282.743;

function updateTimerRing() {
  const maxTime = TIMER_CONFIGS[currentMode].duration;
  const percentage = timeLeft / maxTime;
  const offset = RING_CIRCUMFERENCE * (1 - percentage);
  timerProgressRing.style.strokeDashoffset = offset;
}

function renderTimerText() {
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  timerCountdown.textContent = `${mins}:${secs}`;
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerStartBtn.textContent = 'Pause';
  timerStartBtn.classList.replace('btn-primary', 'btn-secondary');

  timerInterval = setInterval(() => {
    timeLeft--;
    renderTimerText();
    updateTimerRing();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerStartBtn.textContent = 'Start';
      timerStartBtn.classList.replace('btn-secondary', 'btn-primary');
      triggerCompletionTone();
      alert(`Time for ${currentMode === 'work' ? 'a break' : 'some focus'}!`);
      resetTimerMode();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerStartBtn.textContent = 'Start';
  timerStartBtn.classList.replace('btn-secondary', 'btn-primary');
}

function resetTimerMode() {
  pauseTimer();
  timeLeft = TIMER_CONFIGS[currentMode].duration;
  timerStateLabel.textContent = TIMER_CONFIGS[currentMode].label;
  renderTimerText();
  updateTimerRing();
}

function initTimerListeners() {
  timerStartBtn.addEventListener('click', () => {
    if (timerRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  timerResetBtn.addEventListener('click', resetTimerMode);

  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      resetTimerMode();
    });
  });

  resetTimerMode();
  initAmbientSynthesizer();
}

/**
 * --- Ambient Soundscapes via Web Audio API ---
 * A fully self-contained synthesis engine producing rain, ocean waves,
 * white and brown ambient focus noises entirely offline with zero external audio assets.
 */
let audioCtx = null;
let soundNodes = [];
let ambientPlaying = false;

function initAmbientSynthesizer() {
  soundToggleBtn.addEventListener('click', () => {
    if (ambientPlaying) {
      stopAmbient();
    } else {
      startAmbient();
    }
  });

  soundSelect.addEventListener('change', () => {
    if (ambientPlaying) {
      stopAmbient();
      startAmbient();
    }
  });
}

function createNoiseBuffer(type) {
  if (!audioCtx) return null;
  const bufferSize = 2 * audioCtx.sampleRate;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    if (type === 'white') {
      output[i] = white;
    } else if (type === 'brown') {
      // Brown noise filter (integrator of white noise)
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Compensate volume loss
    }
  }
  return noiseBuffer;
}

function startAmbient() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const soundType = soundSelect.value;
  ambientPlaying = true;
  soundToggleBtn.classList.add('active');

  const mainGain = audioCtx.createGain();
  mainGain.gain.setValueAtTime(0.12, audioCtx.currentTime); // keep volume subtle
  mainGain.connect(audioCtx.destination);
  soundNodes.push(mainGain);

  if (soundType === 'white' || soundType === 'brown') {
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = createNoiseBuffer(soundType);
    noiseSource.loop = true;
    noiseSource.connect(mainGain);
    noiseSource.start(0);
    soundNodes.push(noiseSource);
  } else if (soundType === 'rain') {
    // Generate Rain: Brown noise background + periodic high frequency crackles
    const brownNoise = audioCtx.createBufferSource();
    brownNoise.buffer = createNoiseBuffer('brown');
    brownNoise.loop = true;
    
    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(600, audioCtx.currentTime);

    brownNoise.connect(lowpass);
    lowpass.connect(mainGain);
    brownNoise.start(0);
    soundNodes.push(brownNoise);

    // Rain drop crackles (random ticks using an oscillator that triggers)
    const crackleInterval = setInterval(() => {
      if (!ambientPlaying) {
        clearInterval(crackleInterval);
        return;
      }
      playRaindropTick(mainGain);
    }, 45);
    
    // Storing interval reference as an object with close trigger
    soundNodes.push({ stop: () => clearInterval(crackleInterval) });

  } else if (soundType === 'ocean') {
    // Ocean surf: LFO sweeping a bandpass-filtered brown noise generator
    const brownNoise = audioCtx.createBufferSource();
    brownNoise.buffer = createNoiseBuffer('brown');
    brownNoise.loop = true;

    const sweepFilter = audioCtx.createBiquadFilter();
    sweepFilter.type = 'bandpass';
    sweepFilter.Q.setValueAtTime(1.5, audioCtx.currentTime);

    // LFO Oscillator to sweep the filter frequency
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, audioCtx.currentTime); // Slow 12-second swell cycles

    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(250, audioCtx.currentTime); // Sweep range (Hz)

    lfo.connect(lfoGain);
    lfoGain.connect(sweepFilter.frequency); // Connect LFO to filter frequency
    sweepFilter.frequency.setValueAtTime(400, audioCtx.currentTime); // Base center frequency

    brownNoise.connect(sweepFilter);
    sweepFilter.connect(mainGain);
    
    lfo.start(0);
    brownNoise.start(0);

    soundNodes.push(brownNoise, lfo, sweepFilter);
  }
}

function playRaindropTick(outputNode) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1500 + Math.random() * 2000, audioCtx.currentTime); // High pitch click
  
  gain.gain.setValueAtTime(0.005 + Math.random() * 0.008, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.04); // Fast decay
  
  osc.connect(gain);
  gain.connect(outputNode);
  
  osc.start(0);
  osc.stop(audioCtx.currentTime + 0.05);
}

function stopAmbient() {
  ambientPlaying = false;
  soundToggleBtn.classList.remove('active');
  soundNodes.forEach(node => {
    try {
      if (node.stop) node.stop();
      if (node.disconnect) node.disconnect();
    } catch(e){}
  });
  soundNodes = [];
}

function triggerCompletionTone() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5

  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(audioCtx.destination);

  osc1.start();
  osc2.start();
  osc1.stop(audioCtx.currentTime + 1.5);
  osc2.stop(audioCtx.currentTime + 1.5);
}

// --- 6. Kanban-Style Task Board Module ---
const listBacklog = document.getElementById('list-backlog');
const listToday = document.getElementById('list-today');
const newTaskInput = document.getElementById('new-task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const totalProgressCounter = document.getElementById('total-progress-counter');
const countBacklog = document.getElementById('count-backlog');
const countToday = document.getElementById('count-today');
const priorityButtons = document.querySelectorAll('.priority-btn');

let selectedPriority = 'medium';

function initKanban() {
  priorityButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      priorityButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPriority = btn.dataset.priority;
    });
  });

  newTaskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addNewTask();
    }
  });

  addTaskBtn.addEventListener('click', addNewTask);

  renderTasks();
}

function addNewTask() {
  const text = newTaskInput.value.trim();
  if (!text) return;

  const newTask = {
    id: 't_' + Date.now(),
    text: text,
    column: 'backlog',
    completed: false,
    priority: selectedPriority
  };

  state.tasks.push(newTask);
  newTaskInput.value = '';
  saveToStorage();
  renderTasks();
}

function renderTasks() {
  // Clear lists
  listBacklog.innerHTML = '';
  listToday.innerHTML = '';

  let backlogCount = 0;
  let todayCount = 0;
  let completedCount = 0;

  state.tasks.forEach(task => {
    if (task.completed) completedCount++;

    const card = document.createElement('div');
    card.className = `kanban-card ${task.completed ? 'completed' : ''}`;
    card.draggable = true;
    card.dataset.id = task.id;
    card.innerHTML = `
      <div class="task-card-main">
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Toggle Complete">
        <span class="task-text">${escapeHtml(task.text)}</span>
      </div>
      <div class="task-card-footer">
        <span class="task-badge badge-${task.priority}">${task.priority}</span>
        <div class="task-actions">
          <button class="task-action-btn delete-task-btn" title="Delete Task">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Hook Checkbox Toggle
    const chk = card.querySelector('.task-checkbox');
    chk.addEventListener('change', () => {
      task.completed = chk.checked;
      saveToStorage();
      renderTasks();
    });

    // Hook Delete Button
    const delBtn = card.querySelector('.delete-task-btn');
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.tasks = state.tasks.filter(t => t.id !== task.id);
      saveToStorage();
      renderTasks();
    });

    // Double-click to quick swap columns
    card.addEventListener('dblclick', () => {
      task.column = task.column === 'backlog' ? 'today' : 'backlog';
      saveToStorage();
      renderTasks();
    });

    // Drag-and-drop mechanics
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', task.id);
      card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });

    if (task.column === 'backlog') {
      listBacklog.appendChild(card);
      backlogCount++;
    } else {
      listToday.appendChild(card);
      todayCount++;
    }
  });

  // Update Counters
  countBacklog.textContent = backlogCount;
  countToday.textContent = todayCount;
  totalProgressCounter.textContent = `${completedCount} / ${state.tasks.length} Done`;
}

// Setup Drag targets
[listBacklog, listToday].forEach(list => {
  list.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  list.addEventListener('drop', (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const column = list.dataset.column;
    const task = state.tasks.find(t => t.id === taskId);
    
    if (task && task.column !== column) {
      task.column = column;
      saveToStorage();
      renderTasks();
    }
  });
});

// --- 7. Scratchpad Module ---
const notesTextarea = document.getElementById('notes-textarea-input');
const notesStatus = document.getElementById('notes-status-text');
const toggleMonospaceBtn = document.getElementById('toggle-monospace-btn');
const clearNotesBtn = document.getElementById('clear-notes-btn');

let saveTimeout = null;

function initScratchpad() {
  notesTextarea.value = state.notesText;
  if (state.monospaceNotes) {
    notesTextarea.classList.add('monospace');
  }

  // Handle Debounced Save on Text Input
  notesTextarea.addEventListener('input', (e) => {
    notesStatus.textContent = 'Saving...';
    clearTimeout(saveTimeout);
    
    saveTimeout = setTimeout(() => {
      state.notesText = e.target.value;
      saveToStorage();
      notesStatus.textContent = 'Saved';
    }, 600); // 600ms debounce
  });

  // Toggle Monospace formatting style
  toggleMonospaceBtn.addEventListener('click', () => {
    state.monospaceNotes = !state.monospaceNotes;
    saveToStorage();
    if (state.monospaceNotes) {
      notesTextarea.classList.add('monospace');
    } else {
      notesTextarea.classList.remove('monospace');
    }
  });

  // Clear note button
  clearNotesBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your scratchpad?')) {
      notesTextarea.value = '';
      state.notesText = '';
      saveToStorage();
      notesStatus.textContent = 'Cleared';
    }
  });
}

// --- 8. Bookmark Board Launchpad Module ---
const bookmarksGrid = document.getElementById('bookmarks-grid-container');
const addBookmarkBtn = document.getElementById('open-bookmark-modal-btn');
const bookmarkModal = document.getElementById('bookmark-modal');
const closeBookmarkBtn = document.getElementById('close-bookmark-modal-btn');
const saveBookmarkBtn = document.getElementById('save-bookmark-btn');

const bookmarkTitleInput = document.getElementById('bookmark-title-input');
const bookmarkUrlInput = document.getElementById('bookmark-url-input');
const bookmarkEmojiInput = document.getElementById('bookmark-emoji-input');

function initBookmarks() {
  addBookmarkBtn.addEventListener('click', () => {
    // Open Dialog
    bookmarkModal.classList.add('active');
    bookmarkModal.showModal();
  });

  closeBookmarkBtn.addEventListener('click', closeBookmarkModal);
  
  saveBookmarkBtn.addEventListener('click', () => {
    let url = bookmarkUrlInput.value.trim();
    const title = bookmarkTitleInput.value.trim();
    let emoji = bookmarkEmojiInput.value.trim() || '🌐';

    if (!url || !title) {
      alert('Please fill in both the Site Title and Web Address.');
      return;
    }

    // Auto prepend HTTP protocol if absent
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    const newBookmark = {
      id: 'b_' + Date.now(),
      title: title,
      url: url,
      emoji: emoji
    };

    state.bookmarks.push(newBookmark);
    saveToStorage();
    renderBookmarks();
    closeBookmarkModal();
  });

  renderBookmarks();
}

function closeBookmarkModal() {
  bookmarkModal.classList.remove('active');
  bookmarkModal.close();
  bookmarkTitleInput.value = '';
  bookmarkUrlInput.value = '';
  bookmarkEmojiInput.value = '';
}

function renderBookmarks() {
  // Clear dynamically loaded bookmarks, leaving the "Add Bookmark" button intact
  const dynamicTiles = bookmarksGrid.querySelectorAll('.bookmark-tile:not(.bookmark-adder-tile)');
  dynamicTiles.forEach(t => t.remove());

  state.bookmarks.forEach(bm => {
    const tile = document.createElement('a');
    tile.className = 'bookmark-tile';
    tile.href = bm.url;
    tile.target = '_blank';
    tile.rel = 'noopener noreferrer';
    tile.innerHTML = `
      <button class="bookmark-delete-btn" title="Remove Link">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div class="bookmark-icon-box">${escapeHtml(bm.emoji)}</div>
      <span class="bookmark-name">${escapeHtml(bm.title)}</span>
    `;

    // Delete bookmark interceptor
    const delBtn = tile.querySelector('.bookmark-delete-btn');
    delBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      state.bookmarks = state.bookmarks.filter(b => b.id !== bm.id);
      saveToStorage();
      renderBookmarks();
    });

    // Ingress tile before the Add button
    bookmarksGrid.insertBefore(tile, addBookmarkBtn);
  });
}

// --- 9. Drawer Panels Toggles (Settings Panel) ---
const settingsPanel = document.getElementById('settings-panel');
const openSettingsBtn = document.getElementById('open-settings-btn');
const closeSettingsBtn = document.getElementById('close-settings-btn');

function initDrawer() {
  openSettingsBtn.addEventListener('click', () => {
    settingsPanel.classList.add('active');
  });

  closeSettingsBtn.addEventListener('click', () => {
    settingsPanel.classList.remove('active');
  });

  // Close when clicking outside of the active panel container
  document.addEventListener('click', (e) => {
    if (settingsPanel.classList.contains('active') && 
        !settingsPanel.contains(e.target) && 
        !openSettingsBtn.contains(e.target)) {
      settingsPanel.classList.remove('active');
    }
  });
}

// --- Helper Functions ---
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// --- 10. Master Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  applyStyles();
  initThemeListeners();
  
  // Real-time Clock loop
  updateClockAndGreeting();
  setInterval(updateClockAndGreeting, 1000);

  // Widget Renders
  renderWeather();
  initTimerListeners();
  initKanban();
  initScratchpad();
  initBookmarks();
  initDrawer();
});

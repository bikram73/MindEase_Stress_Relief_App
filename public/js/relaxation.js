// ------------------- EXISTING SELECTORS -------------------
const circle = document.getElementById("breathingCircle");
const phaseText = document.getElementById("phaseText");
const startBtn = document.getElementById("startBtn");
const bgMusic = document.getElementById("bgMusic");
const timerInput = document.getElementById("timerInput");
const toggleMusicBtn = document.getElementById("toggleMusicBtn");
const musicSelect = document.getElementById("musicSelect");

const STORAGE_KEYS = {
  activity: 'mindease_activity'
};

// ------------------- MINI GAME SELECTORS -------------------
const openGameBtn = document.getElementById("openGameBtn");
const gameModal = document.getElementById("gameModal");
const closeModal = document.getElementById("closeModal");
const gameArea = document.getElementById("gameArea");
const startGameBtn = document.getElementById("startGameBtn");
const scoreText = document.getElementById("scoreText");

let isRunning = false;
let breathingInterval;
let timerTimeout;

// ---------------- SESSION (client-side via cookie) ----------------
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}
function deleteCookie(name) { document.cookie = name + '=; Max-Age=0; path=/'; }

if (!getCookie('username')) {
  // require a username on landing
  window.location.href = '/index.html';
}

function readStorage(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function addActivity(text) {
  const list = readStorage(STORAGE_KEYS.activity, []);
  list.push({ text, date: new Date().toISOString() });
  writeStorage(STORAGE_KEYS.activity, list.slice(-6));
}

// ---------------- LOGOUT ----------------
// Logout button removed from UI — navigation handled via landing page

// ---------------- BREATHING ANIMATION ----------------
function startBreathing() {
  if (isRunning) return;

  const duration = parseInt(timerInput.value) * 60 * 1000;
  if (isNaN(duration) || duration <= 0) {
    alert("Please enter a valid duration in minutes.");
    return;
  }

  isRunning = true;
  startBtn.disabled = true;
  phaseText.textContent = "Inhale... 🌬️";

  let phase = "inhale";
  let cycle = 0;

  breathingInterval = setInterval(() => {
    if (phase === "inhale") {
      circle.classList.add("inhale");
      circle.classList.remove("exhale");
      phaseText.textContent = "Inhale... 🌿";
      phase = "hold";
    } else if (phase === "hold") {
      circle.classList.remove("inhale");
      phaseText.textContent = "Hold... 🕊️";
      phase = "exhale";
    } else {
      circle.classList.add("exhale");
      circle.classList.remove("inhale");
      phaseText.textContent = "Exhale... 😌";
      phase = "inhale";
      cycle++;
    }
  }, 4000);

  timerTimeout = setTimeout(() => {
    clearInterval(breathingInterval);
    bgMusic.pause();
    bgMusic.currentTime = 0;
    circle.classList.remove("inhale", "exhale");
    phaseText.textContent = "Session Complete 🌸";
    startBtn.disabled = false;
    isRunning = false;
    addActivity('Completed a breathing session');
  }, duration);
}

// ---------------- MUSIC TOGGLE ----------------
toggleMusicBtn.addEventListener("click", async () => {
  if (bgMusic.paused) {
    try {
      bgMusic.volume = 0.5;
      await bgMusic.play();
      toggleMusicBtn.textContent = "Music Off";
    } catch (err) {
      alert("Browser blocked autoplay. Please click again to start music.");
    }
  } else {
    bgMusic.pause();
    toggleMusicBtn.textContent = "Music On";
  }
});

// ---------------- MUSIC SELECTION ----------------
musicSelect.addEventListener("change", () => {
  const selectedTrack = musicSelect.value;
  bgMusic.src = selectedTrack;
  bgMusic.currentTime = 0;

  if (!bgMusic.paused) bgMusic.play();
});

startBtn.addEventListener("click", startBreathing);

bgMusic.src = musicSelect.value;

// ---------------- MINI-GAME LOGIC ----------------
// ---------------- MINI-GAME LOGIC ----------------
openGameBtn.addEventListener("click", () => {
  gameModal.style.display = "flex";
  document.getElementById("timeLeft").textContent = "Time Left: 15s";
});
closeModal.addEventListener("click", () => {
  gameModal.style.display = "none";
  clearGame();
});
window.addEventListener("click", (e) => {
  if (e.target === gameModal) {
    gameModal.style.display = "none";
    clearGame();
  }
});

let score = 0;
let dotTimeout;
let gameTimer;
let timeLeft = 15;
let gameActive = false;

function startGame() {
  if (gameActive) return;
  gameActive = true;
  score = 0;
  timeLeft = 15;
  scoreText.textContent = "Score: 0";
  startGameBtn.disabled = true;
  document.getElementById("timeLeft").textContent = `Time Left: ${timeLeft}s`;

  spawnDot();

  // countdown timer
  gameTimer = setInterval(() => {
    timeLeft--;
    document.getElementById("timeLeft").textContent = `Time Left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function spawnDot() {
  gameArea.innerHTML = "";
  const dot = document.createElement("div");
  dot.classList.add("dot");

  const x = Math.random() * (gameArea.clientWidth - 30);
  const y = Math.random() * (gameArea.clientHeight - 30);
  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;

  dot.addEventListener("click", () => {
    if (!gameActive) return;
    score++;
    scoreText.textContent = `Score: ${score}`;
    spawnDot();
  });

  gameArea.appendChild(dot);
}

function endGame() {
  gameActive = false;
  clearInterval(gameTimer);
  gameArea.innerHTML = "";
  scoreText.textContent += " | ⏳ Time’s up!";
  startGameBtn.disabled = false;
  addActivity(`Focused in mini-game (score ${score})`);
}

function clearGame() {
  gameActive = false;
  clearInterval(gameTimer);
  clearTimeout(dotTimeout);
  gameArea.innerHTML = "";
  scoreText.textContent = "Score: 0";
  startGameBtn.disabled = false;
  document.getElementById("timeLeft").textContent = "Time Left: 15s";
}

startGameBtn.addEventListener("click", startGame);



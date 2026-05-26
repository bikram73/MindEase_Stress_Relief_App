const quizContainer = document.getElementById("quizContainer");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const resultContainer = document.getElementById("resultContainer");
const resultText = document.getElementById("resultText");
const restartBtn = document.getElementById("restartBtn");

const ACTIVITY_KEY = 'mindease_activity';

let currentQ = 0;
let score = 0;

// ----------------- QUESTIONS -----------------
const questions = [
  { q: "How often do you feel overwhelmed?", options: ["Rarely", "Sometimes", "Often", "Almost always"], score: [1, 2, 3, 4] },
  { q: "How well are you sleeping lately?", options: ["Very well", "Fair", "Poorly", "Barely at all"], score: [1, 2, 3, 4] },
  { q: "How is your energy level during the day?", options: ["High", "Moderate", "Low", "Exhausted"], score: [1, 2, 3, 4] },
  { q: "Do you find it hard to relax?", options: ["Not at all", "Sometimes", "Often", "Always"], score: [1, 2, 3, 4] },
  { q: "Do small issues make you irritated?", options: ["Rarely", "Sometimes", "Often", "Always"], score: [1, 2, 3, 4] },
  { q: "How often do you experience headaches or tension?", options: ["Rarely", "Occasionally", "Frequently", "Daily"], score: [1, 2, 3, 4] },
  { q: "How is your appetite lately?", options: ["Normal", "Slightly affected", "Low", "Very poor"], score: [1, 2, 3, 4] },
  { q: "Do you have trouble focusing?", options: ["No", "Sometimes", "Often", "Constantly"], score: [1, 2, 3, 4] },
  { q: "How optimistic do you feel?", options: ["Very", "Somewhat", "Rarely", "Not at all"], score: [1, 2, 3, 4] },
  { q: "Do you feel supported by people around you?", options: ["Yes, completely", "Mostly", "Not much", "No"], score: [1, 2, 3, 4] },
];

// ----------------- LOGOUT -----------------
function deleteCookie(name) { document.cookie = name + '=; Max-Age=0; path=/'; }
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Logout removed from pages; keep cookie helpers above for redirects

// redirect to landing if no username
if (!getCookie('username')) window.location.href = '/index.html';

// ----------------- QUIZ LOGIC -----------------
function loadQuestion() {
  const q = questions[currentQ];
  quizContainer.innerHTML = `
    <h3>${q.q}</h3>
    ${q.options
      .map(
        (opt, i) =>
          `<button class="option" data-score="${q.score[i]}">${opt}</button>`
      )
      .join("")}
  `;
  progressBar.style.width = `${((currentQ + 1) / questions.length) * 100}%`;
  progressText.textContent = `Question ${currentQ + 1} of ${questions.length}`;

  document.querySelectorAll(".option").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      score += parseInt(e.target.getAttribute("data-score"));
      currentQ++;
      if (currentQ < questions.length) {
        loadQuestion();
      } else {
        showResult();
      }
    })
  );
}

function showResult() {
  quizContainer.classList.add("hidden");
  resultContainer.classList.remove("hidden");

  let level = "";
  let color = "";
  const styles = getComputedStyle(document.documentElement);
  const lowBg = styles.getPropertyValue('--low-bg').trim() || '#c8e6c9';
  const moderateBg = styles.getPropertyValue('--moderate-bg').trim() || '#fff9c4';
  const highBg = styles.getPropertyValue('--high-bg').trim() || '#ffcdd2';

  if (score <= 15) { level = "Low Stress - You're doing great. Keep it up."; color = lowBg; }
  else if (score <= 25) { level = "Moderate Stress - Try a short breathing or stretch break."; color = moderateBg; }
  else { level = "High Stress - Pause, breathe, and consider reaching out for support."; color = highBg; }

  resultText.textContent = level;
  document.body.style.background = color;
  localStorage.setItem("mindease_stress", JSON.stringify({
    score,
    level: level.split(' - ')[0],
    date: new Date().toISOString()
  }));
  addActivity(`Stress check completed (${level.split(' - ')[0]})`);
}

function addActivity(text) {
  const list = readActivity();
  list.push({ text, date: new Date().toISOString() });
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(list.slice(-6)));
}

function readActivity() {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

restartBtn.addEventListener("click", () => {
  currentQ = 0;
  score = 0;
  resultContainer.classList.add("hidden");
  quizContainer.classList.remove("hidden");
  const styles = getComputedStyle(document.documentElement);
  document.body.style.background = styles.getPropertyValue('--bg-gradient').trim();
  loadQuestion();
});

// ----------------- INITIAL LOAD -----------------
window.onload = loadQuestion;

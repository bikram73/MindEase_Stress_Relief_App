const STORAGE_KEYS = {
	moods: 'mindease_moods',
	journal: 'mindease_journal',
	stress: 'mindease_stress',
	scores: 'mindease_scores',
	activity: 'mindease_activity'
};

const QUOTES = [
	{ text: 'Breathe in calm, breathe out tension.', author: 'MindEase' },
	{ text: 'Small pauses can reset big days.', author: 'MindEase' },
	{ text: 'You are allowed to take up space and take it slow.', author: 'MindEase' },
	{ text: 'Gentle steps still move you forward.', author: 'MindEase' }
];

function setCookie(name, value, days = 365) {
	const d = new Date();
	d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
	document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/`;
}

function getCookie(name) {
	const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
	return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name) {
	document.cookie = `${name}=; Max-Age=0; path=/`;
}

function readStorage(key, fallback = []) {
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
}

function updateWelcome() {
	const welcomeTitle = document.getElementById('welcomeTitle');
	const usernameModal = document.getElementById('usernameModal');
	const usernameInput = document.getElementById('usernameInput');
	const saveUsernameBtn = document.getElementById('saveUsernameBtn');

	const username = getCookie('username');
	if (username) {
		welcomeTitle.textContent = `Welcome back, ${username}`;
		usernameModal.style.display = 'none';
		usernameModal.setAttribute('aria-hidden', 'true');
	} else {
		usernameModal.style.display = 'flex';
		usernameModal.setAttribute('aria-hidden', 'false');
	}

	saveUsernameBtn.addEventListener('click', () => {
		const nameValue = usernameInput.value.trim();
		if (!nameValue) return;
		setCookie('username', nameValue);
		welcomeTitle.textContent = `Welcome back, ${nameValue}`;
		usernameModal.style.display = 'none';
		usernameModal.setAttribute('aria-hidden', 'true');
	});
}

function updateMetrics() {
	const moods = readStorage(STORAGE_KEYS.moods, []);
	const stress = readStorage(STORAGE_KEYS.stress, null);
	const todayMoodEl = document.getElementById('todayMood');
	const stressScoreEl = document.getElementById('stressScore');
	const streakEl = document.getElementById('calmStreak');

	if (moods.length) {
		const latest = moods[moods.length - 1];
		const dateLabel = new Date(latest.date).toLocaleDateString();
		todayMoodEl.textContent = `${latest.mood} on ${dateLabel}`;
	}

	if (stress && typeof stress.score === 'number') {
		stressScoreEl.textContent = `${stress.score} (${stress.level})`;
	}

	const streak = calculateStreak(moods);
	streakEl.textContent = `${streak} day${streak === 1 ? '' : 's'}`;
}

function calculateStreak(moods) {
	if (!moods.length) return 0;
	const sorted = [...moods].sort((a, b) => new Date(b.date) - new Date(a.date));
	let streak = 0;
	let cursor = new Date(sorted[0].date);
	for (const entry of sorted) {
		const entryDate = new Date(entry.date);
		if (entryDate.toDateString() === cursor.toDateString()) {
			streak += 1;
			cursor.setDate(cursor.getDate() - 1);
			continue;
		}
		break;
	}
	return streak;
}

function updateQuote() {
	const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
	const quoteEl = document.getElementById('dailyQuote');
	const authorEl = document.getElementById('quoteAuthor');
	quoteEl.textContent = quote.text;
	authorEl.textContent = quote.author;
}

function updateGameScores() {
	const scores = readStorage(STORAGE_KEYS.scores, {});
	const scoreList = document.getElementById('gameScores');
	const entries = Object.entries(scores);

	scoreList.innerHTML = '';
	if (!entries.length) {
		scoreList.innerHTML = '<li>Play a game to start your high-score list.</li>';
		return;
	}

	entries.forEach(([game, value]) => {
		const li = document.createElement('li');
		li.textContent = `${game}: ${value}`;
		scoreList.appendChild(li);
	});
}

function updateRecentActivity() {
	const moods = readStorage(STORAGE_KEYS.moods, []);
	const journal = readStorage(STORAGE_KEYS.journal, []);
	const stress = readStorage(STORAGE_KEYS.stress, null);
	const activity = readStorage(STORAGE_KEYS.activity, []);
	const activityEl = document.getElementById('recentActivity');
	const items = [];

	if (moods.length) {
		items.push(`Checked in mood: ${moods[moods.length - 1].mood}`);
	}
	if (journal.length) {
		items.push('Wrote a journal entry');
	}
	if (stress && stress.level) {
		items.push(`Stress check: ${stress.level}`);
	}
	if (activity.length) {
		activity.slice(-2).forEach((item) => items.push(item.text));
	}

	if (!items.length) {
		items.push('Start with a mood check-in or a quick game.');
	}

	activityEl.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
}

function renderMoodChart() {
	const canvas = document.getElementById('moodChart');
	const hint = document.getElementById('moodChartHint');
	if (!canvas) return;
	const ctx = canvas.getContext('2d');
	const moods = readStorage(STORAGE_KEYS.moods, []);
	const moodValues = {
		Happy: 5,
		Calm: 4,
		Neutral: 3,
		Sad: 2,
		Stressed: 1
	};

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (!moods.length) {
		if (hint) hint.style.display = 'block';
		return;
	}

	if (hint) hint.style.display = 'none';

	const recent = moods.slice(-7);
	const padding = 24;
	const chartHeight = canvas.height - padding * 2;
	const chartWidth = canvas.width - padding * 2;
	const stepX = chartWidth / Math.max(recent.length - 1, 1);

	ctx.strokeStyle = '#A3C4F3';
	ctx.lineWidth = 3;
	ctx.beginPath();
	recent.forEach((entry, index) => {
		const value = moodValues[entry.mood] || 3;
		const x = padding + index * stepX;
		const y = padding + chartHeight - ((value - 1) / 4) * chartHeight;
		if (index === 0) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
		}
	});
	ctx.stroke();

	ctx.fillStyle = '#5BC0BE';
	recent.forEach((entry, index) => {
		const value = moodValues[entry.mood] || 3;
		const x = padding + index * stepX;
		const y = padding + chartHeight - ((value - 1) / 4) * chartHeight;
		ctx.beginPath();
		ctx.arc(x, y, 5, 0, Math.PI * 2);
		ctx.fill();
	});
}

function wireActions() {
	document.querySelectorAll('[data-action]').forEach((btn) => {
		btn.addEventListener('click', () => {
			const action = btn.dataset.action;
			const routes = {
				breathing: 'relaxation.html',
				journal: 'journal.html',
				game: 'games.html',
				relax: 'relaxation.html',
				tips: 'tips.html'
			};
			if (routes[action]) {
				window.location.href = routes[action];
			}
		});
	});

	const logoutBtn = document.getElementById('logoutBtn');
	logoutBtn.addEventListener('click', () => {
		deleteCookie('username');
		window.location.reload();
	});
}

updateWelcome();
updateMetrics();
updateQuote();
updateGameScores();
updateRecentActivity();
renderMoodChart();
wireActions();

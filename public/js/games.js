const STORAGE_KEYS = {
	scores: 'mindease_scores',
	activity: 'mindease_activity'
};

const GAME_LABELS = {
	memory: 'Memory Match',
	bubblepop: 'Bubble Pop',
	clouds: 'Catch the Clouds'
};

function readStorage(key, fallback) {
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

function getCookie(name) {
	const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
	return match ? decodeURIComponent(match[2]) : null;
}

const welcomeMessage = document.getElementById('welcomeMessage');
const username = getCookie('username');
if (username) {
	welcomeMessage.textContent = `Welcome, ${username}. Choose a relaxing game.`;
}

const music = document.getElementById('bgMusic');
const toggleMusic = document.getElementById('toggleMusic');
toggleMusic.addEventListener('click', async () => {
	if (music.paused) {
		try {
			await music.play();
			toggleMusic.textContent = 'Pause Music';
		} catch {
			toggleMusic.textContent = 'Play Music';
		}
	} else {
		music.pause();
		toggleMusic.textContent = 'Play Music';
	}
});

let scores = { memory: 0, bubblepop: 0, clouds: 0 };
let highs = readStorage(STORAGE_KEYS.scores, {
	'Memory Match': 0,
	'Bubble Pop': 0,
	'Catch the Clouds': 0
});
let active = {};
let timers = {};
let intervals = [];

const theme = getComputedStyle(document.documentElement);
const canvasAccent = theme.getPropertyValue('--accent').trim() || '#FFB4A2';
const canvasMuted = theme.getPropertyValue('--secondary').trim() || '#A3C4F3';
const canvasPrimary = theme.getPropertyValue('--primary').trim() || '#5BC0BE';

function loadHighScores() {
	Object.entries(GAME_LABELS).forEach(([key, label]) => {
		const el = document.getElementById(`${key}High`);
		if (el) el.textContent = `High Score: ${highs[label] || 0}`;
	});
}

function saveHighScore(gameKey, score) {
	const label = GAME_LABELS[gameKey];
	if (score > (highs[label] || 0)) {
		highs[label] = score;
		writeStorage(STORAGE_KEYS.scores, highs);
	}
	loadHighScores();
}

function addActivity(text) {
	const list = readStorage(STORAGE_KEYS.activity, []);
	list.push({ text, date: new Date().toISOString() });
	writeStorage(STORAGE_KEYS.activity, list.slice(-6));
}

function openGame(name) {
	const modal = document.getElementById(`${name}Modal`);
	modal.style.display = 'flex';
	modal.setAttribute('aria-hidden', 'false');
	scores[name] = 0;
	document.getElementById(`${name}Score`).textContent = 'Score: 0';
	document.getElementById(`${name}Result`).textContent = '';
	document.getElementById(`${name}Timer`).textContent = '';
	active[name] = true;
	if (name === 'memory') startMemoryGame();
	if (name === 'bubblepop') startBubblePop();
	if (name === 'clouds') startClouds();
}

function closeGame(name) {
	active[name] = false;
	clearInterval(timers[name]);
	intervals.forEach(clearInterval);
	intervals = [];
	if (name === 'clouds') {
		window.onkeydown = null;
	}
	const modal = document.getElementById(`${name}Modal`);
	modal.style.display = 'none';
	modal.setAttribute('aria-hidden', 'true');
}

function countdown(name, seconds, onTick, onEnd) {
	let remain = seconds;
	onTick(remain);
	timers[name] = setInterval(() => {
		remain -= 1;
		onTick(remain);
		if (remain <= 0) {
			clearInterval(timers[name]);
			active[name] = false;
			onEnd();
		}
	}, 1000);
}

function startMemoryGame() {
	const symbols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
	const pairs = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
	const area = document.getElementById('memoryArea');
	area.innerHTML = '<div class="memory-grid" id="memoryGrid"></div>';
	const grid = document.getElementById('memoryGrid');

	pairs.forEach((symbol) => {
		const div = document.createElement('div');
		div.className = 'memory-card';
		div.textContent = symbol;
		grid.appendChild(div);
	});

	let first = null;
	let lock = false;

	grid.onclick = (e) => {
		if (!active.memory || lock || !e.target.classList.contains('memory-card')) return;
		const card = e.target;
		if (card.classList.contains('flipped')) return;
		card.classList.add('flipped');
		if (!first) {
			first = card;
		} else {
			lock = true;
			if (first.textContent === card.textContent) {
				scores.memory += 10;
				document.getElementById('memoryScore').textContent = `Score: ${scores.memory}`;
				first = null;
				lock = false;
			} else {
				setTimeout(() => {
					first.classList.remove('flipped');
					card.classList.remove('flipped');
					first = null;
					lock = false;
				}, 650);
			}
		}
	};

	countdown(
		'memory',
		45,
		(r) => (document.getElementById('memoryTimer').textContent = `Time: ${r}s`),
		() => {
			document.getElementById('memoryResult').textContent = `Time up! Final Score: ${scores.memory}`;
			saveHighScore('memory', scores.memory);
			addActivity(`Played Memory Match (score ${scores.memory})`);
		}
	);
}

function startBubblePop() {
	const area = document.getElementById('bubblepopArea');
	const w = 480;
	const h = 300;
	area.innerHTML = `<canvas id="bubbleCanvas" width="${w}" height="${h}"></canvas>`;
	const canvas = document.getElementById('bubbleCanvas');
	const ctx = canvas.getContext('2d');
	let bubbles = [];

	canvas.onclick = (e) => {
		if (!active.bubblepop) return;
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		bubbles = bubbles.filter((b) => {
			const hit = Math.hypot(b.x - x, b.y - y) < b.r;
			if (hit) scores.bubblepop += 5;
			return !hit;
		});
		document.getElementById('bubblepopScore').textContent = `Score: ${scores.bubblepop}`;
	};

	intervals.push(
		setInterval(() => {
			if (active.bubblepop) {
				bubbles.push({
					x: Math.random() * w,
					y: h + 20,
					r: 10 + Math.random() * 15,
					v: 1 + Math.random()
				});
			}
		}, 700)
	);

	intervals.push(
		setInterval(() => {
			ctx.clearRect(0, 0, w, h);
			ctx.fillStyle = canvasMuted;
			bubbles.forEach((b) => {
				b.y -= b.v;
				ctx.beginPath();
				ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
				ctx.fill();
			});
			bubbles = bubbles.filter((b) => b.y > -30);
		}, 50)
	);

	countdown(
		'bubblepop',
		30,
		(r) => (document.getElementById('bubblepopTimer').textContent = `Time: ${r}s`),
		() => {
			document.getElementById('bubblepopResult').textContent = `Time up! Final Score: ${scores.bubblepop}`;
			saveHighScore('bubblepop', scores.bubblepop);
			addActivity(`Played Bubble Pop (score ${scores.bubblepop})`);
		}
	);
}

function startClouds() {
	const area = document.getElementById('cloudsArea');
	const w = 480;
	const h = 300;
	area.innerHTML = `<canvas id="cloudCanvas" width="${w}" height="${h}"></canvas>`;
	const canvas = document.getElementById('cloudCanvas');
	const ctx = canvas.getContext('2d');
	let clouds = [];
	let basketX = w / 2 - 30;

	window.onkeydown = (e) => {
		if (!active.clouds) return;
		if (e.key === 'ArrowLeft') basketX = Math.max(0, basketX - 25);
		if (e.key === 'ArrowRight') basketX = Math.min(w - 60, basketX + 25);
	};

	intervals.push(
		setInterval(() => {
			if (active.clouds) clouds.push({ x: Math.random() * (w - 40), y: -20, v: 1 + Math.random() * 2 });
		}, 800)
	);

	intervals.push(
		setInterval(() => {
			ctx.clearRect(0, 0, w, h);
			ctx.fillStyle = canvasPrimary;
			ctx.fillRect(basketX, h - 40, 60, 15);
			ctx.fillStyle = 'white';
			clouds.forEach((c, i) => {
				ctx.beginPath();
				ctx.arc(c.x, c.y, 15, 0, Math.PI * 2);
				ctx.fill();
				c.y += c.v;
				if (c.y > h - 40 && c.x > basketX && c.x < basketX + 60) {
					clouds.splice(i, 1);
					scores.clouds += 5;
					document.getElementById('cloudsScore').textContent = `Score: ${scores.clouds}`;
				}
			});
		}, 50)
	);

	countdown(
		'clouds',
		30,
		(r) => (document.getElementById('cloudsTimer').textContent = `Time: ${r}s`),
		() => {
			document.getElementById('cloudsResult').textContent = `Time up! Final Score: ${scores.clouds}`;
			saveHighScore('clouds', scores.clouds);
			addActivity(`Played Catch the Clouds (score ${scores.clouds})`);
		}
	);
}

document.querySelectorAll('[data-game]').forEach((btn) => {
	btn.addEventListener('click', () => openGame(btn.dataset.game));
});

document.querySelectorAll('[data-close]').forEach((btn) => {
	btn.addEventListener('click', () => closeGame(btn.dataset.close));
});

document.querySelectorAll('.modal').forEach((modal) => {
	modal.addEventListener('click', (event) => {
		if (event.target === modal) {
			const id = modal.id.replace('Modal', '');
			closeGame(id);
		}
	});
});

loadHighScores();

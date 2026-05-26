const STORAGE_KEYS = {
	moods: 'mindease_moods',
	journal: 'mindease_journal',
	activity: 'mindease_activity'
};

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

function formatDate(value) {
	const date = new Date(value);
	return date.toLocaleString();
}

const saveBtn = document.getElementById('saveEntryBtn');
const moodSelect = document.getElementById('mood');
const noteInput = document.getElementById('note');
const entriesContainer = document.getElementById('entries');
const chartCanvas = document.getElementById('moodChart');
const chartStatus = document.getElementById('moodChartStatus');

const moodScore = {
	Happy: 5,
	Calm: 4,
	Neutral: 3,
	Sad: 2,
	Stressed: 1
};

function saveEntry() {
	const mood = moodSelect.value;
	const note = noteInput.value.trim();
	if (!mood) {
		alert('Please select a mood.');
		return;
	}

	const entry = {
		mood,
		note,
		date: new Date().toISOString()
	};

	const moods = readStorage(STORAGE_KEYS.moods, []);
	moods.push({ mood, date: entry.date });
	writeStorage(STORAGE_KEYS.moods, moods);

	const journal = readStorage(STORAGE_KEYS.journal, []);
	journal.unshift(entry);
	writeStorage(STORAGE_KEYS.journal, journal);

	addActivity('Added a mood journal entry');

	moodSelect.value = '';
	noteInput.value = '';
	renderEntries();
	drawChart();
}

function addActivity(text) {
	const list = readStorage(STORAGE_KEYS.activity, []);
	list.push({ text, date: new Date().toISOString() });
	writeStorage(STORAGE_KEYS.activity, list.slice(-6));
}

function renderEntries() {
	const journal = readStorage(STORAGE_KEYS.journal, []);
	if (!journal.length) {
		entriesContainer.innerHTML = '<div class="card">No entries yet. Start with a mood check-in above.</div>';
		return;
	}

	entriesContainer.innerHTML = '<h2>Your entries</h2>';
	journal.forEach((entry) => {
		const item = document.createElement('div');
		item.className = 'entry-card';
		item.innerHTML = `
			<div class="entry-header">
				<span>${formatDate(entry.date)}</span>
				<strong>${entry.mood}</strong>
			</div>
			<p>${entry.note || 'No note added.'}</p>
		`;
		entriesContainer.appendChild(item);
	});
}

function drawChart() {
	const moods = readStorage(STORAGE_KEYS.moods, []);
	const ctx = chartCanvas.getContext('2d');
	ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

	if (!moods.length) {
		chartStatus.style.display = 'block';
		return;
	}

	chartStatus.style.display = 'none';
	const recent = moods.slice(-7);
	const padding = 30;
	const chartHeight = chartCanvas.height - padding * 2;
	const chartWidth = chartCanvas.width - padding * 2;
	const barWidth = chartWidth / recent.length - 10;

	ctx.fillStyle = '#A3C4F3';
	recent.forEach((entry, index) => {
		const value = moodScore[entry.mood] || 3;
		const barHeight = (value / 5) * chartHeight;
		const x = padding + index * (barWidth + 10);
		const y = padding + chartHeight - barHeight;
		ctx.fillRect(x, y, barWidth, barHeight);
	});
}

saveBtn.addEventListener('click', saveEntry);
renderEntries();
drawChart();

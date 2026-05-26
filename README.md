# MindEase — Stress Relief App

🧘‍♀️ A lightweight web app to help track mood, relax, and play short stress-relief games.

--------------------------------------------------------------------------------

## Features

- 🎮 Mini-games (Memory Match, Bubble Pop, Catch the Clouds) with local high scores
- 📝 Mood journal with trend chart and recent entries
- 🌬️ Guided breathing with focus mini-game
- 🧪 Self-assessment with stored stress score
- 💡 Tips and resources for stress relief
- 🔐 Privacy-first: data stored locally in cookies/localStorage
- 🎨 Unified theme using CSS variables for consistent UI/UX

--------------------------------------------------------------------------------

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm start
```

3. Open your browser at:

```
http://localhost:3000
```

--------------------------------------------------------------------------------

## File structure

Project layout (important files/folders):

```
├─ package.json
├─ server.js                 # simple static express server
├─ public/                  # static frontend
│  ├─ index.html
│  ├─ dashboard.html
│  ├─ games.html
│  ├─ journal.html
│  ├─ relaxation.html
│  ├─ self-assessment.html
│  ├─ tips.html
│  ├─ assets/
│  │  └─ audio/
│  ├─ css/
│  │  ├─ style.css          # centralized theme variables and styles
│  │  ├─ relaxation.css
│  │  └─ self_assessment.css
│  └─ js/
│     ├─ dashboard.js
│     ├─ games.js
│     ├─ journal.js
│     ├─ relaxation.js
│     └─ self_assessment.js
└─ routes/                    # reserved for future backend routes (currently unused)
```

--------------------------------------------------------------------------------

## Data & Persistence

- Username stored in cookies for quick personalization.
- LocalStorage keys:
  - `mindease_moods` (mood history)
  - `mindease_journal` (journal entries)
  - `mindease_stress` (stress score + level)
  - `mindease_scores` (game high scores)
  - `mindease_activity` (recent activity)

Note: This design intentionally avoids a server-side database to keep the app portable and easy to run locally. If you want a server-backed database later, I can help add one.

--------------------------------------------------------------------------------

## Theming & Customization

- Global theme variables live in `public/css/style.css` (e.g., `--primary`, `--accent`, `--bg-gradient`).
- Update those variables to change the look across pages.

--------------------------------------------------------------------------------

## Contributing

- Feel free to open issues or submit pull requests. Suggested improvements:
  - Add dark mode toggle.
  - Add audio controls and volume sliders.
  - Swap the hero badge for an illustration in `public/assets/images/`.

--------------------------------------------------------------------------------

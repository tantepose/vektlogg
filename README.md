# Weight Logger App

A simple, clean weight logging application built with SvelteKit.

## Features

- Log your weight with automatic date tracking
- View your weight progress over time with an interactive graph
- Simple, clean interface
- Data stored in SQLite database

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## How It Works

1. **Database**: Uses SQLite (`better-sqlite3`) to store weight entries. The database file `weight_log.db` is created automatically in the project root.

2. **API Routes**: 
   - `GET /api/weights` - Fetches all weight entries
   - `POST /api/weights` - Adds a new weight entry

3. **Main Page**: 
   - Form to enter your current weight
   - Automatically uses today's date
   - Displays a graph of all your weight entries

4. **Graph**: Uses Chart.js to visualize your weight progress over time as a line chart.

## Project Structure

```
src/
├── lib/
│   ├── db.js              # Database setup and functions
│   └── WeightChart.svelte # Chart component
├── routes/
│   ├── api/
│   │   └── weights/
│   │       └── +server.js # API endpoint for weight operations
│   ├── +layout.svelte     # Root layout
│   └── +page.svelte       # Main page with form and graph
├── app.css                # Global styles
└── app.html               # HTML template
```

## Notes

- If you log weight on the same date twice, it will update the existing entry
- The database file is excluded from git (see `.gitignore`)
- All code is well-commented for easy understanding


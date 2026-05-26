# Fitness Tracker

React app to register workouts. Data is stored in your browser (`localStorage`).

## Live app (GitHub Pages)

**https://svendandreasen.github.io/FitnessTracker/**

Open that link on your phone or computer. You can use “Add to Home Screen” for quick access.

## MVP fields

- **Required:** exercise name, date
- **Optional:** sets, reps, weight (kg), duration (minutes), notes

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

Deployments run automatically when `main` is updated (see `.github/workflows/deploy-pages.yml`).

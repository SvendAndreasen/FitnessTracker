# Fitness Tracker

React app to register workouts. Data is stored in your browser (`localStorage`).

## Live app (GitHub Pages)

**https://svendandreasen.github.io/FitnessTracker/**

Use that exact URL (including `/FitnessTracker/`). The root `https://svendandreasen.github.io/` will 404.

Open on your phone and use **Add to Home Screen** for quick access.

### If you see a 404

1. Open [Settings → Pages](https://github.com/SvendAndreasen/FitnessTracker/settings/pages).
2. If **Source** is not set, choose **GitHub Actions** (preferred) or **Deploy from branch** → `gh-pages` → `/ (root)`.
3. Open [Actions](https://github.com/SvendAndreasen/FitnessTracker/actions) and re-run **Deploy to GitHub Pages**.
4. Wait 1–2 minutes, then reload the live URL.

## MVP fields

- **Required:** exercise name, date
- **Optional:** sets, reps, weight (kg), duration (minutes), notes

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

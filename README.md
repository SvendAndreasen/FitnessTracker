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

### One-time GitHub setup (required once)

1. Open [Repository → Settings → Pages](https://github.com/SvendAndreasen/FitnessTracker/settings/pages).
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Choose branch **`gh-pages`**, folder **`/ (root)`**, then **Save**.
4. After the next push to `main`, wait ~1 minute for the [Actions](https://github.com/SvendAndreasen/FitnessTracker/actions) workflow to finish.

If the site does not load, open **Actions** and re-run the latest **Deploy to GitHub Pages** workflow.

# Fitness Tracker

React app to register workouts. Data is stored in your browser (`localStorage`).

## Live app

**https://svendandreasen.github.io/FitnessTracker/**

## Enable GitHub Pages (one time)

GitHub no longer always shows a “folder” option. Use **GitHub Actions** instead:

1. Open [Settings → Pages](https://github.com/SvendAndreasen/FitnessTracker/settings/pages).
2. Under **Build and deployment** → **Source**, choose **GitHub Actions** (not “Deploy from a branch”).
3. Open [Actions](https://github.com/SvendAndreasen/FitnessTracker/actions) → **Deploy to GitHub Pages** → **Run workflow**.
4. Wait until the workflow shows a green check, then open the live URL above.

If you already picked a branch, switch **Source** to **GitHub Actions** and run the workflow again.

## MVP fields

- **Required:** exercise name, date
- **Optional:** sets, reps, weight (kg), duration (minutes), notes

## Run locally

```bash
npm install
npm run dev
```

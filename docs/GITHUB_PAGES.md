# GitHub Pages setup guide

This guide documents how the Fitness Tracker app is published to GitHub Pages.

## Live site

**https://svendandreasen.github.io/FitnessTracker/**

Use this exact URL (including `/FitnessTracker/`).

---

## Site works briefly, then breaks (important)

If the app worked after a deploy but later shows a **blank page**, **404**, or an **old version**, the usual cause is:

**Settings → Pages → Source is set to branch `main`.**

That publishes **source code**, not the built app. Each push to `main` overwrites the working site with an unbuilt `index.html` (which points at `/src/main.tsx` and cannot run in the browser).

### Fix (one time)

1. Open [Settings → Pages](https://github.com/SvendAndreasen/FitnessTracker/settings/pages).
2. Under **Build and deployment** → **Source**, choose **one** of these:

| Source | What to pick |
|--------|----------------|
| **GitHub Actions** (recommended) | Select **GitHub Actions** — no branch/folder needed |
| **Deploy from a branch** | Branch **`gh-pages`**, folder **`/` (root)** if shown |

3. Do **not** use branch **`main`** as the Pages source.
4. Open [Actions](https://github.com/SvendAndreasen/FitnessTracker/actions) → **Deploy to GitHub Pages** → **Run workflow**.
5. Wait ~1 minute, then hard-refresh the live URL.

The workflow builds the app and publishes to both **GitHub Actions Pages** and the **`gh-pages`** branch so either source option works.

---

## How it works

| Piece | Role |
|-------|------|
| [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml) | Builds on every push to `main` and publishes the `dist` folder |
| [`vite.config.ts`](../vite.config.ts) | `base: '/FitnessTracker/'` for correct asset paths |
| `dist/404.html` | SPA fallback for static hosting |
| GitHub Pages | Serves the **built** files only |

---

## One-time setup (repo owner)

### Option A — GitHub Actions (recommended)

1. **Settings** → **Pages** → **Source** → **GitHub Actions**
2. **Actions** tab → **Deploy to GitHub Pages** → **Run workflow** (if needed)

### Option B — Branch `gh-pages`

1. **Settings** → **Pages** → **Source** → **Deploy from a branch**
2. Branch **`gh-pages`**, folder **`/` (root)** (if GitHub only shows the branch, root is usually implied)
3. Run the deploy workflow once so `gh-pages` is up to date

### Open the site

**https://svendandreasen.github.io/FitnessTracker/** — use **Add to Home Screen** on mobile if you like.

---

## Common mistakes

### Opened Settings → Actions instead of the Actions tab

| Location | Use for deploy? |
|----------|----------------|
| **Actions** tab (beside **Code**) | Yes |
| **Settings** → **Actions** (General, Runners, OIDC) | No |

### Automatic deploys

Every push to `main` runs the deploy workflow (~30–45 seconds). You do not need to deploy from your PC.

---

## Troubleshooting checklist

- [ ] **Pages source is not `main`**
- [ ] Source is **GitHub Actions** OR branch **`gh-pages`**
- [ ] Latest deploy workflow run is green
- [ ] URL includes `/FitnessTracker/`
- [ ] Hard refresh or private tab if the page looks cached

---

## Related files

- [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml)
- [`vite.config.ts`](../vite.config.ts)
- [`README.md`](../README.md)

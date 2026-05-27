# GitHub Pages setup guide

This guide documents how the Fitness Tracker app is published to GitHub Pages, based on what we learned while setting it up.

## Live site

**https://svendandreasen.github.io/FitnessTracker/**

Use this exact URL (including `/FitnessTracker/`). The root `https://svendandreasen.github.io/` will return 404 — that is normal for a project site.

---

## How it works

| Piece | Role |
|-------|------|
| [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml) | Builds the app and deploys on every push to `main` |
| [`vite.config.ts`](../vite.config.ts) | Sets `base: '/FitnessTracker/'` so assets load under the project path |
| `dist/404.html` | Copy of `index.html` so deep links work on static hosting |
| GitHub Pages | Hosts the built files from the workflow artifact |

Data still lives in the browser (`localStorage`); GitHub Pages only serves the static app.

---

## One-time setup (repo owner)

### 1. Enable Pages with GitHub Actions

1. Open the repo on GitHub.
2. Go to **Settings** → **Pages** (not **Settings** → **Actions**).
3. Under **Build and deployment** → **Source**, choose **GitHub Actions**.

> **Note:** The modern Pages UI often does **not** show a “folder” or “/ (root)” option. That is expected when using **GitHub Actions**. You do not need to pick a folder.

Do **not** use **Deploy from a branch** unless you maintain a separate `gh-pages` branch yourself. This project is configured for **GitHub Actions** deployment.

### 2. Run the deploy workflow

1. Open the **Actions** tab on the repo (next to **Code**, **Issues**, etc.).
2. In the left sidebar, click **Deploy to GitHub Pages**.
3. If there is no recent successful run, click **Run workflow** → **Run workflow**.
4. Wait until the run shows a green checkmark (about 30 seconds).

### 3. Open the site

Visit **https://svendandreasen.github.io/FitnessTracker/**.

On a phone, you can use **Add to Home Screen** for quick access.

---

## Common mistakes

### Opened Settings → Actions instead of the Actions tab

| Location | Purpose |
|----------|---------|
| **Actions** tab (top of repo, beside **Code**) | View and run deploy workflows — **use this** |
| **Settings** → **Actions** (General, Runners, OIDC) | Configure runners and security — **not needed** for publishing |

### Expected a “root folder” option

If **Source** is **GitHub Actions**, there is no branch/folder picker. The workflow uploads the build output for you.

If **Source** is **Deploy from a branch**, some repos only show a branch name; root may be implied. For this project, prefer **GitHub Actions**.

### Site returns 404

Check these in order:

1. **Pages enabled?**  
   **Settings** → **Pages** → **Source** must be **GitHub Actions** (or a branch that actually contains the built site).

2. **Deploy succeeded?**  
   **Actions** tab → **Deploy to GitHub Pages** → latest run must be green.

3. **Correct URL?**  
   Use `https://<username>.github.io/FitnessTracker/` (repo name in the path).

4. **Wait a minute**  
   After the first deploy, DNS/Pages can take 1–2 minutes to update.

5. **Hard refresh**  
   On mobile, try a private tab or clear cache if you opened the URL before Pages was enabled.

### Blank page or missing styles

The Vite `base` path must match the repo name:

```ts
// vite.config.ts
export default defineConfig({
  base: '/FitnessTracker/', // must match repo name (case-sensitive in URL path)
  // ...
})
```

If you rename the repository, update `base` and redeploy.

---

## Automatic deploys

Every push to `main` triggers [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml):

1. `npm ci` and `npm run build`
2. Copy `index.html` to `404.html` in `dist`
3. Upload `dist` as a Pages artifact
4. Deploy to the `github-pages` environment

To deploy manually: **Actions** → **Deploy to GitHub Pages** → **Run workflow**.

---

## Local development vs production

| Command | URL | `base` path |
|---------|-----|-------------|
| `npm run dev` | `http://localhost:5173` | Applied automatically by Vite |
| `npm run build` + `npm run preview` | Local preview of production build | `/FitnessTracker/` |
| GitHub Pages | `https://svendandreasen.github.io/FitnessTracker/` | `/FitnessTracker/` |

```bash
npm install
npm run dev      # develop locally
npm run build    # same build the workflow uses
npm run preview  # preview production build locally
```

---

## Making the repository public

GitHub Pages works on private repos with a paid plan; a **public** repo can use Pages on the free tier.

1. **Settings** → scroll to **Danger zone**
2. **Change repository visibility** → **Make public**

The app code is visible; workout data remains in each user’s browser only.

---

## Troubleshooting checklist

- [ ] Repo is public (or your plan allows Pages on private repos)
- [ ] **Settings** → **Pages** → **Source** = **GitHub Actions**
- [ ] Latest **Deploy to GitHub Pages** workflow run succeeded
- [ ] Opening `https://svendandreasen.github.io/FitnessTracker/` (with trailing path)
- [ ] `vite.config.ts` has `base: '/FitnessTracker/'`

---

## Related files

- [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml) — deploy workflow
- [`vite.config.ts`](../vite.config.ts) — base path for GitHub Pages
- [`README.md`](../README.md) — project overview and local run instructions

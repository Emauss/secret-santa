# Secret Santa

Family Secret Santa app (React + TypeScript + Vite + Tailwind, Firebase Auth & Firestore).

## Two families, one codebase

The same app runs as two separate instances, one per family. Each has its own Firebase
project (auth + Firestore) and its own hosting. The code lives on one branch (`main`);
everything family-specific is in a Vite mode env file.

| Family | Mode / env file | URL | Hosting | Firebase project |
| --- | --- | --- | --- | --- |
| **Gorczyńscy** | `gorczynscy` / `.env.gorczynscy` | https://emauss.github.io/secret-santa/ | GitHub Pages (`gh-pages` branch) | `secretsanta-c32f4` |
| **Okrój** | `okroj` / `.env.okroj` | https://secret-santa-okroj.web.app/ | Firebase Hosting | `secret-santa-okroj` |

Each env file holds:

- `BASE_PATH` – Vite `base` (`/secret-santa/` for the GitHub Pages subpath, `./` for Firebase)
- `VITE_FIREBASE_*` – Firebase web config (public by design; data is protected by Firestore rules)
- `VITE_ADMIN_UID` – UID of the family admin (can run the draw on `/admin`)

## Scripts

```bash
pnpm install

pnpm dev:gorczynscy      # local dev against the Gorczyńscy Firebase project
pnpm dev:okroj           # local dev against the Okrój Firebase project

pnpm deploy:gorczynscy   # build + publish to GitHub Pages
pnpm deploy:okroj        # build + firebase deploy (hosting)
pnpm deploy:all          # both, one after another
```

Note: dev mode talks to the **real** Firebase project of the chosen family.

`deploy:okroj` uses the local `firebase-tools`; log in once with `pnpm exec firebase login`.

The old `family/okroj` branch is kept only as history – don't develop on it.

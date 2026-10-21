# Contributing to TS to MP4 Pro

Thanks for your interest! Bug reports, feature ideas, documentation fixes and
code contributions are all welcome.

## Getting set up

Prerequisites:

- Node.js 22 LTS (recommended) and npm
- FFmpeg on your `PATH` (or a local `ffmpeg.exe` you can point the app to)

```bash
git clone https://github.com/icpjimait/ts-mp4-pro.git
cd ts-mp4-pro
npm install
npm run dev
```

## Before you open a pull request

Please make sure these pass locally:

```bash
npm run typecheck   # tsc (main/preload) + vue-tsc (renderer)
npm run lint        # ESLint
npm run build       # type-check + production bundle into out/
```

Format changed files with the project Prettier config:

```bash
npx prettier --write <changed files>
```

## How the code is organized

- `src/main/` — Electron main process: window lifecycle, IPC handlers,
  the conversion queue (concurrency limit 3) and FFmpeg process management
- `src/preload/` — the typed IPC bridge exposed to the renderer as `window.api`
- `src/renderer/` — Vue 3 + Element Plus UI (task list, progress, settings)
- `scripts/with-ffmpeg.mjs` — release helper that temporarily injects a local
  `ffmpeg.exe` into `resources/` for packaging, then removes it

## Reporting bugs

Open an issue with the bug report template and include:

- Your OS and the app version (or commit)
- A sample `.ts` file's characteristics if you can share them
  (codec info from `ffprobe` is ideal; do **not** upload copyrighted video)
- What you expected, what actually happened, and the conversion mode used
  (stream copy vs H.264 re-encode)

## Suggesting features

Open an issue with the feature request template first, so the scope can be
discussed before a large pull request. Small, focused PRs are easier to
review and merge than sweeping changes.

## Commit style

Short, imperative commit subjects, e.g. `fix: keep progress at 99% until exit`,
`feat: add per-task cancel`. One logical change per commit when practical.

## A note on FFmpeg

The FFmpeg binary is **not** committed to this repository. Release builds
bundle it at packaging time (see `scripts/with-ffmpeg.mjs`). Please do not
add media binaries or sample videos to the repo.

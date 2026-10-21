# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Bilingual (English / Chinese) README with feature overview, architecture
  notes and roadmap
- `CONTRIBUTING.md`, `SECURITY.md`, issue and pull-request templates
- GitHub Actions workflow that runs type-check, lint and build on Windows
  and Ubuntu

### Changed

- `package.json` metadata: real project description, keywords, license and
  homepage (previously Electron template placeholders)

## [1.0.1] - 2026-05-30

### Added

- `scripts/with-ffmpeg.mjs`: release helper that injects a local `ffmpeg.exe`
  into `resources/` only for packaging, then cleans it up
- electron-builder GitHub publish configuration for Windows releases

### Changed

- Packaging refinements for the Windows NSIS installer and portable build

## [1.0.0] - 2026-05-30

Initial open-source release (MIT).

### Added

- Batch `.ts` → `.mp4` conversion powered by FFmpeg
- Conversion queue with up to 3 parallel tasks and per-file real-time
  progress parsed from FFmpeg output
- Two conversion modes: lossless stream copy and H.264 (`libx264`) re-encode,
  with AAC audio output
- Drag & drop and file-picker import, custom output directory, settings
  persisted between runs
- Queue controls: clear pending tasks, open output folder / reveal file
- Windows x64 packaging: NSIS installer and portable build
- Electron 39 + Vue 3 + TypeScript codebase (electron-vite, Element Plus)

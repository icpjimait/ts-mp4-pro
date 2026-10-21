# TS to MP4 Pro · TS转MP4 专家版

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Electron](https://img.shields.io/badge/Electron-39-47848F)
![Vue](https://img.shields.io/badge/Vue-3-42b883)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)

**English** | [中文](#中文说明)

A free, open-source desktop app that batch-converts `.ts` video files to `.mp4`,
powered by FFmpeg under the hood. Drag files in, press convert, and watch real-time
progress for every file — no command line needed.

## Why this exists

`.ts` (MPEG transport stream) files come from digital TV recordings, capture cards,
IPTV streams, set-top boxes and some screen recorders. Many players, editors and
sharing platforms handle them poorly or not at all. Existing converters are often
paid, ad-heavy, single-file only, or require typing FFmpeg commands. TS to MP4 Pro
is a small, local, no-account tool that does one job well: turn a pile of `.ts`
files into widely compatible `.mp4` files, entirely offline, on your own machine.

## Features

- **Batch conversion queue** — add many `.ts` files at once via drag & drop or the
  file picker; up to **3 conversions run in parallel**
- **Two conversion modes**
  - *Stream copy* (`-c:v copy`) — lossless remux, extremely fast, no quality loss
  - *H.264 re-encode* (`libx264`) — for repairing files that will not remux cleanly
  - Audio is written as AAC for maximum player compatibility
- **Real-time progress** — per-file progress bar and status
  (waiting / processing / done / failed), parsed live from FFmpeg output
- **Flexible output** — save next to the source files or pick a custom output
  folder; settings are remembered between runs
- **Queue controls** — clear pending tasks, open the output folder (or reveal a
  finished file) directly from the app
- **Packaged for Windows** — NSIS installer (choose install path, desktop and
  Start-menu shortcuts) and a portable build, x64

## Download

Pre-built Windows builds are attached to
[GitHub Releases](https://github.com/icpjimait/ts-mp4-pro/releases) when published.
To run from source, see *Development* below.

## Requirements

- **FFmpeg.** Release builds bundle `ffmpeg.exe` on Windows. When running from
  source, put FFmpeg on your system `PATH`, or place `ffmpeg.exe` in
  `resources/` (the app prefers a bundled copy and falls back to `ffmpeg`
  from `PATH`).

## Development

Built with Electron + Vue 3 + TypeScript (electron-vite, Element Plus).

```bash
# Node.js 22 LTS recommended
npm install

# Run in development mode
npm run dev

# Type-check + build the app bundles into out/
npm run build
```

Packaging:

```bash
npm run build:win     # Windows NSIS installer + portable (x64)
npm run build:mac     # macOS
npm run build:linux   # Linux
```

### Release builds with bundled FFmpeg (Windows)

```bash
npm run build:win:release
```

This uses `scripts/with-ffmpeg.mjs`, which temporarily copies a local
`ffmpeg.exe` into `resources/` for packaging and removes it afterwards —
the FFmpeg binary is never committed to this repository. The script finds
FFmpeg from, in order:

1. the `TS2MP4_FFMPEG_EXE` environment variable
2. `ffmpeg` found on the system `PATH`

## How it works

The renderer (Vue 3) collects files and settings and sends tasks over IPC.
The Electron main process keeps a queue with a concurrency limit of 3,
spawns FFmpeg per task, and parses `Duration` / `time=` from FFmpeg's
stderr to stream progress and status events back to the UI.

## Roadmap

- Cancel / retry for individual tasks
- Preserve original audio and subtitle streams as-is (optional, instead of AAC)
- English UI and in-app language switch (UI is currently Chinese)
- Packaged macOS and Linux releases
- Automated tests for the conversion queue and progress parsing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)

---

## 中文说明

一个免费、开源的桌面工具：把 `.ts` 视频文件批量转换成 `.mp4`，底层调用 FFmpeg。
把文件拖进去、点开始转换，就能看到每个文件的实时进度——不用敲命令行。

### 为什么做这个

`.ts`（MPEG 传输流）文件常见于数字电视录像、采集卡、IPTV 流、机顶盒和部分录屏软件，
很多播放器、剪辑软件和分享平台对它支持不好甚至打不开。现有的转换工具要么收费、
要么带广告、要么一次只能转一个、要么要自己敲 FFmpeg 命令。本工具小而专注，
本地运行、不用注册账号、完全离线，只做一件事：把一堆 `.ts` 变成兼容性最好的 `.mp4`。

### 功能

- **批量转换队列**：拖拽或点选批量导入 `.ts` 文件，最多 **3 个任务并行**转换
- **两种转换模式**：
  - 无损直通（`-c:v copy`）：不重新编码，速度极快、无画质损失
  - H.264 重编码（`libx264`）：用于修复无法直通的损坏/不规范文件
  - 音频统一输出 AAC，兼容性最好
- **实时进度**：每个文件有进度条和状态（待处理 / 转换中 / 已完成 / 失败），
  进度从 FFmpeg 输出实时解析
- **输出灵活**：默认存回原文件目录，也可自定义输出目录；设置会自动保存
- **队列管理**：可清空待处理任务，转换完可直接打开输出目录或定位文件
- **Windows 打包**：NSIS 安装包（可选安装路径、自动建桌面和开始菜单快捷方式）
  与便携版，x64

### 使用要求

- **FFmpeg**：正式发布的 Windows 安装包会内带 `ffmpeg.exe`；从源码运行时，
  请把 FFmpeg 加入系统 `PATH`，或把 `ffmpeg.exe` 放到 `resources/` 目录
  （程序优先用自带的那份，找不到再用 `PATH` 里的）。

### 本地开发

技术栈：Electron + Vue 3 + TypeScript（electron-vite、Element Plus）。

```bash
# 建议 Node.js 22 LTS
npm install     # 安装依赖
npm run dev     # 开发模式运行
npm run build   # 类型检查 + 构建，产物在 out/
```

打包：

```bash
npm run build:win     # Windows 安装包 + 便携版（x64）
npm run build:mac     # macOS
npm run build:linux   # Linux
```

带 FFmpeg 的正式发布打包（Windows）：

```bash
npm run build:win:release
```

该命令通过 `scripts/with-ffmpeg.mjs` 在打包时临时把本机 `ffmpeg.exe` 注入
`resources/`，打包完自动清理——FFmpeg 二进制不会进仓库。查找顺序：

1. 环境变量 `TS2MP4_FFMPEG_EXE` 指向的路径
2. 系统 `PATH` 中的 `ffmpeg`

### 工作原理

渲染进程（Vue 3）收集文件和设置，通过 IPC 把任务发给主进程；主进程维护一个
并发上限为 3 的队列，为每个任务启动一个 FFmpeg 进程，解析其 stderr 中的
`Duration` / `time=` 计算进度，再把进度和状态事件推回界面。

### 后续计划

- 单个任务的取消 / 重试
- 可选保留原始音频和字幕流（而非统一转 AAC）
- 英文界面与应用内语言切换（目前界面为中文）
- macOS / Linux 正式安装包
- 转换队列与进度解析的自动化测试

欢迎贡献，见 [CONTRIBUTING.md](CONTRIBUTING.md)。

### 许可证

[MIT](LICENSE)

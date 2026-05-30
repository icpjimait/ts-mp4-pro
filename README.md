# TS转MP4 专家版

基于 Electron + Vue 3 + TypeScript 的 TS 视频转 MP4 桌面工具。

## 开发环境

- Node.js + npm
- Windows / macOS / Linux 均可开发（示例命令以 Windows PowerShell 为主）

## 安装依赖

```bash
npm install
```

## 本地开发

```bash
npm run dev
```

## 构建说明

```bash
npm run build
```

- `npm run build` 生成的编译产物在 `out/`
- `npm run build:win` 会在 `dist/` 生成：
  - 安装包（NSIS）：`TS转MP4 专家版 Setup x.y.z.exe`
  - 便携版（portable）：`TS转MP4 专家版 x.y.z.exe`
  - 免安装目录：`dist/win-unpacked/`

## FFmpeg 依赖

本项目默认优先使用 `resources/ffmpeg.exe`（如果存在），否则会尝试调用系统环境变量中的 `ffmpeg`。

## License

MIT

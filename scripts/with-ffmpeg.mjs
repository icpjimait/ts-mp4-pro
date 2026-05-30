import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const resourcesDir = join(repoRoot, 'resources')
const bundledFfmpegPath = join(resourcesDir, 'ffmpeg.exe')

const commands = process.argv.slice(2).filter(Boolean)
if (commands.length === 0) {
  console.error('缺少参数：请传入要执行的命令（例如 npm run build / electron-builder --win）')
  process.exit(1)
}

const toWindowsPath = (p) => p.replace(/^\//, '').replace(/\//g, '\\')

const resolveFfmpegSource = () => {
  const envPath = process.env.TS2MP4_FFMPEG_EXE
  if (envPath && existsSync(envPath)) return envPath

  const where = spawnSync('where', ['ffmpeg'], { encoding: 'utf8', shell: true })
  if (where.status === 0) {
    const first = (where.stdout || '')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)[0]
    if (first && existsSync(first)) return first
  }

  return null
}

const run = (command) => {
  const result = spawnSync(command, { stdio: 'inherit', shell: true })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

mkdirSync(resourcesDir, { recursive: true })

let copied = false
try {
  const source = resolveFfmpegSource()
  if (!source) {
    console.error(
      [
        '未找到 ffmpeg.exe。',
        '请任选其一：',
        '1) 将 ffmpeg 加入系统 PATH（确保命令行能直接运行 ffmpeg）',
        '2) 设置环境变量 TS2MP4_FFMPEG_EXE 指向本机 ffmpeg.exe 的绝对路径'
      ].join('\n')
    )
    process.exit(1)
  }

  copyFileSync(source, bundledFfmpegPath)
  copied = true
  console.log(`已注入 ffmpeg：${toWindowsPath(bundledFfmpegPath)}`)

  for (const cmd of commands) run(cmd)
} finally {
  if (copied && existsSync(bundledFfmpegPath)) {
    rmSync(bundledFfmpegPath, { force: true })
    console.log('已清理 resources/ffmpeg.exe（不会入库）')
  }
}

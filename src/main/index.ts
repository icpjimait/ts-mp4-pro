import { app, shell, BrowserWindow, ipcMain, WebContents, dialog } from 'electron'
import { join, basename } from 'path' // 新增了 basename 用于提取文件名
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { spawn } from 'child_process'
import { existsSync, statSync } from 'fs' // ✨ 新增这一行

interface TaskData {
  id: string
  path: string
  settings: {
    outputDir: string
    codec: string
  }
  sender: WebContents
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // ✨ 新增：清空等待队列
  ipcMain.on('video:clear-queue', () => {
    taskQueue.length = 0 // 直接清空数组，已经在转换的任务会继续完成，但不会触发新任务
  })
  // ✨ 新增：智能打开文件夹
  ipcMain.on('video:open-folder', (_event, targetPath: string) => {
    try {
      const stat = statSync(targetPath)
      if (stat.isFile()) {
        // 如果是文件，打开所在目录并在资源管理器中选中它 (极其优雅的体验)
        shell.showItemInFolder(targetPath)
      } else {
        // 如果是文件夹，直接打开
        shell.openPath(targetPath)
      }
    } catch (error) {
      console.error('无法打开路径:', error)
    }
  })
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  // ✨ 新增：注册选择文件夹的系统级弹窗服务
  ipcMain.handle('dialog:select-directory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: '选择输出目录',
      properties: ['openDirectory', 'createDirectory']
    })
    if (canceled || filePaths.length === 0) {
      return null
    }
    return filePaths[0]
  })

  // ==========================================
  // 视频转码核心调度引擎
  // ==========================================
  const taskQueue: TaskData[] = []
  const MAX_CONCURRENT = 3
  let activeCount = 0

  ipcMain.on('video:add-task', (event, taskData: Omit<TaskData, 'sender'>) => {
    taskQueue.push({ ...taskData, sender: event.sender })
    processQueue()
  })

  function processQueue(): void {
    if (activeCount >= MAX_CONCURRENT || taskQueue.length === 0) return

    const task = taskQueue.shift()!
    activeCount++

    task.sender.send('video:status', { id: task.id, status: 'processing' })

    const ffmpegPath = (() => {
      const candidate = app.isPackaged
        ? join((process as NodeJS.Process & { resourcesPath: string }).resourcesPath, 'ffmpeg.exe')
        : join(process.cwd(), 'resources', 'ffmpeg.exe')
      return existsSync(candidate) ? candidate : 'ffmpeg'
    })()

    // ✨ 动态决定输出路径：如果有自定义目录，则拼接进去；否则使用源文件所在目录
    const fileName = basename(task.path).replace(/\.[^/.]+$/, '') + '.mp4'
    const outputPath = task.settings.outputDir
      ? join(task.settings.outputDir, fileName)
      : task.path.replace(/\.[^/.]+$/, '') + '.mp4'

    // ✨ 动态注入视频编码器 (copy 或 libx264)
    const args = ['-y', '-i', task.path, '-c:v', task.settings.codec, '-c:a', 'aac', outputPath]

    const child = spawn(ffmpegPath, args)
    let totalDuration = 0

    child.stderr.on('data', (data: Buffer) => {
      const output = data.toString()
      const durationMatch = output.match(/Duration:\s(\d{2}):(\d{2}):(\d{2}\.\d{2})/)
      if (durationMatch && !totalDuration) {
        totalDuration =
          parseInt(durationMatch[1]) * 3600 +
          parseInt(durationMatch[2]) * 60 +
          parseFloat(durationMatch[3])
      }

      const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/)
      if (timeMatch && totalDuration > 0) {
        const currentTime =
          parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseFloat(timeMatch[3])
        let percent = Math.floor((currentTime / totalDuration) * 100)
        if (percent >= 100) percent = 99
        task.sender.send('video:progress', { id: task.id, progress: percent })
      }
    })

    child.on('close', (code) => {
      activeCount--
      if (code === 0) {
        task.sender.send('video:status', { id: task.id, status: 'success', progress: 100 })
      } else {
        task.sender.send('video:status', { id: task.id, status: 'error' })
      }
      processQueue()
    })
  }

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
})

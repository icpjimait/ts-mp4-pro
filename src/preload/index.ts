import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

interface GlobalSettings {
  outputDir: string
  codec: 'copy' | 'libx264'
}

// 1. 定义【添加任务】时传递的数据结构
interface TaskData {
  id: string
  path: string
  settings: GlobalSettings // 新增设置项
}

// 2. 定义【进度更新】时传递的数据结构
interface ProgressData {
  id: string
  progress: number
}

// 3. 定义【状态更新】时传递的数据结构
interface StatusData {
  id: string
  status: 'waiting' | 'processing' | 'success' | 'error'
  progress?: number // 加问号代表这个字段是可选的
}

// 自定义暴露给前端 Vue 使用的 API 集合
const api = {
  getPathForFile: (file: File) => webUtils.getPathForFile(file),

  // 修复 1：将 taskData: any 替换为具体的 taskData: TaskData
  addTask: (taskData: TaskData) => ipcRenderer.send('video:add-task', taskData),

  // 修复 2：明确说明 callback 是一个接收 ProgressData 并返回 void 的函数
  onProgress: (callback: (data: ProgressData) => void) => {
    ipcRenderer.removeAllListeners('video:progress')
    ipcRenderer.on('video:progress', (_event, data) => callback(data))
  },
  // ✨ 新增：调用主进程打开文件夹选择器
  selectDirectory: () => ipcRenderer.invoke('dialog:select-directory'),

  // ✨ 新增：告诉主进程清空正在排队的队列
  clearQueue: () => ipcRenderer.send('video:clear-queue'),

  // ✨ 新增：告诉主进程打开指定的电脑目录
  openFolder: (path: string) => ipcRenderer.send('video:open-folder', path),

  // 修复 3：明确说明 callback 是一个接收 StatusData 并返回 void 的函数
  onStatusChange: (callback: (data: StatusData) => void) => {
    ipcRenderer.removeAllListeners('video:status')
    ipcRenderer.on('video:status', (_event, data) => callback(data))
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface GlobalSettings {
    outputDir: string
    codec: 'copy' | 'libx264'
  }

  interface TaskData {
    id: string
    path: string
    settings: GlobalSettings
  }

  interface ProgressData {
    id: string
    progress: number
  }

  interface StatusData {
    id: string
    status: 'waiting' | 'processing' | 'success' | 'error'
    progress?: number
  }

  interface Window {
    electron: ElectronAPI
    api: {
      getPathForFile: (file: File) => string
      addTask: (taskData: TaskData) => void
      onProgress: (callback: (data: ProgressData) => void) => void
      onStatusChange: (callback: (data: StatusData) => void) => void
      // 新增：打开系统文件夹选择框，返回选中的路径（取消则返回 null）
      selectDirectory: () => Promise<string | null>

      // ✨ 新增的两个接口
      clearQueue: () => void
      openFolder: (path: string) => void
    }
  }
}

export {}

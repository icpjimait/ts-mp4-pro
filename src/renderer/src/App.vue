<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import {
  UploadFilled,
  Setting,
  Folder,
  VideoPlay,
  Delete,
  FolderOpened
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface Task {
  id: string
  name: string
  path: string
  status: 'waiting' | 'processing' | 'success' | 'error'
  progress: number
}

type Codec = 'copy' | 'libx264'

interface GlobalSettings {
  outputDir: string
  codec: Codec
}

const tasks = ref<Task[]>([])
const showSettings = ref(false)
const globalSettings = reactive<GlobalSettings>({
  outputDir: '',
  codec: 'copy'
})

watch(
  globalSettings,
  (newVal) => {
    localStorage.setItem('ts-mp4-settings', JSON.stringify(newVal))
  },
  { deep: true }
)

type ProgressStatus = '' | 'success' | 'exception'

const handleSelectDir = async (): Promise<void> => {
  const dirPath = await window.api.selectDirectory()
  if (dirPath) globalSettings.outputDir = dirPath
}

const getProgressStatus = (status: Task['status']): ProgressStatus => {
  if (status === 'success') return 'success'
  if (status === 'error') return 'exception'
  return ''
}

onMounted(() => {
  const savedSettings = localStorage.getItem('ts-mp4-settings')
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings) as Partial<GlobalSettings>
      if (typeof parsed.outputDir === 'string') globalSettings.outputDir = parsed.outputDir
      if (parsed.codec === 'copy' || parsed.codec === 'libx264') globalSettings.codec = parsed.codec
    } catch (error) {
      console.error(error)
    }
  }

  window.api.onProgress((data: { id: string; progress: number }) => {
    const task = tasks.value.find((t) => t.id === data.id)
    if (task) task.progress = data.progress
  })

  window.api.onStatusChange((data: { id: string; status: Task['status']; progress?: number }) => {
    const task = tasks.value.find((t) => t.id === data.id)
    if (task) {
      task.status = data.status
      if (data.progress !== undefined) task.progress = data.progress
    }
  })
})

// ✨ 核心逻辑：把 File 对象加入列表
const addFilesToList = async (files: FileList | File[]): Promise<void> => {
  let addCount = 0
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file.name.toLowerCase().endsWith('.ts')) {
      const taskId = Date.now().toString() + i + Math.floor(Math.random() * 1000) // 防止批量极速添加导致 ID 重复
      const filePath = await window.api.getPathForFile(file)

      tasks.value.push({
        id: taskId,
        name: file.name,
        path: filePath,
        status: 'waiting',
        progress: 0
      })
      addCount++
    }
  }
  if (addCount > 0) {
    ElMessage.success(`成功添加 ${addCount} 个 TS 文件`)
  }
}

// 处理拖拽事件
const handleDrop = async (e: DragEvent): Promise<void> => {
  const files = e.dataTransfer?.files
  if (files) await addFilesToList(files)
}

// ✨ 新增：处理点击虚线框，弹出文件选择窗口
const openFileSelector = (): void => {
  // 动态创建一个隐藏的 input 元素
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true // 允许批量选择
  input.accept = '.ts' // 只允许选择 TS 文件

  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      await addFilesToList(target.files)
    }
  }

  // 模拟点击触发系统弹窗
  input.click()
}

const startConversion = (): void => {
  const waitingTasks = tasks.value.filter((t) => t.status === 'waiting')
  if (waitingTasks.length === 0) {
    ElMessage.warning('列表中没有需要排队转换的任务')
    return
  }

  waitingTasks.forEach((task) => {
    window.api.addTask({
      id: task.id,
      path: task.path,
      settings: { outputDir: globalSettings.outputDir, codec: globalSettings.codec }
    })
  })
  ElMessage.success(`已将 ${waitingTasks.length} 个任务加入转码队列`)
}

const clearTasks = (): void => {
  tasks.value = []
  window.api.clearQueue()
}

const openOutputDir = (): void => {
  if (globalSettings.outputDir) {
    window.api.openFolder(globalSettings.outputDir)
  } else if (tasks.value.length > 0) {
    window.api.openFolder(tasks.value[0].path)
  } else {
    ElMessage.info('暂无输出目录信息，请先添加文件或在设置中指定')
  }
}
</script>

<template>
  <div class="app-container">
    <div class="header">
      <div class="title">TS转MP4 专家版</div>
      <el-button :icon="Setting" circle @click="showSettings = true"></el-button>
    </div>

    <div class="drop-zone" @drop.prevent="handleDrop" @dragover.prevent @click="openFileSelector">
      <el-icon :size="40" color="#909399"><UploadFilled /></el-icon>
      <p>点击选择 TS 视频文件，或拖拽到此处支持批量导入</p>
    </div>

    <div class="action-bar">
      <el-button type="success" size="large" :icon="VideoPlay" @click="startConversion">
        开始转换
      </el-button>
      <el-button type="danger" size="large" :icon="Delete" @click="clearTasks">清空列表</el-button>
      <div style="flex: 1"></div>
      <el-button size="large" :icon="FolderOpened" @click="openOutputDir">打开输出目录</el-button>
    </div>

    <div class="task-list">
      <el-table
        :data="tasks"
        style="width: 100%"
        height="100%"
        empty-text="请添加 TS 视频文件以开始..."
      >
        <el-table-column prop="name" label="文件名" width="300" show-overflow-tooltip />
        <el-table-column label="进度">
          <template #default="scope">
            <el-progress
              :percentage="scope.row.progress"
              :status="getProgressStatus(scope.row.status)"
              :stroke-width="12"
              striped
              :striped-flow="scope.row.status === 'processing'"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 'waiting'" type="info">待处理</el-tag>
            <el-tag v-else-if="scope.row.status === 'processing'" type="primary">转换中</el-tag>
            <el-tag v-else-if="scope.row.status === 'success'" type="success">已完成</el-tag>
            <el-tag v-else-if="scope.row.status === 'error'" type="danger">失败</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="showSettings" title="全局设置" width="550px">
      <el-form label-position="top">
        <el-form-item label="输出目录 (留空则保存在原文件所在目录)">
          <div style="display: flex; gap: 10px; width: 100%">
            <el-input
              v-model="globalSettings.outputDir"
              placeholder="默认与原文件同目录"
              readonly
            />
            <el-button type="primary" :icon="Folder" @click="handleSelectDir">浏览目录</el-button>
            <el-button v-if="globalSettings.outputDir" @click="globalSettings.outputDir = ''">
              重置
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="视频编码器">
          <el-radio-group v-model="globalSettings.codec">
            <el-radio value="copy" border>无损直通 (极快 / 推荐)</el-radio>
            <el-radio value="libx264" border>H.264 (重新编码 / 修复用)</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="showSettings = false">确认并关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: #141414;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  gap: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header .title {
  font-size: 20px;
  font-weight: bold;
  color: #e5eaf3;
  letter-spacing: 1px;
}

/* ✨ 修改处：给 drop-zone 加上 pointer 样式，让鼠标移上去变成小手 */
.drop-zone {
  height: 120px;
  border: 2px dashed #4c4d4f;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  transition: all 0.3s;
  background-color: #1d1e1f;
  cursor: pointer; /* 变成手型，提示用户这里是可以点击的 */
}

.drop-zone:hover {
  border-color: #409eff;
  background-color: #1a222c;
}

.action-bar {
  display: flex;
  gap: 15px;
  align-items: center;
}

.task-list {
  flex: 1;
  overflow: hidden;
  border: 1px solid #363637;
  border-radius: 8px;
}
</style>

// 从 bilibili 服务器下载文件

import { ECommon, EStorageKey } from '@/constants/common'
import { getPathSpliter } from '@/utils/common'
import { exists, mkdir, remove } from '@tauri-apps/plugin-fs'
import { download as tauriDownload } from '@tauri-apps/plugin-upload'

export async function downloadFile(cfg: {
  fileUrl: string // 下载地址
  filePath: string // 保存路径
  onProgress?: (payload: { progress: number; total: number }) => void // 下载进度回调
}): Promise<void> {
  const headers = new Map()

  const session =
    localStorage.getItem(EStorageKey.SessionKey) ||
    import.meta.env.VITE_APP_SESSION

  // 3 个缺一不可
  headers.set('referer', ECommon.Referer)
  headers.set('User-Agent', window.navigator.userAgent)
  headers.set('cookie', `SESSDATA=${session}`)

  // 检查是否有同名文件, 如果有则删除
  if (await exists(cfg.filePath)) {
    await remove(cfg.filePath)
  }

  // 检查是否有文件夹, 如果没有则创建
  const spliter = getPathSpliter(cfg.filePath)
  const folderPath = cfg.filePath.split(spliter).slice(0, -1).join(spliter)
  if (!(await exists(folderPath))) {
    await mkdir(folderPath, { recursive: true })
  }

  await tauriDownload(
    cfg.fileUrl,
    cfg.filePath,
    ({ progress, total }) => {
      cfg.onProgress?.({ progress, total })
    },
    headers,
  )
}

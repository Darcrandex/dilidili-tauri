import { downloadBV } from '@/core'
import { ALL_BV_DATA_KEY } from '@/hooks/useAllBVData'
import { useSettings } from '@/stores/settings'
import { uuid } from '@/utils/common'
import { useQueryClient } from '@tanstack/react-query'
import { videoDir } from '@tauri-apps/api/path'
import { atom, useAtom } from 'jotai'
import { useCallback } from 'react'

type DownloadQueueItem = {
  id: string
  taskId: string
  params: AppScope.DownloadBVParams
}

// 下载队列
const stateAtom = atom<DownloadQueueItem[]>([])

export function useDownloadQueue() {
  const [settings] = useSettings()
  const [items, setItems] = useAtom(stateAtom)
  const queryClient = useQueryClient()

  // 添加下载队列项并自动执行
  const addAutoRun = useCallback(
    async (taskId: string, params: AppScope.DownloadBVParams) => {
      const id = uuid()
      setItems((prev) => prev.concat({ id, taskId, params }))

      // 执行下载逻辑
      // 完成后移除队列项
      const rootDirPath = settings.rootDirPath || (await videoDir())

      console.log('====> 开始下载', taskId, params)

      downloadBV(taskId, params, rootDirPath)
        .then(() => {
          console.log('执行成功')
        })
        .catch(() => {
          console.log('执行失败')
        })
        .finally(() => {
          setItems((prev) => prev.filter((v) => v.id !== id))
          queryClient.invalidateQueries({ queryKey: ALL_BV_DATA_KEY })
        })
    },
    [queryClient, setItems, settings.rootDirPath],
  )

  return { items, addAutoRun }
}

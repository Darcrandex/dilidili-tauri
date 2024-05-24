import { fsService } from '@/services/fs'
import { useSettings } from '@/stores/use-settings'
import { useQuery } from '@tanstack/react-query'
import { videoDir } from '@tauri-apps/api/path'

// 获取根目录的目录结构树
// 由于多个模块都使用该逻辑，所以封装起来
export function useRootDirTree() {
  const [settings] = useSettings()
  const { data: videoDirPath } = useQuery({ queryKey: ['videoDir'], queryFn: async () => await videoDir() })
  const rootDirPath = settings.rootDirPath || videoDirPath
  const res = useQuery({
    enabled: !!rootDirPath,
    queryKey: ['root-dir-tree', rootDirPath],
    queryFn: () => fsService.getDirTree(rootDirPath || '')
  })

  return res
}

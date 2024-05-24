import { useSettings } from '@/stores/use-settings'
import { useQuery } from '@tanstack/react-query'
import { videoDir } from '@tauri-apps/api/path'

export function useRootDirPath() {
  const [settings] = useSettings()
  const { data: videoDirPath } = useQuery({ queryKey: ['videoDir'], queryFn: async () => await videoDir() })
  const rootDirPath = settings.rootDirPath || videoDirPath

  return rootDirPath
}

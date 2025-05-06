import { useSettings } from '@/stores/settings'
import { videoDir } from '@tauri-apps/api/path'
import { useDebounceEffect } from 'ahooks'
import { useState } from 'react'

export function useRootDirPath() {
  const [settings] = useSettings()
  const [dir, setDir] = useState<string>()

  useDebounceEffect(
    () => {
      videoDir().then((systemVideoDir) => {
        setDir(settings.rootDirPath || systemVideoDir)
      })
    },
    [settings.rootDirPath],
    { wait: 100 },
  )

  return dir
}

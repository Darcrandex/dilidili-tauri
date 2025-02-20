import { useQuery } from '@tanstack/react-query'
import { getVersion } from '@tauri-apps/api/app'
import { fetch as tauriFetch } from '@tauri-apps/plugin-http'

// 最新的版本
export function useLatestVersion() {
  const { data: version } = useQuery({
    queryKey: ['app-version', 'current'],
    queryFn: getVersion,
  })

  const { data: latestVersion } = useQuery({
    queryKey: ['app-version', 'latest'],
    queryFn: async () => {
      try {
        const url = `https://api.github.com/repos/${import.meta.env.VITE_APP_GIT_OWNER}/${import.meta.env.VITE_APP_GIT_REPO}/releases/latest`

        const res = await tauriFetch(url, {
          method: 'GET',
          headers: { 'User-Agent': window.navigator.userAgent },
        })

        const data = await res.json()
        const version = data.tag_name?.match(/(\d+\.\d+\.\d+)/)?.[1] || ''
        return version as string
      } catch (error) {
        console.log('获取最新版本失败', error)

        return ''
      }
    },
  })

  const hasUpdate = !!latestVersion && !!version && latestVersion > version

  return {
    version,
    latestVersion,
    hasUpdate,
  }
}

import { OWNER, REPOSITORY } from '@/constant/common'
import { getUserAgent } from '@/utils/ua'
import { useQuery } from '@tanstack/react-query'
import { getVersion } from '@tauri-apps/api/app'
import { ResponseType, fetch as tauriFetch } from '@tauri-apps/api/http'
import { useMemo } from 'react'

// 最新的版本
export function useLatestVersion() {
  const { data: version } = useQuery({ queryKey: ['app-version', 'current'], queryFn: getVersion })

  const { data: latestVersion } = useQuery({
    queryKey: ['app-version', 'latest'],
    queryFn: async () => {
      try {
        const url = `https://api.github.com/repos/${OWNER}/${REPOSITORY}/releases/latest`

        const res = await tauriFetch<{ tag_name: string }>(url, {
          method: 'GET',
          responseType: ResponseType.JSON,
          headers: { 'User-Agent': getUserAgent() }
        })

        const version = res.data.tag_name?.match(/(\d+\.\d+\.\d+)/)?.[1] || ''
        return version
      } catch (error) {
        return ''
      }
    }
  })

  const hasUpdate = useMemo(() => {
    if (!latestVersion || !version) return false

    const latest = latestVersion.split('.').reduce((a, c) => a + Number(c), 0)
    const current = version.split('.').reduce((a, c) => a + Number(c), 0)

    return latest > current
  }, [latestVersion, version])

  return {
    version,
    latestVersion,
    hasUpdate
  }
}

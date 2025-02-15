import { fsService } from '@/services/fs'
import { useQuery } from '@tanstack/react-query'

export const ALL_BV_DATA_KEY = ['bv', 'all-in-one']

// 将 UP 主列表和 BV 列表整合在一起
export function useAllBVData(rootDirPath?: string) {
  const res = useQuery({
    enabled: !!rootDirPath,
    queryKey: ALL_BV_DATA_KEY.concat(rootDirPath || ''),
    queryFn: () => fsService.getAllBVDataAsync(rootDirPath || ''),

    // 缓存 1 小时
    gcTime: 60 * 60 * 1000,
    staleTime: 60 * 60 * 1000
  })

  return res
}

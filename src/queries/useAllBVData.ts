import { fsService } from '@/services/fs'
import { useQuery } from '@tanstack/react-query'

// allBVDataKey to uppercase
export const ALL_BV_DATA_KEY = ['bv', 'all-in-one']

// 将 UP 主列表和 BV 列表整合在一起
export function useAllBVData(rootDirPath?: string) {
  const { data } = useQuery({
    enabled: !!rootDirPath,
    queryKey: ALL_BV_DATA_KEY.concat(rootDirPath || ''),
    queryFn: () => fsService.getAllBVData(rootDirPath || '')
  })

  return { data }
}

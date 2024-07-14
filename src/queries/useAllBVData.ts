import { fsService } from '@/services/fs'
import { useQuery } from '@tanstack/react-query'

// 将 UP 主列表和 BV 列表整合在一起
export function useAllBVData(rootDirPath?: string) {
  const { data } = useQuery({
    enabled: !!rootDirPath,
    queryKey: ['bv', 'all-in-one', rootDirPath],
    queryFn: () => fsService.getAllBVData(rootDirPath || '')
  })

  return { data }
}

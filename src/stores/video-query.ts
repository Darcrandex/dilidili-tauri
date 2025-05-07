import { ECommon } from '@/const/enums'
import { atom, useAtom } from 'jotai'

// 视频列表页面的搜索条件
const stateAtom = atom<{ mid?: string; keyword?: string; pageNumber?: number }>({ mid: ECommon.AllMid })

export function useVideoQuery() {
  return useAtom(stateAtom)
}

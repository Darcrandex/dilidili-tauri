import { atom, useAtom } from 'jotai'

// 搜索页面的搜索关键字
const stateAtom = atom('')

export function useVideoSearch() {
  return useAtom(stateAtom)
}

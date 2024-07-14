import { atom, useAtom, useSetAtom } from 'jotai'

// 搜索页面缓存的URL
const stateAtom = atom('')

export function useCachedUrl() {
  return useAtom(stateAtom)
}

export function useSetCachedUrl() {
  return useSetAtom(stateAtom)
}

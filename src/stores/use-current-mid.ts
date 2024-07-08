import { atom, useAtom, useSetAtom } from 'jotai'

// 当前选中的up主的mid
const stateAtom = atom('')

export function useCurrentMid() {
  return useAtom(stateAtom)
}

export function useSetCurrentMid() {
  return useSetAtom(stateAtom)
}

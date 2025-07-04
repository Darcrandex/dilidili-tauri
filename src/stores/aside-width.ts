// 视频列表页面,左侧侧边栏的宽度

import { EStorageKey } from '@/const/enums'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

const stateAtom = atomWithStorage(EStorageKey.AisdeWidth, 120)

export function useAdideWidth() {
  return useAtom(stateAtom)
}

// 视频列表页面,左侧侧边栏的宽度

import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

const stateAtom = atomWithStorage('aside-up-list-width', 128)

export function useAdideWidth() {
  return useAtom(stateAtom)
}

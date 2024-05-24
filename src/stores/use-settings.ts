import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// 应用配置
const stateAtom = atomWithStorage('settings', {
  theme: 'dark',
  language: 'zh-CN',
  rootDirPath: '' // 视频文件的根目录
})

export function useSettings() {
  return useAtom(stateAtom)
}

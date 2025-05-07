import { EStorageKey } from '@/const/enums'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// 应用配置
const stateAtom = atomWithStorage(EStorageKey.Settings, {
  rootDirPath: '', // 视频文件的根目录
})

export function useSettings() {
  return useAtom(stateAtom)
}

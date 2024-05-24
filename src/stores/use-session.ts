import { ECommon } from '@/enum/common'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// 登录后的SESSDATA
const stateAtom = atomWithStorage(ECommon.SessionKey, '')

export function useSession() {
  return useAtom(stateAtom)
}

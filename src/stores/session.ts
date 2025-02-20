import { EStorageKey } from '@/constants/common'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// 登录后的SESSDATA
const stateAtom = atomWithStorage(EStorageKey.SessionKey, '')

export function useSession() {
  return useAtom(stateAtom)
}

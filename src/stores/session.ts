import { EStorageKey } from '@/const/enums'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// 登录后的SESSDATA
const stateAtom = atomWithStorage(EStorageKey.SessionKey, '')

export function useSession() {
  return useAtom(stateAtom)
}

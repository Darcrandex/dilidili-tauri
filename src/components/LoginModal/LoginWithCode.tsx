/**
 * @name LoginWithCode
 * @description 二维码登录
 * @author darcrand
 */

import { EStorageKey } from '@/const/enums'
import { userService } from '@/services/user'
import { useSession } from '@/stores/session'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import qrcode from 'qrcode'
import QueryString from 'qs'
import { useEffect } from 'react'

export default function LoginWithCode(props: { onSuccess?: () => void }) {
  const [, updateSession] = useSession()
  const queryClient = useQueryClient()

  const { data: qrcodeRes } = useQuery({
    queryKey: ['sign', 'qrcode'],
    queryFn: async () => {
      const res = await userService.qrcode()
      const base64Url = await qrcode.toDataURL(res.url)
      return { ...res, base64Url }
    },
  })

  const { data: codeStatus } = useQuery({
    queryKey: ['sign', 'watch', 'qrcode', qrcodeRes?.qrcode_key],
    enabled: !!qrcodeRes?.qrcode_key,
    retry: true,
    retryDelay: 2000,
    queryFn: async () => {
      const res = await userService.qrcodeCheck(qrcodeRes?.qrcode_key || '')
      if (res.code !== 0) {
        throw new Error(res.message)
      }
      return res
    },
  })

  useEffect(() => {
    const query = codeStatus?.url?.split('?')?.[1]
    if (query) {
      const params = QueryString.parse(query)
      if (typeof params[EStorageKey.SessionKey] === 'string') {
        console.log('登录成功')
        updateSession(params[EStorageKey.SessionKey])
        props.onSuccess?.()
      }
    }
  }, [codeStatus, props, updateSession])

  return (
    <>
      <section className='mx-auto h-52 w-52 overflow-hidden rounded-md border border-gray-200 p-2'>
        {!!qrcodeRes?.url && (
          <div className='relative'>
            <img
              src={qrcodeRes.base64Url}
              alt=''
              className='block h-auto w-full'
            />

            <i
              className='absolute inset-0 flex cursor-pointer items-center justify-center bg-white/90 opacity-0 transition-all hover:opacity-100'
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ['sign', 'qrcode'] })
              }
            >
              刷新二维码
            </i>
          </div>
        )}
      </section>
    </>
  )
}

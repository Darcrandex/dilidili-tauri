/**
 * @name LoginWithCode
 * @description 二维码登录
 * @author darcrand
 */

import { EQrcodeStatus } from '@/const/enums'
import { userService } from '@/services/user'
import { useSession } from '@/stores/session'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import qrcode from 'qrcode'
import { useEffect, useRef } from 'react'

// 轮询间隔
const POLL_INTERVAL = 2000

const statusTextDict: Record<number, string> = {
  [EQrcodeStatus.Success]: '登录成功',
  [EQrcodeStatus.Waiting]: '请使用哔哩哔哩客户端扫码',
  [EQrcodeStatus.Scanned]: '扫码成功, 请在手机上确认',
  [EQrcodeStatus.Expired]: '二维码已失效, 请刷新',
}

export default function LoginWithCode({ onSuccess }: { onSuccess?: () => void }) {
  const [, updateSession] = useSession()
  const queryClient = useQueryClient()
  // 登录成功后只处理一次
  const isDoneRef = useRef(false)

  const { data: qrcodeRes } = useQuery({
    queryKey: ['sign', 'qrcode'],
    queryFn: async () => {
      const res = await userService.qrcode()
      const base64Url = await qrcode.toDataURL(res.url)
      return { ...res, base64Url }
    },
  })

  const { data: loginRes } = useQuery({
    queryKey: ['sign', 'watch', 'qrcode', qrcodeRes?.qrcode_key],
    enabled: !!qrcodeRes?.qrcode_key,
    // 失败时没必要重试, 下一次轮询就会重新请求
    retry: false,
    queryFn: () => userService.qrcodeCheck(qrcodeRes?.qrcode_key || ''),
    // 只有还在等待扫码时才继续轮询
    refetchInterval: (query) => {
      const code = query.state.data?.code
      return code === EQrcodeStatus.Success || code === EQrcodeStatus.Expired ? false : POLL_INTERVAL
    },
  })

  useEffect(() => {
    // 登录凭证通过 Set-Cookie 下发
    const sessdata = loginRes?.cookies.SESSDATA
    if (!sessdata || isDoneRef.current) return

    isDoneRef.current = true
    updateSession(sessdata)
    onSuccess?.()
  }, [loginRes, updateSession, onSuccess])

  const onRefresh = () => {
    isDoneRef.current = false
    queryClient.invalidateQueries({ queryKey: ['sign', 'qrcode'] })
  }

  const statusText = statusTextDict[loginRes?.code ?? EQrcodeStatus.Waiting]

  return (
    <>
      <section className='mx-auto h-52 w-52 overflow-hidden rounded-md border border-gray-200 p-2'>
        {qrcodeRes?.url ? (
          <div className='relative'>
            <img src={qrcodeRes.base64Url} alt='' className='block h-auto w-full' />

            <i
              className='absolute inset-0 flex cursor-pointer items-center justify-center bg-white/90 opacity-0 transition-all hover:opacity-100'
              onClick={onRefresh}
            >
              刷新二维码
            </i>
          </div>
        ) : (
          <div className='flex h-full items-center justify-center text-sm text-slate-400'>二维码加载中...</div>
        )}
      </section>

      <p className='mt-3 text-center text-sm text-slate-500'>{statusText}</p>
    </>
  )
}

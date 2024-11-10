/**
 * @name UImage
 * @description
 * @author darcrand
 */

import { imageToBase64 } from '@/core/image-to-base64'
import { cls } from '@/utils/cls'
import { useQuery } from '@tanstack/react-query'

// 针对某部分请求返回的图片资源为 http 开头
// 导致无法正常显示图片
// 通过主进程请求转换成 base64
const isHttpUrl = (url: string) => url.startsWith('http://')

export type UImageProps = {
  src?: string
  fit?: 'cover' | 'contain'
  onClick?: (e: React.MouseEvent) => void
  className?: string
  style?: React.CSSProperties
}

export default function UImage(props: UImageProps) {
  const { data: base64, isSuccess } = useQuery({
    enabled: !!props.src,
    staleTime: 60 * 1000,
    queryKey: ['image', 'base64', props.src],
    queryFn: async () => {
      if (isHttpUrl(props.src || '')) {
        return imageToBase64(props.src || '')
      } else {
        return props.src
      }
    }
  })

  return (
    <>
      <div
        className={cls('min-h-8 bg-slate-100 bg-center bg-no-repeat transition-all', props.className)}
        style={{
          ...props.style,
          backgroundImage: isSuccess ? `url(${base64})` : undefined,
          backgroundSize: props.fit || 'cover'
        }}
        onClick={props.onClick}
      ></div>
    </>
  )
}

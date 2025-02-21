import { getPreviewImageUrl } from '@/core/request'
import { cls } from '@/utils/cls'
import { useQuery } from '@tanstack/react-query'

function isNetworkUrl(url?: string) {
  if (!url) return false
  const regex = /^(?!https?:\/\/asset$)https?:\/\//
  return regex.test(url)
}

function isVailImageUrl(url?: string) {
  return new Promise<boolean>((resolve) => {
    if (!url) {
      resolve(false)
      return
    }
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

export type UImageProps = {
  src?: string
  fit?: 'cover' | 'contain' // 默认 cover
  onClick?: (e: React.MouseEvent) => void
  className?: string
  style?: React.CSSProperties
}

export default function ImageView(props: UImageProps) {
  const { data: imageSrc, isSuccess } = useQuery({
    enabled: !!props.src,
    staleTime: 60 * 1000,
    queryKey: ['image', 'preview', props.src],
    queryFn: async () => {
      const url =
        !!props.src && isNetworkUrl(props.src)
          ? await getPreviewImageUrl(props.src)
          : props.src

      if (await isVailImageUrl(url)) {
        return url
      } else {
        console.error('invalid image url', url)
        throw new Error('invalid image url')
      }
    },
  })

  return (
    <>
      <div
        className={cls(
          'min-h-8 overflow-hidden bg-slate-100 bg-center bg-no-repeat transition-all',
          props.className,
        )}
        style={props.style}
        onClick={props.onClick}
      >
        {isSuccess && (
          <img
            src={imageSrc}
            className={cls(
              'block h-full w-full',
              props.fit === 'contain' ? 'object-contain' : 'object-cover',
            )}
          />
        )}
      </div>
    </>
  )
}

import { getPreviewImageUrl } from '@/core/request'
import { cls } from '@/utils/cls'
import { useQuery } from '@tanstack/react-query'

function isValidUrl(url: string) {
  const regex = /^(?!https?:\/\/asset$)https?:\/\//
  return regex.test(url)
}

export type UImageProps = {
  src?: string
  fit?: 'cover' | 'contain'
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
      if (isValidUrl(props.src || '')) {
        return getPreviewImageUrl(props.src || '')
      } else {
        return props.src
      }
    },
  })

  return (
    <>
      <div
        className={cls(
          'min-h-8 bg-slate-100 bg-center bg-no-repeat transition-all',
          props.className,
        )}
        style={{
          ...props.style,
          backgroundImage: isSuccess ? `url(${imageSrc})` : undefined,
          backgroundSize: props.fit || 'cover',
        }}
        onClick={props.onClick}
      ></div>
    </>
  )
}

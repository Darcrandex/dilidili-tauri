/**
 * @name UImage
 * @description
 * @author darcrand
 */

import { cls } from '@/utils/cls'
import { useState } from 'react'

export type UImageProps = {
  src?: string
  fit?: 'cover' | 'contain'
  className?: string
  onClick?: (e: React.MouseEvent) => void
}

export default function UImage(props: UImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      <div
        className={cls('min-h-8 bg-slate-100 transition-all bg-no-repeat bg-center', props.className)}
        style={{ backgroundImage: loaded ? `url(${props.src})` : undefined, backgroundSize: props.fit || 'cover' }}
        onClick={props.onClick}
      >
        {!!props.src && (
          <img
            src={props.src}
            alt=''
            referrerPolicy='no-referrer'
            style={{ display: 'none' }}
            onLoad={() => setLoaded(true)}
          />
        )}
      </div>
    </>
  )
}

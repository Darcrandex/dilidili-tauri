import { cls } from '@/utils/cls'
import { useSize } from 'ahooks'
import { CSSProperties, useEffect, useRef, useState } from 'react'

export type IProps = {
  items: {
    key: string
    title: string
    onClick?: (key: string) => void
  }[]

  activeKey?: string
  className?: string
}

export default function NavTabs(props: IProps) {
  const winSize = useSize(() => window.document.body)
  const refContainer = useRef<HTMLUListElement>(null)
  const currIndex = props.items.findIndex((v) => !!props.activeKey && v.key.includes(props.activeKey))
  const [style, setStyle] = useState<CSSProperties>()

  useEffect(() => {
    if (refContainer.current) {
      const targetTabEle = refContainer.current.children[Math.max(0, currIndex)]

      if (targetTabEle) {
        const containerRect = refContainer.current.getBoundingClientRect()
        const targetRect = targetTabEle?.getBoundingClientRect()
        const offetLeft = targetRect.left - containerRect.left
        setStyle({
          width: `${targetRect.width}px`,
          transform: `translateX(${offetLeft}px)`,
        })
      }
    }
  }, [currIndex, winSize?.width])

  if (!props.items) return null

  return (
    <>
      <ul ref={refContainer} className={cls('relative flex', props.className)}>
        {props.items.map((v) => (
          <li
            key={v.key}
            onClick={() => v.onClick?.(v.key)}
            className={cls(
              'mx-4 cursor-pointer py-4 font-bold transition-all',
              !!props.activeKey && v.key.includes(props.activeKey)
                ? 'text-primary'
                : 'hover:text-primary/80 text-slate-700',
            )}
          >
            {v.title}
          </li>
        ))}

        <li
          className='pointer-events-none absolute bottom-0 left-0 m-0 text-center transition-all duration-300'
          style={style}
        >
          <i className='bg-primary absolute bottom-0 left-1/2 h-1 w-6 -translate-x-1/2'></i>
        </li>
      </ul>
    </>
  )
}

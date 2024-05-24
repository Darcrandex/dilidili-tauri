/**
 * @name UTabs
 * @description
 * @author darcrand
 */

import { cls } from '@/utils/cls'
import { useSize } from 'ahooks'
import { CSSProperties, useEffect, useRef, useState } from 'react'

export type UTabsProps = {
  items: {
    key: string
    title: string
    onClick?: (key: string) => void
  }[]

  activeKey?: string
  className?: string
}

export default function UTabs(props: UTabsProps) {
  const winSize = useSize(() => window.document.body)
  const refContainer = useRef<HTMLUListElement>(null)
  const currIndex = props.items.findIndex((v) => v.key === props.activeKey)
  const [style, setStyle] = useState<CSSProperties>()

  useEffect(() => {
    if (refContainer.current) {
      const targetTabEle = refContainer.current.children[Math.max(0, currIndex)]

      if (targetTabEle) {
        const containerRect = refContainer.current.getBoundingClientRect()
        const targetRect = targetTabEle?.getBoundingClientRect()
        const offetLeft = targetRect.left - containerRect.left
        setStyle({ width: `${targetRect.width}px`, transform: `translateX(${offetLeft}px)` })
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
            className={cls(
              'mx-4 py-2 transition-all font-bold',
              v.key === props.activeKey ? 'text-primary' : 'hover:text-primary/80'
            )}
          >
            <button onClick={() => v.onClick?.(v.key)}>{v.title}</button>
          </li>
        ))}

        <li
          className='absolute left-0 bottom-0 m-0 text-center transition-all duration-300 pointer-events-none'
          style={style}
        >
          <i className='absolute left-1/2 top-0 w-6 h-1 bg-primary -translate-x-1/2'></i>
        </li>
      </ul>
    </>
  )
}

/**
 * @name ResizeDivider
 * @description 视频列表页面分割线
 * @author darcrand
 */

import { useAdideWidth } from '@/stores/aside-width'
import { useCallback, useRef } from 'react'

export default function ResizeDivider() {
  const [leftWidth, setLeftWidth] = useAdideWidth()
  const handleRef = useRef<HTMLElement>(null)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const startX = e.clientX
      const startWidth = leftWidth

      const onMouseMove = (e: MouseEvent) => {
        const dx = e.clientX - startX
        const newWidth = startWidth + dx
        const minWidth = 100
        const maxWidth = 320
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setLeftWidth(newWidth)
        }
      }

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)

      return () => {
        console.log('clear')

        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }
    },
    [leftWidth, setLeftWidth],
  )
  return (
    <div className='hover:bg-primary relative w-[1px] bg-gray-200 transition-all'>
      <i
        ref={handleRef}
        onMouseDown={handleMouseDown}
        className='absolute top-0 bottom-0 left-0 w-3 -translate-x-1/2 transform cursor-ew-resize'
      ></i>
    </div>
  )
}

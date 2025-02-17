/**
 * @name Space
 * @description
 * @author darcrand
 */

import OwnerListItem from '@/components/OwnerListItem'
import { useRootDirPath } from '@/hooks/use-root-dir-path'
import { useAllBVData } from '@/queries/useAllBVData'
import { cls } from '@/utils/cls'
import { Avatar } from 'antd'
import { Suspense, useCallback, useRef, useState } from 'react'
import { NavLink, Outlet, useParams } from 'react-router-dom'

export default function Space() {
  const rootDirPath = useRootDirPath()
  const { data: allData } = useAllBVData(rootDirPath)

  const mid = useParams().id
  const isAll = !mid

  // UI
  const [leftWidth, setLeftWidth] = useState(128)
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
        const maxWidth = 400
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
    },
    [leftWidth]
  )

  return (
    <>
      <section className='flex h-full flex-1'>
        <aside className='flex-shrink-0 overflow-auto' style={{ width: leftWidth }}>
          <NavLink
            className={cls(
              'm-2 flex items-center space-x-2 rounded-md p-2 transition-all',
              isAll ? 'bg-slate-100 text-primary' : '!text-gray-500 hover:!bg-slate-50'
            )}
            to=''
          >
            <Avatar className='h-8 w-8 flex-shrink-0'>all</Avatar>
            <span className='truncate text-sm'>全部UP主</span>
          </NavLink>

          {allData?.ups.map((v) => <OwnerListItem key={v.mid} mid={v.mid} path={v.path} />)}
        </aside>

        <div className='relative w-[1px] bg-gray-200 transition-all hover:bg-primary'>
          <i
            ref={handleRef}
            onMouseDown={handleMouseDown}
            className='absolute bottom-0 left-0 top-0 w-3 -translate-x-1/2 transform cursor-ew-resize'
          ></i>
        </div>

        <main className='flex-1 overflow-auto'>
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </main>
      </section>
    </>
  )
}

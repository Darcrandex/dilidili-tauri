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
import { Suspense, useState } from 'react'
import { NavLink, Outlet, useParams } from 'react-router-dom'

import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

export default function Space() {
  const rootDirPath = useRootDirPath()
  const { data: allData } = useAllBVData(rootDirPath)

  const mid = useParams().id
  const isAll = !mid

  // UI
  const [isDragging, setIsDragging] = useState(false)

  return (
    <>
      <PanelGroup direction='horizontal' className='flex h-full flex-1'>
        <Panel id='sidebar' defaultSize={15} minSize={10} maxSize={30} order={1}>
          <aside className='overflow-auto'>
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
        </Panel>

        <PanelResizeHandle
          onDragging={setIsDragging}
          className={cls('w-[1px] bg-gray-200 transition-all', isDragging ? 'cursor-move bg-primary' : '')}
        />

        <Panel minSize={25} order={2}>
          <main className='overflow-auto'>
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </main>
        </Panel>
      </PanelGroup>
    </>
  )
}

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
import { Suspense } from 'react'
import { NavLink, Outlet, useParams } from 'react-router-dom'

export default function Space() {
  const rootDirPath = useRootDirPath()
  const { data: allData } = useAllBVData(rootDirPath)

  const mid = useParams().id
  const isAll = !mid

  return (
    <>
      <section className='flex h-full flex-1'>
        <aside className='w-40 overflow-auto border-r'>
          <NavLink
            className={cls(
              'm-2 flex items-center space-x-2 rounded-md p-2 transition-all',
              isAll ? 'bg-slate-100 text-primary' : '!text-gray-500 hover:!bg-slate-50'
            )}
            to=''
          >
            <Avatar className='h-8 w-8'>all</Avatar>
            <span className='truncate text-sm'>全部UP主</span>
          </NavLink>

          {allData?.ups.map((v) => <OwnerListItem key={v.mid} mid={v.mid} path={v.path} />)}
        </aside>

        <main className='flex-1 overflow-auto'>
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </main>
      </section>
    </>
  )
}

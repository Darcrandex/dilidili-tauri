/**
 * @name Space
 * @description
 * @author darcrand
 */

import OwnerListItem from '@/components/OwnerListItem'
import { useRootDirPath } from '@/hooks/use-root-dir-path'
import { fsService } from '@/services/fs'
import { cls } from '@/utils/cls'
import { useQuery } from '@tanstack/react-query'
import { Avatar } from 'antd'
import { Suspense } from 'react'
import { NavLink, Outlet, useParams } from 'react-router-dom'

export default function Space() {
  const rootDirPath = useRootDirPath()
  const { data: ownerDirs } = useQuery({
    enabled: !!rootDirPath,
    queryKey: ['owner-dirs', rootDirPath],
    queryFn: () => fsService.getOwnerDirs(rootDirPath || '')
  })

  const mid = useParams().id
  const isAll = !mid

  return (
    <>
      <section className='flex-1 flex h-full'>
        <aside className='w-40 border-r overflow-auto'>
          <NavLink
            className={cls(
              'flex items-center space-x-2 m-2 p-2 rounded-md transition-all',
              isAll ? 'text-primary bg-slate-100' : 'hover:bg-slate-50'
            )}
            to=''
          >
            <Avatar className='w-8 h-8'>all</Avatar>
            <span className='truncate text-sm'>全部UP主</span>
          </NavLink>

          {ownerDirs?.map((v) => <OwnerListItem key={v.mid} mid={v.mid} path={v.path} />)}
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

/**
 * @name HomeLayout
 * @description
 * @author darcrand
 */

import logoImage from '@/assets/logos/dilidili-logo1@0.25x.png'
import NavTabs from '@/ui/NavTabs'
import { Suspense } from 'react'
import { Outlet, useMatch, useNavigate } from 'react-router'

const navs = [
  { to: 'search', title: '搜索视频' },
  { to: 'tasks', title: '下载任务' },
  { to: 'space', title: '本地视频' },
]

export default function HomeLayout() {
  const navigate = useNavigate()
  const tabKey = useMatch('/home/:tabKey/*')?.params.tabKey

  return (
    <>
      <section className='flex h-screen flex-col'>
        <header className='relative flex items-center border-b border-gray-200 select-none'>
          <img src={logoImage} alt='dilidili' className='mx-4 h-8 w-auto' />

          <nav className='ml-4 flex items-center space-x-2'>
            <NavTabs
              items={navs.map((v) => ({
                key: v.to,
                title: v.title,
                onClick: () => navigate(v.to, { replace: true }),
              }))}
              activeKey={tabKey}
            />
          </nav>
        </header>

        <div className='flex-1 overflow-auto'>
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </div>
      </section>
    </>
  )
}

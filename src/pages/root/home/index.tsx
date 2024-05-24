/**
 * @name Home
 * @description
 * @author darcrand
 */

import TopHeader from '@/components/TopHeader'
import UTabs from '@/ui/UTabs'
import { Suspense } from 'react'
import { Outlet, useMatch, useNavigate } from 'react-router-dom'

const navs = [
  { to: 'search', title: '搜索视频' },
  { to: 'tasks', title: '下载任务' },
  { to: 'space', title: '本地视频' }
]

export default function Home() {
  const navigate = useNavigate()
  const tabKey = useMatch('/home/:tabKey/*')?.params.tabKey

  return (
    <>
      <section className='flex flex-col h-screen'>
        <TopHeader>
          <nav className='flex items-center ml-4 space-x-2'>
            <UTabs
              items={navs.map((v) => ({
                key: v.to,
                title: v.title,
                onClick: () => navigate(v.to, { replace: true })
              }))}
              activeKey={tabKey}
            />
          </nav>
        </TopHeader>

        <div data-name='scroll-container' className='flex-1 overflow-auto'>
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </div>
      </section>
    </>
  )
}

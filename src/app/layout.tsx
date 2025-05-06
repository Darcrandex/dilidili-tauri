/**
 * @name AppLayout
 * @description
 * @author darcrand
 */

import AsideMenus from '@/components/AsideMenus'
import { Suspense } from 'react'
import { Outlet } from 'react-router'

export default function AppLayout() {
  return (
    <>
      <section className='flex h-screen flex-1'>
        <AsideMenus />

        <main className='flex-1'>
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </main>
      </section>
    </>
  )
}

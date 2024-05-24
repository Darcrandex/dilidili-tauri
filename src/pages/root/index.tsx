/**
 * @name Root
 * @description
 * @author darcrand
 */

import AsideMenus from '@/components/AsideMenus'
import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

export default function Root() {
  return (
    <>
      <section className='flex-1 flex h-screen'>
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

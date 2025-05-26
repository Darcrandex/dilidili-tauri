/**
 * @name AppLayout
 * @description
 * @author darcrand
 */

import AsideMenus from '@/components/AsideMenus'
import { notification } from '@/components/GlobalAntdMessage'
import { useLatestVersion } from '@/hooks/useLatestVersion'
import { Suspense, useEffect } from 'react'
import { Outlet } from 'react-router'

export default function AppLayout() {
  const { latestVersion, hasUpdate } = useLatestVersion()

  useEffect(() => {
    if (hasUpdate) {
      notification.info({
        key: 'app-update',
        duration: 0,
        message: '发现新版本',
        description: (
          <a
            href={`https://github.com/${import.meta.env.VITE_APP_GIT_OWNER}/${import.meta.env.VITE_APP_GIT_REPO}/releases/latest`}
            target='_blank'
            rel='noreferrer'
          >
            点击查看最新版本：{latestVersion}
          </a>
        ),
      })
    }
  }, [hasUpdate, latestVersion])

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

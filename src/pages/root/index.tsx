/**
 * @name Root
 * @description
 * @author darcrand
 */

import AsideMenus from '@/components/AsideMenus'
import { OWNER, REPOSITORY } from '@/constant/common'
import { useLatestVersion } from '@/queries/useLatestVersion'
import { App } from 'antd'
import { Suspense, useEffect } from 'react'
import { Outlet } from 'react-router-dom'

export default function Root() {
  const { latestVersion, hasUpdate } = useLatestVersion()
  const { notification } = App.useApp()

  useEffect(() => {
    if (hasUpdate) {
      notification.info({
        key: 'app-update',
        duration: 0,
        message: '发现新版本',
        description: (
          <a href={`https://github.com/${OWNER}/${REPOSITORY}/releases/latest`} target='_blank' rel='noreferrer'>
            点击查看最新版本：{latestVersion}
          </a>
        )
      })
    }
  }, [hasUpdate, latestVersion, notification])

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

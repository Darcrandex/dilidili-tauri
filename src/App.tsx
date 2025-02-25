import { StyleProvider } from '@ant-design/cssinjs'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { App as AntdApp, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { createBrowserRouter, RouterProvider } from 'react-router'

import { useEffect } from 'react'
import { routes } from './routes'
import { createIDBPersister } from './utils/indexdb-persister'

const router = createBrowserRouter(routes)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 2,
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
})

// 使用持久化存储 react-query 的数据
const persister = createIDBPersister('dilidili-storage')

export default function App() {
  const themeColor = '#fb7299'

  useEffect(() => {
    // 禁用右键功能
    // 但仍然可以使用快捷键打开调试工具
    const handle = (e: MouseEvent) => {
      if (import.meta.env.PROD) {
        e.preventDefault()
      }
    }
    document.addEventListener('contextmenu', handle)
    return () => {
      document.removeEventListener('contextmenu', handle)
    }
  }, [])

  return (
    <>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <ConfigProvider
          locale={zhCN}
          theme={{
            token: { colorPrimary: themeColor, colorLink: themeColor },
          }}
        >
          <StyleProvider hashPriority='high'>
            <AntdApp>
              <RouterProvider router={router} />
            </AntdApp>
          </StyleProvider>
        </ConfigProvider>
      </PersistQueryClientProvider>
    </>
  )
}

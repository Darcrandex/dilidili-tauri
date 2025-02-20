import { StyleProvider } from '@ant-design/cssinjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App as AntdApp, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { createBrowserRouter, RouterProvider } from 'react-router'

import { routes } from './routes'

const router = createBrowserRouter(routes)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, gcTime: 1000 * 60 * 10 },
  },
})

export default function App() {
  const themeColor = '#fb7299'

  return (
    <>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </>
  )
}

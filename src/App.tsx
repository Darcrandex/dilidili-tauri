import GlobalAntdMessage from '@/components/GlobalAntdMessage'
import {
  legacyLogicalPropertiesTransformer,
  StyleProvider,
} from '@ant-design/cssinjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App as AntdApp, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { useCssValue } from './hooks/useCssValue'
import { routes } from './routes'

const router = createBrowserRouter(routes)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  const [themeColor] = useCssValue('--color-primary')

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
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          locale={zhCN}
          theme={{
            token: themeColor
              ? { colorPrimary: themeColor, colorLink: themeColor }
              : undefined,
          }}
        >
          <StyleProvider
            hashPriority='high'
            transformers={[legacyLogicalPropertiesTransformer]}
          >
            <AntdApp>
              <GlobalAntdMessage />
              <RouterProvider router={router} />
            </AntdApp>
          </StyleProvider>
        </ConfigProvider>
      </QueryClientProvider>
    </>
  )
}

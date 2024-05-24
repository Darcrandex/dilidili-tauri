import { StyleProvider } from '@ant-design/cssinjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import 'dayjs/locale/zh-cn'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

const root = document.getElementById('root') || document.body
const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      gcTime: 5 * 60 * 1000,
      staleTime: 1 * 60 * 1000
    }
  }
})

ReactDOM.createRoot(root).render(
  <>
    <QueryClientProvider client={client}>
      <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#fb7299', colorLink: '#fb7299' } }}>
        <StyleProvider hashPriority='high'>
          <App />
        </StyleProvider>
      </ConfigProvider>
    </QueryClientProvider>
  </>
)

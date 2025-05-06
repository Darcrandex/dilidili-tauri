import { message } from '@/components/GlobalAntdMessage'
import axios from 'axios'
import Qs from 'qs'

export const http = axios.create({
  paramsSerializer: function (params) {
    return Qs.stringify(params, { arrayFormat: 'brackets' })
  },
})

http.interceptors.request.use((config) => {
  // 在请求头中加入 token
  const authToken = localStorage.getItem('token')
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }

  return config
})

http.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 对于错误的请求, 统一使用 antd message 提示错误信息
    message.error('fetch failed')

    return Promise.reject(error)
  },
)

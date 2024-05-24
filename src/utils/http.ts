import { ECommon } from '@/enum/common'
import type { ResponseSchema } from '@/types/global'
import { Body, fetch, ResponseType } from '@tauri-apps/api/http'
import { getUserAgent } from './ua'

export function getDefaultHeaders() {
  const session = localStorage.getItem(ECommon.SessionKey) || ''
  return {
    'User-Agent': getUserAgent(),
    cookie: `${ECommon.SessionKey}=${session}`
  }
}

export const http = {
  async get<Data = any>(url: string, query?: Record<string, any>) {
    try {
      const response = await fetch<ResponseSchema<Data>>(url, {
        method: 'GET',
        responseType: ResponseType.JSON,
        headers: getDefaultHeaders(),
        query
      })

      if (response.ok) {
        if (response.data.code === 0) {
          return response.data.data
        } else {
          throw new Error(response.data.message || '未知错误')
        }
      } else {
        throw new Error('请求失败')
      }
    } catch (error) {
      throw new Error('请求失败')
    }
  },

  async post<Data = any>(url: string, data?: Record<string, any>) {
    const body = data ? Body.json(data) : undefined
    const response = await fetch<ResponseSchema<Data>>(url, {
      body,
      method: 'POST',
      responseType: ResponseType.JSON,
      headers: getDefaultHeaders()
    })

    return response.data
  }
}

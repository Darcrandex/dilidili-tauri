// tauri-http 与 bilibili-api 的请求封装

import { ECommon, EStorageKey } from '@/const/enums'
import { fetch } from '@tauri-apps/plugin-http'

// 获取跨域请求的 headers
export function getCORSHeaders() {
  const session =
    localStorage.getItem(EStorageKey.SessionKey) ||
    import.meta.env.VITE_APP_SESSION

  // Origin 置空可以达到允许跨域的效果
  // User-Agent 也是必传的, 直接引用浏览器的 userAgent 即可
  // cookie 如果没有只能搜索,不能下载文件
  return {
    Origin: '',
    'User-Agent': window.navigator.userAgent,
    Referer: ECommon.Referer,
    cookie: `SESSDATA=${session}`,
  }
}

// 封装请求
export const http = {
  /**
   * @param url 请求地址
   * @param params 请求参数
   */
  async get<T = unknown>(url: string, params?: Record<string, unknown>) {
    const query = Object.entries(params || {})
      .filter(([, v]) => !!v)
      .map(([k, v]) => `${k}=${v}`)
      .join('&')

    const requestUrl = query ? `${url}?${query}` : url
    const res = await fetch(requestUrl, { headers: getCORSHeaders() })

    // bilibili 接口的返回格式
    if (res.status === 200) {
      const data = await res.json()
      if (data.code === 0) {
        return data.data as T
      }
    }

    console.error('===> fetch failed', res)
    throw new Error(res.statusText)
  },
}

/**
 * 获取可以跨域的预览图像的 URL
 * @param url 原始的第三方图像 URL
 * @returns 预览图像的 URL
 */
export async function getPreviewImageUrl(url: string) {
  const res = await fetch(url, {
    method: 'GET',
    headers: getCORSHeaders(),
  })

  if (res.status === 200) {
    const blob = await res.blob()
    return URL.createObjectURL(blob)
  }

  throw new Error(res.statusText)
}

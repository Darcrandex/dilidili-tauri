// tauri-http 与 bilibili-api 的请求封装

import { ECommon, EStorageKey } from '@/const/enums'
import { fetch } from '@tauri-apps/plugin-http'

// 读取本地保存的 SESSDATA
// jotai 的 atomWithStorage 会做一次 JSON.stringify, 所以要还原出原始的值
export function readSession() {
  const raw = localStorage.getItem(EStorageKey.SessionKey) || import.meta.env.VITE_APP_SESSION || ''
  try {
    const value = JSON.parse(raw)
    return typeof value === 'string' ? value : raw
  } catch {
    return raw
  }
}

// 获取跨域请求的 headers
export function getBaseHeaders() {
  // Origin 置空可以达到允许跨域的效果
  // User-Agent 也是必传的, 直接引用浏览器的 userAgent 即可
  return {
    Origin: '',
    'User-Agent': window.navigator.userAgent,
    Referer: ECommon.Referer,
  }
}

// 带上登录态的跨域请求头
// cookie 如果没有只能搜索, 不能下载文件
export function getCORSHeaders() {
  return { ...getBaseHeaders(), cookie: `SESSDATA=${readSession()}` }
}

// 拼接 query 参数, 过滤掉空值
function buildQuery(params?: Record<string, unknown>) {
  return Object.entries(params || {})
    .filter(([, value]) => !!value)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&')
}

// 发送请求, 返回原始的 Response
async function request(url: string, params?: Record<string, unknown>) {
  const query = buildQuery(params)
  const requestUrl = query ? `${url}?${query}` : url

  return await fetch(requestUrl, { headers: getCORSHeaders() })
}

// Headers 会把多个 Set-Cookie 合并成以 ", " 拼接的字符串
// 但 Expires 里本身就带逗号, 所以只按 "逗号 + key=" 的位置拆分
function splitSetCookie(raw: string) {
  return raw
    .split(/\s*,\s*(?=[^;=,\s]+=)/)
    .map((item) => item.trim())
    .filter(Boolean)
}

// 解析响应头里的 Set-Cookie
// 浏览器的 fetch 读不到 Set-Cookie, 但 tauri 的 fetch 走的是原生请求, 可以读到
export function readResponseCookies(res: Response) {
  const headers = res.headers as Headers & { getSetCookie?: () => string[] }
  const list = headers.getSetCookie?.() || splitSetCookie(headers.get('set-cookie') || '')

  const cookies: Record<string, string> = {}
  for (const item of list) {
    const [pair] = item.split(';')
    const index = pair.indexOf('=')
    if (index > 0) {
      cookies[pair.slice(0, index).trim()] = pair.slice(index + 1).trim()
    }
  }

  return cookies
}

// 跟随链接读取 Set-Cookie
// 扫码登录成功后凭证是通过跨域链接下发的, 需要手动跟一次才能拿到
export async function fetchCookiesFromUrl(url: string) {
  const res = await fetch(url, { headers: getBaseHeaders(), maxRedirections: 0 })
  return readResponseCookies(res)
}

// 封装请求
export const http = {
  /**
   * @param url 请求地址
   * @param params 请求参数
   */
  async get<T = unknown>(url: string, params?: Record<string, unknown>) {
    const res = await request(url, params)

    // bilibili 接口的返回格式
    if (res.status === 200) {
      const data = await res.json()
      if (data.code === 0) {
        return data.data as T
      }
      console.error('===> fetch failed', data)
      throw new Error(data.message || res.statusText)
    }

    console.error('===> fetch failed', res)
    throw new Error(res.statusText)
  },

  /**
   * 同 get, 但会额外返回响应头里的 cookie
   * 扫码登录的凭证是通过 Set-Cookie 下发的
   * @param url 请求地址
   * @param params 请求参数
   */
  async getWithCookies<T = unknown>(url: string, params?: Record<string, unknown>) {
    const res = await request(url, params)

    if (res.status === 200) {
      const data = await res.json()
      if (data.code === 0) {
        return { data: data.data as T, cookies: readResponseCookies(res) }
      }
      console.error('===> fetch failed', data)
      throw new Error(data.message || res.statusText)
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

import { EQrcodeStatus } from '@/const/enums'
import { fetchCookiesFromUrl, http } from '@/core/request'
import { db } from '@/db'
import { uuid } from '@/utils/common'

// 扫码来源, 会回写到二维码链接的 from 参数
const QRCODE_SOURCE = 'main-fe-header'

const QRCODE_GENERATE_API = 'https://passport.bilibili.com/x/passport-login/web/qrcode/generate'
const QRCODE_POLL_API = 'https://passport.bilibili.com/x/passport-login/web/qrcode/poll'

export const userService = {
  // 获取二维码
  qrcode: () =>
    http.get<Bilibili.QrcodeGenerateSchema>(QRCODE_GENERATE_API, {
      source: QRCODE_SOURCE,
      go_url: window.location.href,
    }),

  // 检查二维码状态
  qrcodeCheck: async (qrcodeKey: string): Promise<Bilibili.QrcodeLoginSchema> => {
    const { data, cookies } = await http.getWithCookies<Bilibili.QrcodePollSchema>(QRCODE_POLL_API, {
      qrcode_key: qrcodeKey,
      source: QRCODE_SOURCE,
    })

    if (data.code !== EQrcodeStatus.Success) {
      return { ...data, cookies }
    }

    // 登录凭证是通过 Set-Cookie 下发的
    // 兜底: url 是 passport.biligame.com/x/passport-login/web/crossDomain?ticket=xxx, 跟随它才能拿到 cookie
    if (cookies.SESSDATA || !data.url) {
      return { ...data, cookies }
    }

    return { ...data, cookies: { ...cookies, ...(await fetchCookiesFromUrl(data.url)) } }
  },

  // 获取当前登录用户信息
  profile: () => http.get<Bilibili.UserProfileShchema>('https://api.bilibili.com/x/web-interface/nav'),

  // 获取UP主信息
  getById(mid: string | number) {
    return http.get<Bilibili.UPCardInfo>('https://api.bilibili.com/x/web-interface/card', {
      mid: mid.toString(),
      photo: 'true',
    })
  },

  async create(data: Omit<AppScope.UserItem, 'id'>) {
    const exists = (await db.users.where({ mid: data.mid }).count()) > 0
    if (exists) {
      return { message: '用户已存在' }
    }

    const id = uuid()
    await db.users.add({ id, ...data })
    return { data: id }
  },

  async batchCreate(arr: Omit<AppScope.UserItem, 'id'>[]) {
    await db.users.bulkAdd(arr.map((item) => ({ ...item, id: uuid() })))
  },

  async findByMid(mid: string) {
    return await db.users.where({ mid }).first()
  },

  async update(item: AppScope.UserItem) {
    await db.users.update(item.id, item)
  },

  async remove(id: string) {
    await db.users.delete(id)
  },

  async removeByMid(mid: string) {
    await db.users.where({ mid }).delete()
  },

  async clear() {
    await db.users.clear()
  },
}

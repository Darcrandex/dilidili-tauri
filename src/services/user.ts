import { http } from '@/core/request'
import { db } from '@/db'
import { uuid } from '@/utils/common'

export const userService = {
  // 获取二维码
  qrcode: () =>
    http.get<{ url: string; qrcode_key: string }>('https://passport.bilibili.com/x/passport-login/web/qrcode/generate'),

  // 检查二维码状态
  qrcodeCheck: (key: string) =>
    http.get<{ code: number; message: string; url: string }>(
      'https://passport.bilibili.com/x/passport-login/web/qrcode/poll',
      { qrcode_key: key },
    ),

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

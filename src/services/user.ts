import { UPCardInfo, UserProfileShchema } from '@/types/global'
import { http } from '@/utils/http'

export const userService = {
  // 获取二维码
  qrcode: () =>
    http.get<{ url: string; qrcode_key: string }>('https://passport.bilibili.com/x/passport-login/web/qrcode/generate'),

  // 检查二维码状态
  qrcodeCheck: (key: string) =>
    http.get<{ code: number; message: string; url: string }>(
      'https://passport.bilibili.com/x/passport-login/web/qrcode/poll',
      { qrcode_key: key }
    ),

  // 获取当前登录用户信息
  profile: () => http.get<UserProfileShchema>('https://api.bilibili.com/x/web-interface/nav'),

  // 获取UP主信息
  getById(mid: string | number) {
    return http.get<UPCardInfo>('https://api.bilibili.com/x/web-interface/card', { mid: mid.toString(), photo: 'true' })
  }
}

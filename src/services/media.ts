import { PageInfoSchema, VideoInfoSchema } from '@/types/global'
import { http } from '@/utils/http'

export const mediaService = {
  // 获取视频信息
  info: (bvid: string) => http.get<VideoInfoSchema>('https://api.bilibili.com/x/web-interface/view', { bvid }),

  // 获取分P视频下载地址
  playurl: (bvid: string, cid: number) =>
    http.get<PageInfoSchema>('https://api.bilibili.com/x/player/playurl', {
      bvid,
      cid: cid.toString(),
      fnver: '0',
      fnval: '16',
      fourk: '1'
    })
}

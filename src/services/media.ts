import { http } from '@/core/request'

export const mediaService = {
  // 获取视频信息
  info: (bvid: string) =>
    http.get<AppScope.VideoInfoSchema>(
      'https://api.bilibili.com/x/web-interface/view',
      {
        bvid,
      },
    ),

  // 获取分P视频下载地址
  // https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/video/videostream_url.md#%E8%8E%B7%E5%8F%96%E8%A7%86%E9%A2%91%E6%B5%81%E5%9C%B0%E5%9D%80_web%E7%AB%AF
  playurl: (bvid: string, cid: number) =>
    http.get<AppScope.PageInfoSchema>(
      'https://api.bilibili.com/x/player/playurl',
      {
        bvid,
        cid: cid.toString(),
        fnval: '1040',
        fourk: '1',
      },
    ),
}

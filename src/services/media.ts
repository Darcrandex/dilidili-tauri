import { ECommon } from '@/const/enums'
import { http } from '@/core/request'
import { db } from '@/db'
import { uuid } from '@/utils/common'

export const mediaService = {
  // 获取视频信息
  info: (bvid: string) =>
    http.get<Bilibili.VideoInfoSchema>(
      'https://api.bilibili.com/x/web-interface/view',
      {
        bvid,
      },
    ),

  // 获取分P视频下载地址
  // https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/video/videostream_url.md#%E8%8E%B7%E5%8F%96%E8%A7%86%E9%A2%91%E6%B5%81%E5%9C%B0%E5%9D%80_web%E7%AB%AF
  playurl: (bvid: string, cid: number) =>
    http.get<Bilibili.PageInfoSchema>(
      'https://api.bilibili.com/x/player/playurl',
      {
        bvid,
        cid: cid.toString(),
        fnval: '1040',
        fourk: '1',
      },
    ),

  async create(data: Omit<AppScope.VideoItem, 'id' | 'createdAt'>) {
    // 每个 video 视为一个 bv 视频
    const isExist = (await db.videos.where({ bvid: data.bvid }).count()) > 0
    if (isExist) {
      return { data: '已存在' }
    }

    const id = uuid()
    await db.videos.add({ id, ...data, createdAt: Date.now() })
    return { data: id }
  },

  async batchCreate(arr: Omit<AppScope.VideoItem, 'id' | 'createdAt'>[]) {
    const allBvids = arr.map((item) => item.bvid)

    // check is exist before add
    const existBvids = await db.videos
      .filter((v) => allBvids.includes(v.bvid))
      .toArray()

    const filteredArr = arr.filter(
      (item) => !existBvids.some((v) => v.bvid === item.bvid),
    )

    await db.videos.bulkAdd(
      filteredArr.map((item) => ({
        ...item,
        id: uuid(),
        createdAt: Date.now(),
      })),
    )
  },

  async page(params?: {
    mid?: string
    keyword?: string
    pageNumber?: number
    pageSize?: number
  }) {
    const total = await db.videos
      .filter(
        (v) =>
          !params?.mid || params.mid === ECommon.AllMid || v.mid === params.mid,
      )
      .filter(
        (v) =>
          !params?.keyword ||
          v.videoInfo.owner.name.includes(params.keyword) ||
          v.videoInfo.title.includes(params.keyword),
      )
      .count()

    const records = await db.videos
      .filter(
        (v) =>
          !params?.mid || params.mid === ECommon.AllMid || v.mid === params.mid,
      )
      .filter(
        (v) =>
          !params?.keyword ||
          v.videoInfo.owner.name.includes(params.keyword) ||
          v.videoInfo.title.includes(params.keyword),
      )
      .offset((params?.pageNumber ?? 1) - 1)
      .limit(params?.pageSize ?? 10)
      .toArray()

    return { records, total }
  },

  async remove(id: string) {
    await db.videos.delete(id)
  },

  async batchRemove(ids: string[]) {
    await db.videos.bulkDelete(ids)
  },

  async clear() {
    await db.videos.clear()
  },
}

import { eq, keys, pick } from 'lodash-es'

// 由于视频信息需要被保存到本地
// 但是原始的数据非常大，读取速度慢
// 因此只挑选出需要的字段
const selectedKeys: (keyof Bilibili.VideoInfoSchema)[] = [
  'aid',
  'bvid',
  'cid',
  'title',
  'pic',
  'duration',
  'owner',
  'pages',
  'pubdate',
]

export function pickVideoInfo(info: Bilibili.VideoInfoSchema): Bilibili.VideoInfoSchema {
  return pick(info, selectedKeys)
}

// 检查对象的 keys 是否于标准 keys 相同
export function hasSameKeys(info?: Record<string, any>) {
  const infoKeys = info ? keys(info).sort() : []
  const originKeys = selectedKeys.slice().sort()
  return eq(originKeys, infoKeys)
}

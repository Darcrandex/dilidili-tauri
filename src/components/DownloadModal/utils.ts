import { VideoInfoSchema } from '@/types/global'
import * as R from 'ramda'

// 由于视频信息需要被保存到本地
// 但是原始的数据非常大，读取速度慢
// 因此只挑选出需要的字段
export function pickVideoInfo(info: VideoInfoSchema): VideoInfoSchema {
  const selectedKeys: (keyof VideoInfoSchema)[] = ['aid', 'bvid', 'cid', 'title', 'pic', 'duration', 'owner', 'pages']

  return R.pick(selectedKeys, info)
}

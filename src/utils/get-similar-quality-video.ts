// 由于清晰度选项是从 P1 视频中获取的
// 对于多 P 视频，可能存在其他分 P 清晰度匹配不到所选清晰度的情况
// 就需要找到最相近清晰度

type VideoItem = Bilibili.PageInfoSchema['dash']['video'][number]

/**
 * 获取清晰度最相近的视频
 * @param quality - 视频清晰度 id
 * @param videos - 不同清晰度的视频列表
 * @returns
 */
export function getSimilarQualityVideo(
  quality: number,
  videos?: Bilibili.PageInfoSchema['dash']['video'],
): VideoItem | undefined {
  if (!Array.isArray(videos) || videos.length === 0) return undefined

  let matched: VideoItem | undefined = videos[0]
  let minDiff = Math.abs(quality - videos[0].id)

  for (const item of videos) {
    const diff = Math.abs(quality - item.id)
    if (diff < minDiff) {
      minDiff = diff
      matched = item
    }
  }

  return matched
}

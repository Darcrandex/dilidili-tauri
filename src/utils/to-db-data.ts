// 通过解析资源文件夹，反向解析为数据库数据

export async function toDbData(items: AppScope.VideoFolderItem[]) {
  const userArr: Omit<AppScope.UserItem, 'id'>[] = []
  const videoArr: Omit<AppScope.VideoItem, 'id' | 'createdAt'>[] = []

  // 提取用户
  items.forEach((item) => {
    const owner = item.videoInfo.owner
    if (!userArr.find((u) => u.mid === String(owner.mid))) {
      userArr.push({
        mid: String(owner.mid),
        name: owner.name,
        avatar: owner.face,
      })
    }
  })

  // 提取视频
  items.forEach((item) => {
    const videoInfo = item.videoInfo
    videoArr.push({
      mid: String(videoInfo.owner.mid),
      bvid: videoInfo.bvid,
      videoInfo,
    })
  })

  return { userArr, videoArr }
}

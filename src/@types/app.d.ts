declare namespace AppScope {
  interface UserItem {
    id: string
  }

  export interface DownloadBVParams {
    videoDownloadUrl: string // 视频下载地址
    audioDownloadUrl: string // 音频下载地址
    coverImageUrl: string // 封面图片地址

    mid: string // UP主 id
    bvid: string // 视频id
    page: number // 分P序号
    quality: number // 清晰度编码
    qualityName: string // 清晰度编码名称

    // 当前 BV 的视频信息
    // 为了在数据回填时减少请求
    videoInfo: Bilibili.VideoInfoSchema
  }

  interface TaskItem {
    id: string
    status: number
    createdAt: number
    updatedAt: number
    params: DownloadBVParams
  }

  interface UserItem {
    id: string
    mid: string
    name: string
    avatar: string
    sign?: string
  }

  interface VideoItem extends VideoFolderItem {
    id: string
    createdAt: number
  }

  // 根据文件夹结构转化为数据结构时需要使用的类型
  // bv 视频的文件夹
  interface VideoFolderItem {
    mid: string
    bvid: string
    videoInfo: Bilibili.VideoInfoSchema

    // 视频相关的文件，包括视频和图片
    children?: Array<{
      name: string
      path: string
      isDirectory: boolean
      isFile: boolean
    }>
  }
}

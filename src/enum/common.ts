// 任务状态
export enum ETaskStatus {
  Failed = 0,
  Ready = 1,
  Downloading = 2,
  Merging = 3,
  Finished = 4
}

export enum ECommon {
  // 下载视频文件时，需要的参数
  Referer = 'https://www.bilibili.com',

  // bilibili 用于保存 session 的 key
  SessionKey = 'SESSDATA'
}

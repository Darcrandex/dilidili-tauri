// 常量
export enum ECommon {
  // 下载视频文件时，需要的参数
  Referer = 'https://www.bilibili.com',

  // 不指定 up 时的 mid
  AllMid = 'all',
}

// 存储 localStorage 的 key
export enum EStorageKey {
  SessionKey = 'SESSDATA',
  Settings = 'settings',
  AisdeWidth = 'aside-up-list-width',
}

// 任务状态
export enum ETaskStatus {
  Failed = 0,
  Ready = 1,
  Downloading = 2,
  Merging = 3,
  Finished = 4,
}

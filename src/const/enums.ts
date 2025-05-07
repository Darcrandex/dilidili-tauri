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

// 数据相关
export enum EIndexDB {
  Name = 'dilidili-index-db',
  Version = 1,
}

// 任务状态
export enum ETaskStatus {
  Failed = 0,
  Ready = 1,
  Downloading = 2,
  Merging = 3,
  Finished = 4,
}

export const taskStatusOptions = [
  { label: '失败', value: ETaskStatus.Failed },
  { label: '准备中', value: ETaskStatus.Ready },
  { label: '下载中', value: ETaskStatus.Downloading },
  { label: '合并中', value: ETaskStatus.Merging },
  { label: '完成', value: ETaskStatus.Finished },
]

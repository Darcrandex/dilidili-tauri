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

// 扫码登录的状态码 (轮询接口返回的 data.code)
export enum EQrcodeStatus {
  // 登录成功
  Success = 0,
  // 二维码已失效
  Expired = 86038,
  // 已扫码未确认
  Scanned = 86090,
  // 未扫码
  Waiting = 86101,
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

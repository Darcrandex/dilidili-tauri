import { customAlphabet } from 'nanoid'

// 异步等待一段时间
export function sleep(time: number = 1000): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, time))
}

// 顺序执行异步任务
export function taskOneByOne(tasks: (() => Promise<any>)[]) {
  return tasks.reduce((p, c) => p.then(c), Promise.resolve())
}

// 自定义 id 生成器
export function uuid(len = 8) {
  return customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', len)()
}

// 将秒转换为时分秒格式
export function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  const formattedHours = hours > 0 ? hours.toString().padStart(2, '0') : null
  const formattedMinutes = minutes.toString().padStart(2, '0')
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0')

  return [formattedHours, formattedMinutes, formattedSeconds].filter(Boolean).join(':')
}

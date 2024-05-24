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

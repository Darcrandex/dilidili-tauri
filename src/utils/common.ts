import { platform } from '@tauri-apps/plugin-os'
import { customAlphabet } from 'nanoid'

/**
 * 异步等待一段时间
 * @param ms - 毫秒
 * @returns
 */
export async function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

/**
 * 生成随机 id
 * @param len - 长度
 */
export function uuid(len = 8) {
  return customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', len)()
}

/**
 * 获取路径分隔符
 * @param pathLike 文件或文件夹路径
 */
export function getPathSpliter(pathLike: string) {
  const spliter = pathLike.includes('\\') ? '\\' : '/'
  return spliter
}

/**
 * 顺序执行异步任务
 * @param tasks - 任务列表
 */
export function taskOneByOne(tasks: (() => Promise<any>)[]) {
  return tasks.reduce((p, c) => p.then(c), Promise.resolve())
}

/**
 * 将秒转换为时分秒格式
 * @param seconds - 秒
 */
export function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  const formattedHours = hours > 0 ? hours.toString().padStart(2, '0') : null
  const formattedMinutes = minutes.toString().padStart(2, '0')
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0')

  return [formattedHours, formattedMinutes, formattedSeconds].filter(Boolean).join(':')
}

/**
 * 检测文件名是否合法
 * @param filename
 * @param osType
 * @returns boolean
 */
export function isValidFileName(filename = '') {
  const osType = platform()

  let illegalChars = /^/

  if (osType === 'windows') {
    // Windows 系统下非法字符
    illegalChars = /[\\/*?:"<>|]/
  } else {
    // Unix/Linux 系统下非法字符
    illegalChars = /[/]/
  }

  return !illegalChars.test(filename)
}

/**
 * 文件名去除非法字符
 * @param filename
 * @returns string
 */
export function removeInvalidChars(filename = '') {
  const osType = platform()
  let illegalChars = /^/
  if (osType === 'windows') {
    // Windows 系统下非法字符
    illegalChars = /[\\/*?:"<>|]/
  } else {
    // Unix/Linux 系统下非法字符
    illegalChars = /[/]/
  }

  return filename.replace(illegalChars, '')
}

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// 合并冲突的 tailwindcss 类名(后置优先), 并支持对象和数组形式
export function cls(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { invoke } from '@tauri-apps/api/core'

// 通过 rust 从后台生成一个省略图并返回该图片的路径
export async function getThumbnailPath(imagePath: string): Promise<string> {
  try {
    const thumbnailPath = await invoke<string>('generate_thumbnail', { imagePath })
    return thumbnailPath
  } catch (error) {
    console.error('生成缩略图失败:', imagePath, error)
    return imagePath
  }
}

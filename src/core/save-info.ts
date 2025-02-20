// 保存 bv 视频的信息，避免重复请求

import { writeTextFile } from '@tauri-apps/plugin-fs'

export async function saveInfo(filePath: string, data: Record<string, any>) {
  await writeTextFile(filePath, JSON.stringify(data))
}

// 下载文件

import { ECommon } from '@/enum/common'
import { getDefaultHeaders } from '@/utils/http'
import { writeBinaryFile } from '@tauri-apps/api/fs'
import { ResponseType, getClient } from '@tauri-apps/api/http'

export async function downloadFile(downloadURL: string, outputPath: string) {
  try {
    const client = await getClient()
    const response = await client.get(downloadURL, {
      responseType: ResponseType.Binary,
      headers: { ...getDefaultHeaders(), referer: ECommon.Referer }
    })

    await writeBinaryFile(outputPath, response.data as any)
  } catch (error) {
    console.error('下载失败', error)
    throw error
  }
}

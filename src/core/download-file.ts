// 下载文件

import { ECommon } from '@/enum/common'
import { getDefaultHeaders } from '@/utils/http'
import { exists, removeFile } from '@tauri-apps/api/fs'
import { invoke } from '@tauri-apps/api/tauri'

export async function downloadFile(downloadURL: string, outputPath: string) {
  // try {
  //   const client = await getClient()
  //   const response = await client.get(downloadURL, {
  //     responseType: ResponseType.Binary,
  //     headers: { ...getDefaultHeaders(), referer: ECommon.Referer }
  //   })

  //   await writeBinaryFile(outputPath, response.data as any)
  // } catch (error) {
  //   console.error('下载失败', error)
  //   throw error
  // }

  try {
    if (await exists(outputPath)) {
      await removeFile(outputPath)
    }

    const headersObj = { ...getDefaultHeaders(), referer: ECommon.Referer }
    await invoke('download_file', { url: downloadURL, dest: outputPath, headers: headersObj })
  } catch (error) {
    console.error('下载失败', error)
    throw error
  }
}

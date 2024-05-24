// 合并音视频

import { exists, removeFile } from '@tauri-apps/api/fs'
import { Command } from '@tauri-apps/api/shell'

// tauri.conf.json
// tauri.allowlist.shell.scope[number].name
const FFMPEG_CMD = 'binaries/ffmpeg'

export async function mergeToVideo(videoFilePath: string, audioFilePath: string, outputFilePath: string) {
  try {
    // 检查是否已经存在输出文件
    if (await exists(outputFilePath)) {
      await removeFile(outputFilePath)
    }

    const args = ['-i', videoFilePath, '-i', audioFilePath, '-c:v', 'copy', '-c:a', 'copy', outputFilePath]

    const command = Command.sidecar(FFMPEG_CMD, args)
    const output = await command.execute()

    // 合并成功时返回的 code = 0
    if (output.code !== 0) {
      throw new Error('合并音视频失败')
    }
  } catch (error) {
    console.error(error)
    throw new Error('合并音视频失败')
  }
}

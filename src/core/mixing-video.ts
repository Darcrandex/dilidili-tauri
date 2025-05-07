import { Command } from '@tauri-apps/plugin-shell'

/**
 * 混合视频和音频文件
 * @param videoFilePath 视频文件的路径
 * @param audioFilePath 音频文件的路径
 * @param outputFilePath 输出文件的路径
 */
export async function mixingVideo(videoFilePath: string, audioFilePath: string, outputFilePath: string) {
  const command = Command.sidecar('binaries/ffmpeg', [
    '-i',
    videoFilePath,
    '-i',
    audioFilePath,
    '-c:v',
    'copy',
    '-c:a',
    'copy',
    outputFilePath,
  ])

  const output = await command.execute()

  if (output.code !== 0) {
    console.error('===>合并失败', { videoFilePath, audioFilePath, outputFilePath }, output.stderr)
    throw new Error(output.stderr)
  }
}

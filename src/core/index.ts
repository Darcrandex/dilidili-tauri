// 下载 BV 视频等操作

import { ETaskStatus } from '@/enum/common'
import { taskService } from '@/services/task'
import { DownloadBVParams } from '@/types/global'
import { sleep } from '@/utils/common'
import { createDir, exists, removeFile } from '@tauri-apps/api/fs'
import { join } from '@tauri-apps/api/path'
import { downloadFile } from './download-file'
import { mergeToVideo } from './merge-to-video'
import { saveInfo } from './save-info'

export async function downloadBV(taskId: string, params: DownloadBVParams, rootDirPath: string) {
  const ownerDirPath = await join(rootDirPath, params.mid)
  const bvDirPath = await join(ownerDirPath, params.bvid)

  // 初始化 BV 视频文件夹
  if (!(await exists(bvDirPath))) {
    await createDir(bvDirPath, { recursive: true })
  }

  const videoFilePath = await join(bvDirPath, `${taskId}_video.m4s`)
  const audioFilePath = await join(bvDirPath, `${taskId}_audio.m4s`)
  const coverImagePath = await join(bvDirPath, `${params.bvid}-cover.jpg`)
  const videoInfoFilePath = await join(bvDirPath, `${params.bvid}-info.json`)

  const ownerName = params.videoInfo.owner.name
  const videoTitle = params.videoInfo.title
  const isSinglePage = params.videoInfo.pages.length === 1
  const pageTitle = params.videoInfo.pages[params.page - 1].part

  const str1 = `「${ownerName}」`
  const str2 = isSinglePage ? videoTitle : [videoTitle, pageTitle].filter(Boolean).join('-')
  const str3 = params.qualityName
  const outputFileName = [str1, str2, str3].filter(Boolean).join(' ')

  const outputPath = await join(bvDirPath, `${outputFileName}.mp4`)

  try {
    await taskService.update(taskId, { status: ETaskStatus.Downloading })
    await downloadFile(params.videoDownloadUrl, videoFilePath)
    await downloadFile(params.audioDownloadUrl, audioFilePath)
    await downloadFile(params.coverImageUrl, coverImagePath)
    await saveInfo(videoInfoFilePath, params.videoInfo)

    await taskService.update(taskId, { status: ETaskStatus.Merging })
    await mergeToVideo(videoFilePath, audioFilePath, outputPath)

    await taskService.update(taskId, { status: ETaskStatus.Finished })
  } catch (error) {
    await taskService.update(taskId, { status: ETaskStatus.Failed })
  } finally {
    await sleep()
    await removeFile(videoFilePath)
    await removeFile(audioFilePath)
  }
}

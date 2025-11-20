// 下载 BV 视频等操作

import { ETaskStatus } from '@/const/enums'
import { mediaService } from '@/services/media'
import { taskService } from '@/services/task'
import { userService } from '@/services/user'
import { removeInvalidChars, sleep, uuid } from '@/utils/common'
import { join } from '@tauri-apps/api/path'
import { exists, mkdir, remove } from '@tauri-apps/plugin-fs'
import { downloadFile } from './download-file'
import { mixingVideo } from './mixing-video'
import { saveInfo } from './save-info'

export function getOutputFileName(params: Pick<AppScope.DownloadBVParams, 'videoInfo' | 'page' | 'qualityName'>) {
  const ownerName = params.videoInfo.owner.name
  const videoTitle = params.videoInfo.title
  const isSinglePage = params.videoInfo.pages.length === 1
  const pageTitle = params.videoInfo.pages[params.page - 1].part

  const str1 = `「${ownerName}」`
  const str2 = isSinglePage ? videoTitle : [videoTitle, pageTitle].filter(Boolean).join('-')
  const str3 = params.qualityName

  const outputFileName = [str1, str2, str3].map(removeInvalidChars).filter(Boolean).join(' ')

  return outputFileName
}

/**
 * 下载 BV 视频并合并
 * @param params - 下载参数
 * @param rootDirPath - 根目录路径
 * @param tid - 任务 ID（重新下载时需要）
 */
export async function downloadBV(params: AppScope.DownloadBVParams, rootDirPath: string, tid?: string) {
  const isUpdate = !!tid
  const taskId = tid || uuid()
  const ownerDirPath = await join(rootDirPath, params.mid)
  const bvDirPath = await join(ownerDirPath, params.bvid)

  // 初始化 BV 视频文件夹
  if (!(await exists(bvDirPath))) {
    await mkdir(bvDirPath, { recursive: true })
  }

  const videoFilePath = await join(bvDirPath, `${taskId}_video.m4s`)
  const audioFilePath = await join(bvDirPath, `${taskId}_audio.m4s`)
  const coverImagePath = await join(bvDirPath, `${params.bvid}-cover.jpg`)
  const videoInfoFilePath = await join(bvDirPath, `${params.bvid}-info.json`)
  const outputFileName = getOutputFileName(params)
  const outputPath = await join(bvDirPath, `${outputFileName}.mp4`)

  try {
    if (!isUpdate) {
      await taskService.create({ id: taskId, status: ETaskStatus.Ready, params })
    }

    await taskService.update(taskId, { status: ETaskStatus.Downloading })
    await downloadFile({
      fileUrl: params.videoDownloadUrl,
      filePath: videoFilePath,
    })
    await downloadFile({
      fileUrl: params.audioDownloadUrl,
      filePath: audioFilePath,
    })

    // 下载封面
    if (!(await exists(coverImagePath))) {
      await downloadFile({
        fileUrl: params.coverImageUrl,
        filePath: coverImagePath,
      })
    }

    // 保存视频信息
    if (!(await exists(videoInfoFilePath))) {
      await saveInfo(videoInfoFilePath, params.videoInfo)
    }

    await taskService.update(taskId, { status: ETaskStatus.Merging })
    await mixingVideo(videoFilePath, audioFilePath, outputPath)

    // 保存up主信息
    await userService.create({
      mid: params.mid,
      name: params.videoInfo.owner.name,
      avatar: params.videoInfo.owner.face,
    })

    // 添加视频数据
    await mediaService.create(params)

    await taskService.update(taskId, { status: ETaskStatus.Finished })
  } catch (error) {
    console.log('下载失败', error)

    await taskService.update(taskId, { status: ETaskStatus.Failed })
  } finally {
    await sleep(200)
    await remove(videoFilePath)
    await remove(audioFilePath)
  }
}

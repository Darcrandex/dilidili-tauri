/**
 * @name TaskItem
 * @description
 * @author darcrand
 */

import { ETaskStatus } from '@/enum/common'
import { useRootDirPath } from '@/hooks/use-root-dir-path'
import { mediaService } from '@/services/media'
import { taskService } from '@/services/task'
import { useDownloadQueue } from '@/stores/use-download-queue'
import { DownloadBVParams, DownloadTask } from '@/types/global'
import UImage from '@/ui/UImage'
import { getSimilarQualityVideo } from '@/utils/get-similar-quality-video'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FolderOpenOutlined,
  MoreOutlined,
  SyncOutlined
} from '@ant-design/icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { join } from '@tauri-apps/api/path'
import { open as openShell } from '@tauri-apps/api/shell'
import { Button, Dropdown, Tag } from 'antd'
import dayjs from 'dayjs'
import * as R from 'ramda'
import { useMemo } from 'react'

const statusOptions = [
  { value: ETaskStatus.Ready, label: '准备中', color: 'processing', icon: <SyncOutlined spin /> },
  { value: ETaskStatus.Downloading, label: '下载中', color: 'processing', icon: <SyncOutlined spin /> },
  { value: ETaskStatus.Merging, label: '合并中', color: 'processing', icon: <SyncOutlined spin /> },
  { value: ETaskStatus.Finished, label: '完成', color: 'success', icon: <CheckCircleOutlined /> },
  { value: ETaskStatus.Failed, label: '下载失败', color: 'error', icon: <CloseCircleOutlined /> }
]

export type TaskItemProps = {
  task: DownloadTask
}

export default function TaskItem(props: TaskItemProps) {
  const rootDirPath = useRootDirPath()

  const { bvid, cid } = props.task.params.videoInfo
  const { data: playurlData } = useQuery({
    queryKey: ['video', 'playurl', bvid, cid],
    enabled: !!bvid,
    queryFn: () => mediaService.playurl(bvid, cid),
    gcTime: 3 * 60 * 1000,
    staleTime: 3 * 60 * 1000
  })

  const status = statusOptions.find((o) => o.value === props.task.status)
  // const isPending = props.task.status === ETaskStatus.Downloading || props.task.status === ETaskStatus.Merging
  const isPending = false

  const qualityLabel = useMemo(() => {
    if (!Array.isArray(playurlData?.support_formats) || !props.task.params.quality) return null
    return playurlData.support_formats.find((item) => item.quality === props.task.params.quality)?.new_description
  }, [playurlData, props.task.params.quality])

  const onOpenDir = async () => {
    if (rootDirPath) {
      const dirPath = await join(rootDirPath, props.task.params.mid, props.task.params.bvid)
      await openShell(dirPath)
    }
  }

  const queryClient = useQueryClient()

  const onRemove = async (id: string) => {
    await taskService.remove(id)
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
  }

  const { addAutoRun } = useDownloadQueue()
  const onReDownload = async () => {
    // 下载地址可能会过期
    // 需要重新获取
    const matchedPageInfo = playurlData
    const videos = R.sort((a, b) => b.bandwidth - a.bandwidth, matchedPageInfo?.dash?.video || [])
    const matchedVideo = getSimilarQualityVideo(props.task.params.quality, videos)
    const videoDownloadUrl = matchedVideo?.baseUrl || ''

    const audios = R.sort((a, b) => b.bandwidth - a.bandwidth, matchedPageInfo?.dash?.audio || [])
    const audioDownloadUrl = R.head(audios)?.baseUrl || ''

    const params: DownloadBVParams = {
      ...props.task.params,
      videoDownloadUrl,
      audioDownloadUrl
    }

    addAutoRun(props.task.id, params)
  }

  return (
    <>
      <div className='group flex space-x-4 rounded-md transition-all hover:bg-slate-50'>
        <UImage src={props.task.params.videoInfo.pic} className='block w-40 h-24 rounded-md object-cover' />

        <article className='flex-1 flex flex-col py-2'>
          <p className='leading-6 h-12 overflow-hidden'>{props.task.params.videoInfo.title}</p>

          <p className='flex flex-wrap text-sm'>
            <Tag bordered={false}>{props.task.params.videoInfo.owner.name}</Tag>

            <Tag bordered={false}>P{props.task.params.page}</Tag>

            <Tag bordered={false}>{qualityLabel}</Tag>

            <Tag bordered={false}>{dayjs(props.task.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Tag>

            <Tag bordered={false} color={status?.color} icon={status?.icon}>
              {status?.label}
            </Tag>
          </p>
        </article>

        <div className='px-4 self-center transition-all opacity-0 group-hover:opacity-100'>
          <Dropdown
            trigger={['click']}
            placement='bottomRight'
            menu={{
              items: [
                {
                  key: 'openDir',
                  icon: <FolderOpenOutlined />,
                  label: '打开文件夹',
                  onClick: onOpenDir
                },
                {
                  key: 'reDownload',
                  icon: <DownloadOutlined />,
                  label: '重新下载',
                  disabled: isPending,
                  onClick: onReDownload
                },
                {
                  key: 'remove',
                  icon: <DeleteOutlined />,
                  disabled: isPending,
                  label: '删除任务',
                  onClick: () => onRemove(props.task.id)
                }
              ]
            }}
          >
            <Button shape='circle' type='text' icon={<MoreOutlined />} />
          </Dropdown>
        </div>
      </div>
    </>
  )
}

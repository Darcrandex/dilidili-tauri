/**
 * @name TaskItem
 * @description
 * @author darcrand
 */

import ImagView from '@/components/ImageView'
import { ETaskStatus } from '@/const/enums'
import { getOutputFileName } from '@/core'
import { useRootDirPath } from '@/hooks/useRootDirPath'
import { mediaService } from '@/services/media'
import { taskService } from '@/services/task'
import { getSimilarQualityVideo } from '@/utils/get-similar-quality-video'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FolderOpenOutlined,
  MoreOutlined,
  PlayCircleFilled,
  PlayCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { join } from '@tauri-apps/api/path'
import { exists } from '@tauri-apps/plugin-fs'
import { open as openShell } from '@tauri-apps/plugin-shell'
import { Button, Dropdown, Space, Tag } from 'antd'
import { first, sortBy } from 'lodash-es'
import { useMemo } from 'react'
import { message, modal } from './GlobalAntdMessage'

const statusOptions = [
  {
    value: ETaskStatus.Ready,
    label: '准备中',
    color: 'processing',
    icon: <SyncOutlined spin />,
  },
  {
    value: ETaskStatus.Downloading,
    label: '下载中',
    color: 'processing',
    icon: <SyncOutlined spin />,
  },
  {
    value: ETaskStatus.Merging,
    label: '合并中',
    color: 'processing',
    icon: <SyncOutlined spin />,
  },
  {
    value: ETaskStatus.Finished,
    label: '完成',
    color: 'success',
    icon: <CheckCircleOutlined />,
  },
  {
    value: ETaskStatus.Failed,
    label: '下载失败',
    color: 'error',
    icon: <CloseCircleOutlined />,
  },
]

export type TaskItemProps = {
  task: AppScope.TaskItem
}

export default function TaskItem(props: TaskItemProps) {
  const rootDirPath = useRootDirPath()

  const { bvid, cid } = props.task.params.videoInfo
  const { data: playurlData } = useQuery({
    queryKey: ['video', 'playurl', bvid, cid],
    enabled: !!bvid,
    queryFn: () => mediaService.playurl(bvid, cid),
    gcTime: 60 * 1000,
    staleTime: 60 * 1000,
  })

  const status = statusOptions.find((o) => o.value === props.task.status)
  const isPending = props.task.status === ETaskStatus.Downloading || props.task.status === ETaskStatus.Merging

  const qualityLabel = useMemo(() => {
    if (!Array.isArray(playurlData?.support_formats) || !props.task.params.quality) return null
    return playurlData.support_formats.find((item) => item.quality === props.task.params.quality)?.new_description
  }, [playurlData, props.task.params.quality])

  const onOpenDir = async () => {
    if (rootDirPath) {
      const dirPath = await join(rootDirPath, props.task.params.mid, props.task.params.bvid)

      const isValid = await exists(dirPath)
      if (isValid) {
        await openShell(dirPath)
      } else {
        message.error('文件夹不存在')
      }
    }
  }

  const onOpenVideo = async () => {
    if (rootDirPath) {
      const videoFileName = getOutputFileName(props.task.params)
      const videoPath = await join(rootDirPath, props.task.params.mid, props.task.params.bvid, `${videoFileName}.mp4`)

      const isValid = await exists(videoPath)
      if (isValid) {
        await openShell(videoPath)
      } else {
        message.error('文件不存在')
      }
    }
  }

  const onRemove = async (id: string) => {
    modal.confirm({
      title: '删除任务',
      content: (
        <>
          <p>确认删除任务吗?</p>
          <p>注意, 删除任务不会同时删除下载的问题</p>
        </>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        await taskService.remove(id)
      },
    })
  }

  const onReDownload = async () => {
    // 下载地址可能会过期
    // 需要重新获取
    const matchedPageInfo = playurlData
    const videos = sortBy(matchedPageInfo?.dash?.video || [], ['bandwidth'])

    const matchedVideo = getSimilarQualityVideo(props.task.params.quality, videos)
    const videoDownloadUrl = matchedVideo?.baseUrl || ''

    const audios = sortBy(matchedPageInfo?.dash?.audio || [], ['bandwidth'])
    const audioDownloadUrl = first(audios)?.baseUrl || ''

    const data = { videoDownloadUrl, audioDownloadUrl }
    console.log(data)
  }

  return (
    <>
      <div className='group flex space-x-4 rounded-md bg-slate-50 transition-all hover:opacity-75'>
        <ImagView src={props.task.params.videoInfo.pic} className='block h-24 w-40 rounded-l-md object-cover' />

        <article className='flex flex-1 flex-col justify-between py-2'>
          <div className='truncate'>
            <p className='truncate font-bold'>{props.task.params.videoInfo.title}</p>
            <p className='mt-0 text-sm text-gray-500'>{bvid}</p>
          </div>

          <p className='flex flex-wrap items-center space-x-2 text-sm'>
            <span>{props.task.params.videoInfo.owner.name}</span>
            <span>P{props.task.params.page}</span>
            <span>{qualityLabel}</span>

            <Tag bordered={false} color={status?.color} icon={status?.icon}>
              {status?.label}
            </Tag>
          </p>
        </article>

        <div className='self-center px-4 opacity-0 transition-all group-hover:opacity-100'>
          <Space>
            <Button
              size='large'
              shape='circle'
              type='text'
              icon={<PlayCircleFilled className='!text-primary' />}
              hidden={status?.value !== ETaskStatus.Finished}
              onClick={onOpenVideo}
            />
            <Dropdown
              trigger={['click']}
              placement='bottomRight'
              menu={{
                items: [
                  {
                    key: 'openDir',
                    icon: <FolderOpenOutlined />,
                    label: '打开文件夹',
                    onClick: onOpenDir,
                  },
                  {
                    key: 'openVideo',
                    icon: <PlayCircleOutlined />,
                    label: '打开视频',
                    disabled: status?.value !== ETaskStatus.Finished,
                    onClick: onOpenVideo,
                  },
                  {
                    key: 'reDownload',
                    icon: <DownloadOutlined />,
                    label: '重新下载',
                    disabled: isPending,
                    onClick: onReDownload,
                  },
                  {
                    key: 'remove',
                    icon: <DeleteOutlined />,
                    label: isPending ? '强制终止' : '删除任务',
                    onClick: () => onRemove(props.task.id),
                  },
                ],
              }}
            >
              <Button size='large' shape='circle' type='text' icon={<MoreOutlined className='!text-primary' />} />
            </Dropdown>
          </Space>
        </div>
      </div>
    </>
  )
}

/**
 * @name VideoItem
 * @description
 * @author darcrand
 */

import { useRootDirPath } from '@/hooks/useRootDirPath'
import { mediaService } from '@/services/media'
import { useVideoQuery } from '@/stores/video-query'
import { cls } from '@/utils/cls'
import { formatSeconds } from '@/utils/common'
import { DeleteOutlined, FolderOpenOutlined, LinkOutlined, MoreOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { convertFileSrc } from '@tauri-apps/api/core'
import { join } from '@tauri-apps/api/path'
import { exists, readDir, remove } from '@tauri-apps/plugin-fs'
import { open as openShell } from '@tauri-apps/plugin-shell'
import { App as AntdApp, Button, Dropdown } from 'antd'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { modal } from './GlobalAntdMessage'
import ImageView from './ImageView'

export default function VideoItem(props: { data: AppScope.VideoItem; showUpName?: boolean; className?: string }) {
  const { mid, bvid, videoInfo } = props.data
  const { message } = AntdApp.useApp()
  const [, setQuery] = useVideoQuery()
  const rootDirPath = useRootDirPath()

  const dateLabel = useMemo(() => {
    if (!videoInfo.pubdate) return ''

    const d = dayjs(videoInfo.pubdate * 1000)
    const isSameDay = d.isSame(new Date(), 'day')
    const isSameYear = d.isSame(new Date(), 'year')
    if (isSameDay) return d.format('HH:mm')
    if (isSameYear) return d.format('MM-DD')
    return d.format('YYYY-MM-DD')
  }, [videoInfo])

  const { data: bvDirPath } = useQuery({
    enabled: !!rootDirPath,
    queryKey: ['video', 'dir', bvid],
    queryFn: async () => {
      if (!rootDirPath) return ''
      const ownerDirPath = await join(rootDirPath, mid)
      return await join(ownerDirPath, bvid)
    },
  })

  const { data: coverImageURL } = useQuery({
    enabled: !!bvDirPath,
    queryKey: ['bv', 'cover', bvDirPath, bvid],
    queryFn: async () => {
      if (!bvDirPath) return ''
      const coverImagePath = await join(bvDirPath, `${bvid}-cover.jpg`)
      return coverImagePath ? convertFileSrc(coverImagePath) : ''
    },
  })

  const openVideo = async () => {
    if (!bvDirPath) {
      message.error('视频文件夹不存在')
      return
    }

    // 解析当前 bv 文件夹下的文件
    const files = await readDir(bvDirPath)
    // 获取第一个视频文件
    const firstVideo = files.find((f) => f.name.endsWith('.mp4'))
    if (!firstVideo) {
      message.error('视频文件不存在')
      return
    }

    const filePath = await join(bvDirPath, firstVideo.name)
    await openShell(filePath)
  }

  const openVideoFolder = async () => {
    if (bvDirPath) {
      await openShell(bvDirPath)
    }
  }

  const openInBrowser = async () => {
    await openShell(`https://www.bilibili.com/video/${bvid}`)
  }

  const queryClient = useQueryClient()

  const removeMutation = useMutation({
    mutationFn: async () => {
      const isValid = !bvDirPath || (await exists(bvDirPath))
      if (!bvDirPath || !isValid) {
        throw new Error('文件夹不存在')
      }

      try {
        await remove(bvDirPath, { recursive: true })
      } catch (error) {
        console.log(error)
      }

      await mediaService.remove(props.data.id)
    },
    onSuccess() {
      message.success('视频删除成功')
      queryClient.invalidateQueries({ queryKey: ['video', 'page'] })
    },
  })

  const beforeRemove = async () => {
    modal.confirm({
      title: '删除视频文件夹',
      content: (
        <>
          <p>确定要删除该视频文件夹吗?</p>
          <p>该文件夹下的所有视频都会被删除哦</p>
        </>
      ),
      onOk: () => removeMutation.mutate(),
    })
  }

  return (
    <>
      <article className={cls(props.className)}>
        <div className='relative'>
          <ImageView
            className='mb-2 block h-36 w-full cursor-pointer rounded-md transition-all hover:opacity-75'
            src={coverImageURL}
            onClick={openVideo}
          />

          {videoInfo.pages.length > 1 && (
            <span className='absolute top-1 right-1 !m-0 rounded bg-black/25 px-1 text-xs text-white'>
              {videoInfo.pages.length}P
            </span>
          )}

          <span className='absolute right-1 bottom-1 !m-0 rounded bg-black/25 px-1 text-xs text-white'>
            {formatSeconds(videoInfo.duration)}
          </span>
        </div>

        <div className='line-clamp-2 h-12 overflow-clip text-sm leading-6'>{videoInfo.title}</div>

        <div className='flex items-center justify-between space-x-2'>
          <label className='flex flex-1 items-center truncate text-xs text-gray-400'>
            {props.showUpName !== false && (
              <>
                <span
                  className='hover:!text-primary inline-block cursor-pointer truncate !text-gray-400 transition-colors'
                  onClick={() => setQuery({ mid })}
                >
                  {videoInfo.owner.name}
                </span>
                <b className='mx-2 inline-block'>·</b>
              </>
            )}
            <span className='flex-shrink-0'>{dateLabel}</span>
          </label>

          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  key: 'open',
                  icon: <FolderOpenOutlined />,
                  label: '打开文件夹',
                  onClick: openVideoFolder,
                },
                {
                  key: 'link',
                  icon: <LinkOutlined />,
                  label: '从B站打开',
                  onClick: openInBrowser,
                },
                {
                  key: 'remove',
                  icon: <DeleteOutlined />,
                  label: '删除文件夹',
                  onClick: beforeRemove,
                },
              ],
            }}
          >
            <Button shape='circle' type='text' icon={<MoreOutlined />} />
          </Dropdown>
        </div>
      </article>
    </>
  )
}

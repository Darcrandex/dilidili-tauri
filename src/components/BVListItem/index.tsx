/**
 * @name BVListItem
 * @description bv 列表项
 * @author darcrand
 */

import { hasSameKeys, pickVideoInfo } from '@/components/DownloadModal/utils'
import { mediaService } from '@/services/media'
import type { BVItemFromFile } from '@/types/global'
import UImage from '@/ui/UImage'
import { cls } from '@/utils/cls'
import { formatSeconds } from '@/utils/common'
import { DatabaseOutlined, DeleteOutlined, FolderOpenOutlined, LinkOutlined, MoreOutlined } from '@ant-design/icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { removeDir, writeTextFile } from '@tauri-apps/api/fs'
import { open as openShell } from '@tauri-apps/api/shell'
import { convertFileSrc } from '@tauri-apps/api/tauri'
import { Button, Dropdown, Modal } from 'antd'
import dayjs from 'dayjs'
import * as R from 'ramda'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export type BVListItemProps = {
  data: BVItemFromFile
  showUpName?: boolean
  className?: string
}

export default function BVListItem(props: BVListItemProps) {
  const { videoInfo, bvid, path: bvPath, children } = props.data

  const dateLabel = useMemo(() => {
    if (!videoInfo) return ''

    const d = dayjs(videoInfo.pubdate * 1000)
    const isSameDay = d.isSame(new Date(), 'day')
    const isSameYear = d.isSame(new Date(), 'year')
    if (isSameDay) return d.format('HH:mm')
    if (isSameYear) return d.format('MM-DD')
    return d.format('YYYY-MM-DD')
  }, [videoInfo])

  const { data: coverImageURL } = useQuery({
    queryKey: ['bv', 'cover', bvid],
    queryFn: async () => {
      const coverImagePath = children?.find((v) => v.name?.endsWith('.jpg'))?.path
      const assetUrl = coverImagePath ? convertFileSrc(coverImagePath) : ''
      return assetUrl
    }
  })

  const openVideo = async () => {
    const videos = children?.filter((v) => v.name?.endsWith('.mp4'))
    const first = R.head(videos || [])
    if (first) {
      await openShell(first.path)
    }
  }

  const openVideoFolder = async () => {
    if (bvPath) {
      await openShell(bvPath)
    }
  }

  const openInBrowser = async () => {
    await openShell(`https://www.bilibili.com/video/${bvid}`)
  }

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [openRemove, setOpenRemove] = useState(false)

  const removeVideoFolder = async () => {
    await removeDir(bvPath, { recursive: true })
    setOpenRemove(false)
    queryClient.invalidateQueries({ queryKey: ['bv', 'all'] })
    navigate('/home/space')
  }

  const pageCount = children?.filter((v) => v.name?.endsWith('.mp4')).length || 0

  // 优化功能
  // 对应 videoInfo 进行压缩
  const infoCompressed = hasSameKeys(videoInfo)
  const compressInfo = async () => {
    // 重新获取最新的视频信息
    const latestInfo = await mediaService.info(bvid || '')

    const compressed = pickVideoInfo(latestInfo)
    const jsonFilePath = children?.find((v) => v.name?.endsWith('.json'))?.path
    if (jsonFilePath) {
      await writeTextFile(jsonFilePath, JSON.stringify(compressed))
      queryClient.invalidateQueries({ queryKey: ['bv', 'all'] })
    }
  }

  return (
    <>
      <article className={cls(props.className)}>
        <div className='relative'>
          <UImage
            className='h-36 mb-2 rounded-md cursor-pointer hover:opacity-75 transition-all'
            src={coverImageURL}
            onClick={openVideo}
          />

          {pageCount > 1 && <b className='absolute top-1 right-1 !m-0 text-xs text-white'>{pageCount}P</b>}

          <span className='absolute bottom-1 right-1 !m-0 px-1 bg-black/20 rounded text-xs text-white'>
            {formatSeconds(videoInfo.duration)}
          </span>
        </div>

        <div className='h-12 leading-6 text-sm overflow-clip line-clamp-2'>{videoInfo.title}</div>

        <div className='flex items-center justify-between'>
          <label className='text-xs text-gray-400'>
            {props.showUpName !== false && (
              <>
                <span className='inline-block hover:text-primary transition-colors cursor-pointer'>
                  {videoInfo.owner.name}
                </span>
                <b className='inline-block mx-2'>·</b>
              </>
            )}
            <span>{dateLabel}</span>
          </label>

          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                { key: 'open', icon: <FolderOpenOutlined />, label: '打开文件夹', onClick: openVideoFolder },
                {
                  key: 'link',
                  icon: <LinkOutlined />,
                  label: '从B站打开',
                  onClick: openInBrowser
                },
                { key: 'remove', icon: <DeleteOutlined />, label: '删除文件夹', onClick: () => setOpenRemove(true) },
                {
                  key: 'compress',
                  icon: <DatabaseOutlined />,
                  disabled: infoCompressed,
                  label: '压缩视频信息',
                  onClick: compressInfo
                }
              ]
            }}
          >
            <Button
              shape='circle'
              type='text'
              icon={<MoreOutlined className={cls(!infoCompressed && 'text-red-500')} />}
            />
          </Dropdown>
        </div>
      </article>

      <Modal title='删除文件夹' open={openRemove} onCancel={() => setOpenRemove(false)} onOk={removeVideoFolder}>
        <p>当前的 BV 视频文件夹中的所有文件都会被删除噢</p>
        <p>确定要删除文件夹吗？</p>
      </Modal>
    </>
  )
}

/**
 * @name BVListItem
 * @description bv 列表项
 * @author darcrand
 */

import { ALL_BV_DATA_KEY } from '@/queries/useAllBVData'
import type { BVItemFromFile } from '@/types/global'
import UImage from '@/ui/UImage'
import { cls } from '@/utils/cls'
import { formatSeconds } from '@/utils/common'
import { DeleteOutlined, FolderOpenOutlined, LinkOutlined, MoreOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { removeDir } from '@tauri-apps/api/fs'
import { open as openShell } from '@tauri-apps/api/shell'
import { convertFileSrc } from '@tauri-apps/api/tauri'
import { App, Button, Dropdown, Modal } from 'antd'
import dayjs from 'dayjs'
import * as R from 'ramda'
import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'

export type BVListItemProps = {
  data: BVItemFromFile
  showUpName?: boolean
  className?: string
}

export default function BVListItem(props: BVListItemProps) {
  const { videoInfo, bvid, path: bvPath, children } = props.data
  const { message } = App.useApp()

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

  const queryClient = useQueryClient()
  const [openRemove, setOpenRemove] = useState(false)

  const removeMutation = useMutation({
    mutationFn: () => removeDir(bvPath, { recursive: true }),
    onSuccess() {
      message.success('视频删除成功')
      setOpenRemove(false)
      queryClient.invalidateQueries({ queryKey: ALL_BV_DATA_KEY })
    }
  })

  const pageCount = children?.filter((v) => v.name?.endsWith('.mp4')).length || 0

  return (
    <>
      <article className={cls(props.className)}>
        <div className='relative'>
          <UImage
            className='mb-2 h-36 cursor-pointer rounded-md transition-all hover:opacity-75'
            src={coverImageURL}
            onClick={openVideo}
          />

          {pageCount > 1 && <b className='absolute right-1 top-1 !m-0 text-xs text-white'>{pageCount}P</b>}

          <span className='absolute bottom-1 right-1 !m-0 rounded bg-black/20 px-1 text-xs text-white'>
            {formatSeconds(videoInfo.duration)}
          </span>
        </div>

        <div className='line-clamp-2 h-12 overflow-clip text-sm leading-6'>{videoInfo.title}</div>

        <div className='flex items-center justify-between space-x-2'>
          <label className='flex flex-1 items-center truncate text-xs text-gray-400'>
            {props.showUpName !== false && (
              <>
                <NavLink
                  to={`/home/space/${videoInfo.owner.mid}`}
                  className='inline-block cursor-pointer truncate !text-gray-400 transition-colors hover:!text-primary'
                >
                  {videoInfo.owner.name}
                </NavLink>
                <b className='mx-2 inline-block'>·</b>
              </>
            )}
            <span className='flex-shrink-0'>{dateLabel}</span>
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
                { key: 'remove', icon: <DeleteOutlined />, label: '删除文件夹', onClick: () => setOpenRemove(true) }
              ]
            }}
          >
            <Button shape='circle' type='text' icon={<MoreOutlined />} />
          </Dropdown>
        </div>
      </article>

      <Modal
        title='删除文件夹'
        open={openRemove}
        onCancel={() => setOpenRemove(false)}
        onOk={() => removeMutation.mutateAsync()}
      >
        <p>当前的 BV 视频文件夹中的所有文件都会被删除噢</p>
        <p>确定要删除文件夹吗？</p>
      </Modal>
    </>
  )
}

/**
 * @name OwnerCard
 * @description
 * @author darcrand
 */

import { ECommon } from '@/constants/common'
import { ALL_BV_DATA_KEY, useAllBVData } from '@/hooks/useAllBVData'
import { useRootDirPath } from '@/hooks/useRootDirPath'
import { userService } from '@/services/user'
import { useVideoQuery } from '@/stores/video-query'
import ImageView from '@/ui/ImageView'
import {
  DeleteOutlined,
  FolderOpenOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { remove } from '@tauri-apps/plugin-fs'
import { open as openShell } from '@tauri-apps/plugin-shell'
import { App, Button, Dropdown, Modal } from 'antd'
import { useState } from 'react'

export default function OwnerCard() {
  const [query, setQuery] = useVideoQuery()
  const isVaid = !!query.mid && query.mid !== ECommon.AllMid

  const rootDirPath = useRootDirPath()
  const { data: allData } = useAllBVData(rootDirPath)

  const { data: ownerInfo } = useQuery({
    enabled: isVaid,
    queryKey: ['up', 'info', query.mid],
    queryFn: () => userService.getById(query.mid || ''),
  })

  const openOwnerFolder = async () => {
    const matched = allData?.ups?.find((v) => v.mid === query.mid)
    if (matched?.path) {
      await openShell(matched?.path)
    }
  }

  const openOwnerSpace = async () => {
    await openShell(`https://space.bilibili.com/${query.mid}`)
  }

  const [openRemove, setOpenRemove] = useState(false)
  const queryClient = useQueryClient()
  const { message } = App.useApp()

  const removeMutation = useMutation({
    mutationFn: async () => {
      const matched = allData?.ups?.find((v) => v.mid === query.mid)
      if (matched?.path) {
        await remove(matched?.path, { recursive: true })
      } else {
        throw new Error('no path')
      }
    },
    onError() {
      message.error('删除失败')
    },
    onSuccess() {
      message.success('UP主删除成功')
      setOpenRemove(false)
      queryClient.invalidateQueries({ queryKey: ALL_BV_DATA_KEY })
      setQuery({ mid: ECommon.AllMid })
    },
  })

  if (!isVaid || !ownerInfo) return null

  return (
    <>
      <section className='flex items-center rounded-lg bg-slate-50 p-4'>
        <ImageView
          src={ownerInfo?.card.face}
          className='h-20 w-20 shrink-0 rounded-full'
        />

        <div className='mx-4 flex-1'>
          <p className='space-x-2'>
            <span
              className='hover:text-primary cursor-pointer text-xl font-bold transition-colors'
              onClick={() => openOwnerSpace()}
            >
              {ownerInfo?.card.name}
            </span>
            <sup className='inline-block bg-orange-500 px-1 text-xs text-white'>
              lv.{ownerInfo?.card?.level_info?.current_level}
            </sup>
          </p>
          <p className='mt-2 text-sm text-gray-500'>MID:{query.mid}</p>
          <p className='text-sm text-gray-500'>{ownerInfo.card.sign}</p>
        </div>

        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'open',
                icon: <FolderOpenOutlined />,
                label: '打开文件夹',
                onClick: () => openOwnerFolder(),
              },

              {
                key: 'remove',
                icon: <DeleteOutlined />,
                label: '删除文件夹',
                onClick: () => setOpenRemove(true),
              },
            ],
          }}
        >
          <Button
            shape='circle'
            type='text'
            size='large'
            icon={<MoreOutlined className='!text-primary' />}
          />
        </Dropdown>
      </section>

      <Modal
        title='删除 up 主文件夹'
        open={openRemove}
        onCancel={() => setOpenRemove(false)}
        onOk={() => removeMutation.mutateAsync()}
      >
        <p>确定要删除文件夹吗？</p>
        <p>这个 Up 所有的视频都会被删除哦</p>
      </Modal>
    </>
  )
}

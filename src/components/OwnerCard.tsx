/**
 * @name OwnerCard
 * @description 视频列表顶部当前视频列表的up主信息
 * @author darcrand
 */

import ImageView from '@/components/ImageView'
import { ECommon } from '@/const/enums'
import { useRootDirPath } from '@/hooks/useRootDirPath'
import { mediaService } from '@/services/media'
import { userService } from '@/services/user'
import { useVideoQuery } from '@/stores/video-query'
import { DeleteOutlined, FolderOpenOutlined, LinkOutlined, MoreOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { join } from '@tauri-apps/api/path'
import { exists, remove } from '@tauri-apps/plugin-fs'
import { open as openShell } from '@tauri-apps/plugin-shell'
import { Button, Dropdown } from 'antd'
import { message, modal } from './GlobalAntdMessage'

export default function OwnerCard() {
  const [query, setQuery] = useVideoQuery()
  const isValid = !!query.mid && query.mid !== ECommon.AllMid
  const rootDirPath = useRootDirPath()

  const { data: ownerInfo } = useQuery({
    enabled: isValid,
    queryKey: ['owner', query.mid],
    queryFn: async () => userService.findByMid(query.mid || ''),
  })

  const { data: ownerFullInfo } = useQuery({
    enabled: isValid,
    queryKey: ['owner', 'full-info', query.mid],
    queryFn: async () => {
      const res = await userService.getById(query.mid || '')
      return res
    },
  })

  const openOwnerFolder = async () => {
    if (!ownerInfo || !rootDirPath || !query.mid) return
    const ownerPath = await join(rootDirPath, query.mid)

    const isValid = await exists(ownerPath)
    if (!isValid) {
      message.error('文件夹不存在')
      return
    }

    await openShell(ownerPath)
  }

  const openOwnerSpace = async () => {
    await openShell(`https://space.bilibili.com/${query.mid}`)
  }

  const queryClient = useQueryClient()

  const removeMutation = useMutation({
    mutationFn: async () => {
      if (!ownerInfo || !rootDirPath || !query.mid) return
      const ownerPath = await join(rootDirPath, query.mid)

      // 删除文件夹
      try {
        await remove(ownerPath, { recursive: true })
      } catch (error) {
        console.log('error', error)
      }
      // 删除用户记录
      await userService.removeByMid(query.mid)
      // 删除视频记录
      const videoRes = await mediaService.page({
        mid: query.mid,
        pageSize: Infinity,
      })
      const ids = videoRes.records.map((item) => item.id)
      await mediaService.batchRemove(ids)
    },
    onError() {
      message.error('删除失败')
    },
    onSuccess() {
      message.success('UP主删除成功')
      queryClient.invalidateQueries({ queryKey: ['video', 'page'] })
      setQuery({ mid: ECommon.AllMid })
    },
  })

  const beforeRemove = async () => {
    modal.confirm({
      title: '删除 up 主文件夹',
      content: (
        <>
          <p>确定要删除文件夹吗？</p>
          <p>这个 Up 所有的视频都会被删除哦</p>
        </>
      ),
      onOk: () => removeMutation.mutate(),
    })
  }

  if (!isValid || !ownerInfo) return null

  return (
    <>
      <section className='flex items-center rounded-lg bg-slate-50 p-4'>
        <ImageView src={ownerInfo?.avatar} className='h-20 w-20 shrink-0 rounded-full' />

        <div className='mx-4 flex-1'>
          <p className='space-x-2'>
            <span
              className='hover:text-primary cursor-pointer text-xl font-bold transition-all'
              onClick={() => openOwnerSpace()}
            >
              <span className='mr-2'>{ownerInfo?.name}</span>
              <LinkOutlined />
            </span>
          </p>
          <p className='mt-2 text-sm text-gray-500'>MID:{query.mid}</p>
          <p className='text-sm text-gray-500'>{ownerFullInfo?.card.sign}</p>
        </div>

        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'open',
                icon: <FolderOpenOutlined />,
                label: '打开文件夹',
                onClick: openOwnerFolder,
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
          <Button shape='circle' type='text' size='large' icon={<MoreOutlined className='!text-primary' />} />
        </Dropdown>
      </section>
    </>
  )
}

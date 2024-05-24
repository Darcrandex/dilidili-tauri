/**
 * @name SpacePage
 * @description 单个UP或所有UP的详情页面
 * @author darcrand
 */

import BVListItem from '@/components/BVListItem'
import { useRootDirPath } from '@/hooks/use-root-dir-path'
import { fsService } from '@/services/fs'
import { userService } from '@/services/user'
import type { BVItemFromFile } from '@/types/global'
import UEmpty from '@/ui/UEmpty'
import UImage from '@/ui/UImage'
import { DeleteOutlined, FolderOpenOutlined, MoreOutlined } from '@ant-design/icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { removeDir } from '@tauri-apps/api/fs'
import { open as openShell } from '@tauri-apps/api/shell'
import { Button, Dropdown, Input, Modal, Pagination } from 'antd'
import * as R from 'ramda'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const PAGE_SIZE = 24

export default function SpacePage() {
  const id = useParams().id || ''
  const rootDirPath = useRootDirPath()

  const { data: ownerInfo } = useQuery({
    enabled: !!id,
    queryKey: ['up', 'info', id],
    queryFn: () => userService.getById(id)
  })

  const { data: allBVList } = useQuery({
    enabled: !!rootDirPath,
    queryKey: ['bv', 'all', rootDirPath],
    queryFn: () => fsService.getBVList(rootDirPath || '')
  })

  // 模拟分页
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [searchText, setSearchText] = useState('')

  // reset
  useEffect(() => {
    setPage(1)
    setKeyword('')
  }, [id])

  const { data: pageRes, isPending } = useQuery({
    queryKey: ['bv', 'pages', allBVList, id, page, keyword],
    queryFn: async () => {
      let arr: BVItemFromFile[] = R.clone(allBVList || [])

      if (id) {
        arr = arr.filter((v) => v.mid === id)
      }

      if (keyword) {
        arr = arr.filter((v) => v.videoInfo.title.includes(keyword))
      }

      arr = arr.sort((a, b) =>
        a.videoInfo?.pubdate && b.videoInfo?.pubdate ? b.videoInfo?.pubdate - a.videoInfo?.pubdate : 0
      )

      const total = arr.length
      const limit = PAGE_SIZE
      const offset = page * limit - limit

      return { records: arr.slice(offset, offset + limit), total }
    }
  })

  const openInBrowser = async () => {
    await openShell(`https://space.bilibili.com/${id}`)
  }

  const { data: ownerDirs } = useQuery({
    enabled: !!rootDirPath,
    queryKey: ['owner-dirs', rootDirPath],
    queryFn: () => fsService.getOwnerDirs(rootDirPath || '')
  })

  const openOwnerFolder = async () => {
    const matched = ownerDirs?.find((v) => v.mid === id)
    if (matched?.path) {
      await openShell(matched?.path)
    }
  }

  const [openRemove, setOpenRemove] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const removeOwnerFolder = async () => {
    const matched = ownerDirs?.find((v) => v.mid === id)
    if (matched?.path) {
      await removeDir(matched?.path, { recursive: true })
      setOpenRemove(false)
      queryClient.invalidateQueries({ queryKey: ['bv', 'all'] })
      navigate('/home/space')
    }
  }

  return (
    <>
      <div className='max-w-2xl mx-auto p-4'>
        {R.isNotNil(ownerInfo) && (
          <section className='flex items-center p-4 rounded-lg bg-slate-50'>
            <UImage src={ownerInfo?.card.face} className='shrink-0 w-20 h-20 rounded-full' />

            <div className='flex-1 mx-4'>
              <p className='space-x-2'>
                <span
                  className='font-bold text-xl hover:text-primary transition-colors cursor-pointer'
                  onClick={() => openInBrowser()}
                >
                  {ownerInfo?.card.name}
                </span>
                <sup className='inline-block px-1 text-xs bg-orange-500 text-white'>
                  lv.{ownerInfo?.card?.level_info?.current_level}
                </sup>
              </p>
              <p className='mt-2 text-gray-500 text-sm'>MID:{id}</p>
              <p className='text-gray-500 text-sm'>{ownerInfo.card.sign}</p>
            </div>

            <Dropdown
              trigger={['click']}
              menu={{
                items: [
                  {
                    key: 'open',
                    icon: <FolderOpenOutlined />,
                    label: '打开文件夹',
                    onClick: () => openOwnerFolder()
                  },

                  { key: 'remove', icon: <DeleteOutlined />, label: '删除文件夹', onClick: () => setOpenRemove(true) }
                ]
              }}
            >
              <Button shape='circle' type='text' icon={<MoreOutlined />} />
            </Dropdown>
          </section>
        )}

        <div className='flex max-w-sm mx-auto my-10 space-x-4'>
          <Input.Search
            maxLength={30}
            placeholder='搜索视频'
            enterButton
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={() => {
              setPage(1)
              setKeyword(searchText)
            }}
            allowClear
          />
        </div>

        <ul className='flex flex-wrap -mx-4 my-2'>
          {pageRes?.records?.map((v) => (
            <li key={v.bvid} className='w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 2xl:w-1/6'>
              <BVListItem data={v} className='m-4' />
            </li>
          ))}
        </ul>

        {isPending && <p className='my-10 text-center text-slate-500'>加载中...</p>}
        {pageRes?.records?.length === 0 && <UEmpty>啥也没有...</UEmpty>}

        <footer className='my-4'>
          <Pagination
            className='text-center'
            hideOnSinglePage
            showSizeChanger={false}
            current={page}
            pageSize={PAGE_SIZE}
            total={pageRes?.total || 0}
            onChange={(page) => setPage(page)}
            showTotal={(total) => `共 ${total} 条`}
          />
        </footer>
      </div>

      <Modal title='删除文件夹' open={openRemove} onCancel={() => setOpenRemove(false)} onOk={removeOwnerFolder}>
        <p>确定要删除文件夹吗？</p>
        <p>这个 Up 所有的视频都会被删除哦</p>
      </Modal>
    </>
  )
}

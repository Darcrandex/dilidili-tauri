/**
 * @name SpacePage
 * @description 单个UP或所有UP的详情页面
 * @author darcrand
 */

import BVListItem from '@/components/BVListItem'
import { useRootDirPath } from '@/hooks/use-root-dir-path'
import { ALL_BV_DATA_KEY, useAllBVData } from '@/queries/useAllBVData'
import { fsService } from '@/services/fs'
import { userService } from '@/services/user'
import { useSetCachedUrl } from '@/stores/use-cached-url'
import type { BVItemFromFile } from '@/types/global'
import UEmpty from '@/ui/UEmpty'
import UImage from '@/ui/UImage'
import useUrlState from '@ahooksjs/use-url-state'
import { DeleteOutlined, FolderOpenOutlined, MoreOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { removeDir } from '@tauri-apps/api/fs'
import { open as openShell } from '@tauri-apps/api/shell'
import { App, Button, Dropdown, Input, Modal, Pagination } from 'antd'
import QueryString from 'qs'
import * as R from 'ramda'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const PAGE_SIZE = 24

export default function SpacePage() {
  const { message } = App.useApp()
  const rootDirPath = useRootDirPath()
  const { data: allData, isLoading: allDataLoading } = useAllBVData(rootDirPath)

  const id = useParams().id || ''
  const [query, setQuery] = useUrlState({ page: '1', keyword: '' })
  const [searchText, setSearchText] = useState(query.keyword || '')
  const setCachedUrl = useSetCachedUrl()

  useEffect(() => setSearchText(query.keyword), [query.keyword])
  useEffect(() => {
    setCachedUrl(`space/${id}?${QueryString.stringify(query)}`)
  }, [id, query, setCachedUrl])

  const {
    data: pageRes,
    isLoading: pageLoading,
    isSuccess
  } = useQuery({
    queryKey: ['bv', 'pages', id, query, allData?.bvs],
    queryFn: async () => {
      let arr: BVItemFromFile[] = R.clone(allData?.bvs || [])

      // 是否指定 UP
      if (id) {
        arr = arr.filter((v) => v.mid === id)
      }

      // 是否指定关键字
      if (query.keyword) {
        const regex = new RegExp(query.keyword.trim().toLowerCase(), 'i')
        // 视频标题或 UP 名称
        arr = arr.filter((v) => regex.test(v.videoInfo.title) || regex.test(v.videoInfo.owner.name))
      }

      // 排序
      arr.sort((a, b) => (b.videoInfo?.pubdate || 0) - (a.videoInfo?.pubdate || 0))

      const total = arr.length
      const limit = PAGE_SIZE
      const offset = (query.page - 1) * limit

      return { records: arr.slice(offset, offset + limit), total }
    }
  })

  const { data: ownerInfo } = useQuery({
    enabled: !!id,
    queryKey: ['up', 'info', id],
    queryFn: () => userService.getById(id || '')
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

  const removeMutation = useMutation({
    mutationFn: async () => {
      const matched = ownerDirs?.find((v) => v.mid === id)
      if (matched?.path) {
        await removeDir(matched?.path, { recursive: true })
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
      queryClient.invalidateQueries({ queryKey: ['bv', 'all'] })
      navigate('/home/space')
    }
  })

  const isLoading = allDataLoading || pageLoading

  return (
    <>
      <div className='mx-auto max-w-2xl p-4'>
        {R.isNotNil(ownerInfo) && (
          <section className='flex items-center rounded-lg bg-slate-50 p-4'>
            <UImage src={ownerInfo?.card.face} className='h-20 w-20 shrink-0 rounded-full' />

            <div className='mx-4 flex-1'>
              <p className='space-x-2'>
                <span
                  className='cursor-pointer text-xl font-bold transition-colors hover:text-primary'
                  onClick={() => openInBrowser()}
                >
                  {ownerInfo?.card.name}
                </span>
                <sup className='inline-block bg-orange-500 px-1 text-xs text-white'>
                  lv.{ownerInfo?.card?.level_info?.current_level}
                </sup>
              </p>
              <p className='mt-2 text-sm text-gray-500'>MID:{id}</p>
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

        <div className='mx-auto my-10 flex max-w-sm space-x-4'>
          <Input.Search
            maxLength={30}
            placeholder='搜索视频或 UP 主名称'
            enterButton
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={(txt) => {
              setQuery((prev) => ({ ...prev, keyword: txt, page: 1 }))
            }}
            allowClear
          />
        </div>

        <ul className='-mx-4 my-2 flex flex-wrap'>
          {pageRes?.records?.map((v) => (
            <li key={v.bvid} className='w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 2xl:w-1/6'>
              <BVListItem data={v} className='m-4' showUpName={!id} />
            </li>
          ))}
        </ul>

        {isLoading && <p className='my-10 text-center text-slate-500'>加载中...</p>}
        {isSuccess && pageRes?.records?.length === 0 && <UEmpty>啥也没有...</UEmpty>}

        <footer className='my-4'>
          <Pagination
            className='text-center'
            hideOnSinglePage
            showSizeChanger={false}
            current={query.page}
            pageSize={PAGE_SIZE}
            total={pageRes?.total || 0}
            onChange={(page) => setQuery((prev) => ({ ...prev, page }))}
            showTotal={(total) => `共 ${total} 条`}
          />
        </footer>
      </div>

      <Modal
        title='删除文件夹'
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

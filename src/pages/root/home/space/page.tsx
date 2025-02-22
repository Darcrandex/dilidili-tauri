/**
 * @name SpacePage
 * @description
 * @author darcrand
 */

import BVListItem from '@/components/BVListItem'
import OwnerCard from '@/components/OwnerCard'
import { ECommon } from '@/constants/common'
import { useAllBVData } from '@/hooks/useAllBVData'
import { useRootDirPath } from '@/hooks/useRootDirPath'
import { useVideoQuery } from '@/stores/video-query'
import Nothing from '@/ui/Nothing'
import { ReloadOutlined } from '@ant-design/icons'
import { useDebounce } from 'ahooks'
import { Button, Input, Pagination } from 'antd'
import { useEffect, useMemo, useState } from 'react'

const PAGE_SIZE = 24

export default function SpacePage() {
  const rootDirPath = useRootDirPath()
  const {
    data: allData,
    isLoading,
    refetch: refetchAll,
  } = useAllBVData(rootDirPath)

  const [query, setQuery] = useVideoQuery()
  const [searchText, setSearchText] = useState<string>()
  const keyword = useDebounce(query.keyword, { wait: 500 })
  useEffect(() => setSearchText(query.keyword), [query.keyword])

  const listData = useMemo(() => {
    if (!allData?.bvs) return { records: [], total: 0 }

    const pageNumber = query.pageNumber || 1
    const pageSize = PAGE_SIZE
    const list = allData.bvs
      .filter(
        (v) =>
          !query.mid || query.mid === ECommon.AllMid || v.mid === query.mid,
      )
      .filter(
        (v) =>
          !keyword ||
          v.videoInfo?.title?.includes(keyword) ||
          v.videoInfo?.owner?.name?.includes(keyword),
      )

    return {
      records: list.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
      total: list.length,
    }
  }, [allData?.bvs, query, keyword])

  return (
    <>
      <section className='mx-auto max-w-7xl p-4'>
        <OwnerCard />

        <header className='mx-auto my-10 flex max-w-sm space-x-2'>
          <div className='flex-1'>
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

          <Button
            type='primary'
            icon={<ReloadOutlined />}
            onClick={() => refetchAll()}
          />
        </header>

        <ul className='-mx-4 my-2 flex flex-wrap'>
          {listData?.records?.map((v) => (
            <li
              key={v.bvid}
              className='3xl:w-1/8 3xl:1/8 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 2xl:w-1/6'
            >
              <BVListItem
                data={v}
                className='m-4'
                showUpName={query.mid === ECommon.AllMid}
              />
            </li>
          ))}
        </ul>

        {isLoading ? (
          <p className='my-10 text-center text-slate-500'>加载中...</p>
        ) : (
          listData?.records?.length === 0 && <Nothing>啥也没有...</Nothing>
        )}

        <footer className='my-4 flex justify-center'>
          <Pagination
            hideOnSinglePage
            showSizeChanger={false}
            current={query.pageNumber || 1}
            pageSize={PAGE_SIZE}
            total={listData?.total || 0}
            onChange={(p) => setQuery((prev) => ({ ...prev, pageNumber: p }))}
            showTotal={(t) => `共 ${t} 条`}
          />
        </footer>
      </section>
    </>
  )
}

/**
 * @name SpaceMain
 * @description 具体一个 UP 的主页面
 * @author darcrand
 */

import Nothing from '@/components/Nothing'
import OwnerCard from '@/components/OwnerCard'
import VideoItem from '@/components/VideoItem'
import { ECommon } from '@/const/enums'
import { useRootDirPath } from '@/hooks/useRootDirPath'
import { mediaService } from '@/services/media'
import { useVideoQuery } from '@/stores/video-query'
import { ReloadOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Button, Col, Input, Pagination, Row } from 'antd'
import { useState } from 'react'

const PAGE_SIZE = 24

export default function SpaceMain() {
  const rootDirPath = useRootDirPath()

  const [query, setQuery] = useVideoQuery()
  const isAll = !query.mid || query.mid === ECommon.AllMid
  const [searchText, setSearchText] = useState<string | undefined>(query.keyword)

  const { data, isPending, refetch } = useQuery({
    enabled: !!rootDirPath,
    queryKey: ['video', 'page', query],
    queryFn: async () => mediaService.page({ ...query, pageSize: PAGE_SIZE }),
  })

  return (
    <>
      <section className='mx-auto max-w-7xl p-4'>
        <OwnerCard />

        <header className='mx-auto my-8 flex max-w-full justify-center gap-2 text-center'>
          <div className='w-96'>
            <Input.Search
              allowClear
              maxLength={30}
              className='w-full'
              placeholder='搜索视频或 UP 主名称'
              enterButton
              autoComplete='off'
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(txt) => {
                setQuery((prev) => ({ ...prev, keyword: txt, pageNumber: 1 }))
              }}
            />
          </div>

          <Button type='primary' icon={<ReloadOutlined />} loading={isPending} onClick={() => refetch()} />
        </header>

        <Row gutter={[22, 22]}>
          {data?.records?.map((v) => (
            <Col xs={24} sm={12} lg={8} xl={6} xxl={4} key={v.id}>
              <VideoItem data={v} showUpName={isAll} />
            </Col>
          ))}
        </Row>

        {isPending ? (
          <p className='my-10 text-center text-slate-500'>加载中...</p>
        ) : (
          data?.records?.length === 0 && <Nothing>啥也没有...</Nothing>
        )}

        <footer className='my-4 flex justify-center'>
          <Pagination
            hideOnSinglePage
            showSizeChanger={false}
            current={query.pageNumber || 1}
            pageSize={PAGE_SIZE}
            total={data?.total || 0}
            onChange={(p) => setQuery((prev) => ({ ...prev, pageNumber: p }))}
            showTotal={(t) => `共 ${t} 条`}
          />
        </footer>
      </section>
    </>
  )
}

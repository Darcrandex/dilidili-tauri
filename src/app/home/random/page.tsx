/**
 * @name RandomPage
 * @description 随机视频页面
 * */

import Nothing from '@/components/Nothing'
import VideoItem from '@/components/VideoItem'
import { mediaService } from '@/services/media'
import { ReloadOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Button, Col, Row } from 'antd'

export default function RandomPage() {
  const { data, isPending, refetch } = useQuery({
    queryKey: ['video', 'random'],
    queryFn: () => mediaService.randomMedias(48),
  })

  return (
    <>
      <div className='mx-auto max-w-7xl p-4'>
        <header className='my-6'>
          <Button type='primary' icon={<ReloadOutlined />} loading={isPending} onClick={() => refetch()}>
            刷新
          </Button>
        </header>

        <Row gutter={[22, 22]}>
          {data?.map((v) => (
            <Col xs={24} sm={12} lg={8} xl={6} xxl={4} key={v.id}>
              <VideoItem data={v} />
            </Col>
          ))}
        </Row>

        {isPending ? (
          <p className='my-10 text-center text-slate-500'>加载中...</p>
        ) : (
          data?.length === 0 && <Nothing>啥也没有...</Nothing>
        )}
      </div>
    </>
  )
}

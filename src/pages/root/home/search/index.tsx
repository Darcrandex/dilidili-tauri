/**
 * @name Search
 * @description
 * @author darcrand
 */

import logoImage from '@/assets/logos/dilidili-logo1@0.5x.png'
import DownloadModal from '@/components/DownloadModal'
import { mediaService } from '@/services/media'
import { useSession } from '@/stores/use-session'
import { useVideoSearch } from '@/stores/use-video-search'
import UEmpty from '@/ui/UEmpty'
import UImage from '@/ui/UImage'
import { cls } from '@/utils/cls'
import { DownloadOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Button, Input } from 'antd'
import qs from 'qs'
import * as R from 'ramda'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Search() {
  const navigate = useNavigate()
  const [session] = useSession()
  const [text, setText] = useVideoSearch()

  const bvid = useMemo(() => {
    const regex = /\/video\/(BV[0-9a-zA-Z]+)/m
    const match = text.match(regex)
    return match?.[1]
  }, [text])

  const invalidBVID = !!text.trim() && !bvid

  const p = useMemo(() => {
    const query = text?.split('?')?.[1]
    const params = qs.parse(query)
    return Number.parseInt((params?.p as string) || '1')
  }, [text])

  const { data: videoInfo } = useQuery({
    enabled: !!bvid,
    retry: false,
    queryKey: ['bv', bvid],
    queryFn: () => mediaService.info(bvid || '')
  })

  // layout
  const placeholderHeight = R.isNil(videoInfo) && window.innerHeight ? 0.25 * window.innerHeight : 0

  return (
    <>
      <div className='max-w-xl mx-auto p-4'>
        <section className='mb-4 space-y-4'>
          <div className='invisible' style={{ height: placeholderHeight }}></div>

          <div className='max-w-sm mx-auto'>
            <img
              src={logoImage}
              alt=''
              className={cls('block w-auto h-20 mx-auto mb-12', R.isNotNil(videoInfo) && 'hidden')}
            />

            <Input.Search
              placeholder='输入视频地址试试看吧  ≖‿≖✧'
              enterButton
              defaultValue={text}
              allowClear
              autoFocus
              size='large'
              onSearch={setText}
            />

            {invalidBVID && <UEmpty>视频地址不对劲</UEmpty>}
          </div>

          {!!videoInfo && (
            <>
              <article className='flex items-center'>
                <UImage src={videoInfo.owner.face} fit='cover' className='w-10 h-10 rounded-full' />

                <div className='ml-2'>
                  <p className='text-sm cursor-pointer transition-colors hover:opacity-80'>{videoInfo.owner.name}</p>
                  <p className='text-sm text-gray-500'>MID: {videoInfo.owner.mid}</p>
                </div>
              </article>

              <h2 className='font-bold'>{videoInfo.title}</h2>

              <UImage src={videoInfo.pic} fit='contain' className='h-80 lg:h-96 rounded-lg bg-black' />

              {!!session && (
                <p className='text-center'>
                  <DownloadModal
                    videoInfo={videoInfo}
                    defaultPage={p}
                    onOk={() => navigate('/home/tasks', { replace: true })}
                    trigger={(onOpen) => (
                      <Button type='primary' icon={<DownloadOutlined />} onClick={onOpen}>
                        下载视频
                      </Button>
                    )}
                  />
                </p>
              )}

              {!session && (
                <p className='text-center space-x-2'>
                  <span>不</span>
                  <Button type='primary' onClick={() => navigate('/mine', { replace: true })}>
                    登录
                  </Button>
                  <span>下载不了视频 (→_←)</span>
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </>
  )
}

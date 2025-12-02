/**
 * @name SearchPage
 * @description
 * @author darcrand
 */

import logoImage from '@/assets/logos/dilidili-logo1@0.5x.png'
import DownloadModal from '@/components/DownloadModal'
import ImageView from '@/components/ImageView'
import { mediaService } from '@/services/media'
import { useSession } from '@/stores/session'
import { useVideoSearch } from '@/stores/video-search'
import { cls } from '@/utils/cls'
import { DownloadOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Button, Input, InputRef, Space } from 'antd'
import { isNil } from 'lodash-es'
import qs from 'qs'
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

// https://www.bilibili.com/video/BV1m2GrzLE8n

export default function SearchPage() {
  const navigate = useNavigate()
  const [session] = useSession()
  const inputRef = useRef<InputRef>(null)
  const [keyword, setKeyword] = useVideoSearch()
  const [text, setText] = useState(keyword)

  const bvid = useMemo(() => {
    const regex = /\/video\/(BV[0-9a-zA-Z]+)/m
    const match = keyword.match(regex)
    return match?.[1]
  }, [keyword])

  const invalidBVID = !!keyword.trim() && !bvid

  const pageIndex = useMemo(() => {
    const query = keyword?.split('?')?.[1]
    const params = qs.parse(query)
    return Number.parseInt((params?.p as string) || '1')
  }, [keyword])

  const { data: videoInfo } = useQuery({
    enabled: !!bvid,
    retry: false,
    queryKey: ['bv', bvid],
    queryFn: () => mediaService.info(bvid || ''),
  })

  // layout
  const placeholderHeight = isNil(videoInfo) ? 0.2 * window.innerHeight : 0

  return (
    <>
      <div className='mx-auto max-w-7xl p-4'>
        <section className='mb-4 space-y-4'>
          <div className='invisible' style={{ height: placeholderHeight }}></div>

          <div className='mx-auto max-w-7xl lg:max-w-md'>
            <img
              src={logoImage}
              alt=''
              className={cls('mx-auto mb-12 block h-20 w-auto', !isNil(videoInfo) && 'hidden')}
            />

            <Space.Compact block>
              <Input.Search
                ref={inputRef}
                className='w-full'
                placeholder='输入视频地址试试看吧  ≖‿≖✧'
                enterButton
                autoFocus
                allowClear
                maxLength={100}
                size='large'
                value={text}
                onChange={(e) => setText(e.target.value)}
                onSearch={setKeyword}
              />
            </Space.Compact>

            {invalidBVID && <p className='text-center text-red-400 mt-4'>视频地址不对劲</p>}
          </div>

          {!!videoInfo && (
            <>
              <article className='flex items-center'>
                <ImageView src={videoInfo.owner.face} fit='cover' className='h-10 w-10 rounded-full' />

                <div className='ml-2'>
                  <p className='cursor-pointer text-sm transition-colors hover:opacity-80'>{videoInfo.owner.name}</p>
                  <p className='text-sm text-gray-500'>MID: {videoInfo.owner.mid}</p>
                </div>
              </article>

              <article>
                <h2 className='mt-0 font-bold'>{videoInfo.title}</h2>
              </article>

              <ImageView src={videoInfo.pic} fit='contain' className='h-60 rounded-lg bg-black lg:h-96' />

              {!!session && (
                <p className='text-center'>
                  <DownloadModal
                    videoInfo={videoInfo}
                    defaultPage={pageIndex}
                    onOk={() => navigate('/home/task', { replace: true })}
                    trigger={(onOpen) => (
                      <Button type='primary' icon={<DownloadOutlined />} onClick={onOpen}>
                        下载视频
                      </Button>
                    )}
                  />
                </p>
              )}

              {!session && (
                <p className='space-x-2 text-center'>
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

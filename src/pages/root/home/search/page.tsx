/**
 * @name Search
 * @description 搜索页面
 * @author darcrand
 */

import logoImage from '@/assets/logos/dilidili-logo1@0.5x.png'
import DownloadModal from '@/components/DownloadModal'
import { mediaService } from '@/services/media'
import { useSession } from '@/stores/session'
import { useVideoSearch } from '@/stores/video-search'
import ImageView from '@/ui/ImageView'
import Nothing from '@/ui/Nothing'
import { cls } from '@/utils/cls'
import { DownloadOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Button, Input } from 'antd'
import qs from 'qs'
import * as R from 'ramda'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'

export default function SearchPage() {
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
    queryFn: () => mediaService.info(bvid || ''),
  })

  // layout
  const placeholderHeight = R.isNil(videoInfo) ? 0.2 * window.innerHeight : 0

  return (
    <>
      <div className='mx-auto max-w-7xl p-4'>
        <section className='mb-4 space-y-4'>
          <div
            className='invisible'
            style={{ height: placeholderHeight }}
          ></div>

          <div className='mx-auto max-w-7xl lg:max-w-md'>
            <img
              src={logoImage}
              alt=''
              className={cls(
                'mx-auto mb-12 block h-20 w-auto',
                R.isNotNil(videoInfo) && 'hidden',
              )}
            />

            <Input.Search
              className='w-full'
              placeholder='输入视频地址试试看吧  ≖‿≖✧'
              enterButton
              defaultValue={text}
              allowClear
              autoFocus
              size='large'
              onSearch={setText}
            />

            {invalidBVID && <Nothing>视频地址不对劲</Nothing>}
          </div>

          {!!videoInfo && (
            <>
              <article className='flex items-center'>
                <ImageView
                  src={videoInfo.owner.face}
                  fit='cover'
                  className='h-10 w-10 rounded-full'
                />

                <div className='ml-2'>
                  <p className='cursor-pointer text-sm transition-colors hover:opacity-80'>
                    {videoInfo.owner.name}
                  </p>
                  <p className='text-sm text-gray-500'>
                    MID: {videoInfo.owner.mid}
                  </p>
                </div>
              </article>

              <article>
                <h2 className='mt-0 font-bold'>{videoInfo.title}</h2>
              </article>

              <ImageView
                src={videoInfo.pic}
                fit='contain'
                className='h-60 rounded-lg bg-black lg:h-96'
              />

              {!!session && (
                <p className='text-center'>
                  <DownloadModal
                    videoInfo={videoInfo}
                    defaultPage={p}
                    onOk={() => navigate('/home/tasks', { replace: true })}
                    trigger={(onOpen) => (
                      <Button
                        type='primary'
                        icon={<DownloadOutlined />}
                        onClick={onOpen}
                      >
                        下载视频
                      </Button>
                    )}
                  />
                </p>
              )}

              {!session && (
                <p className='space-x-2 text-center'>
                  <span>不</span>
                  <Button
                    type='primary'
                    onClick={() => navigate('/mine', { replace: true })}
                  >
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

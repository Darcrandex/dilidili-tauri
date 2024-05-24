/**
 * @name DownloadModal
 * @description 下载信息确认
 * @author darcrand
 */

import { mediaService } from '@/services/media'
import { taskService } from '@/services/task'
import { useDownloadQueue } from '@/stores/use-download-queue'
import { useSession } from '@/stores/use-session'
import type { DownloadBVParams, PageInfoSchema, VideoInfoSchema } from '@/types/global'
import { cls } from '@/utils/cls'
import { sleep, taskOneByOne } from '@/utils/common'
import { getSimilarQualityVideo } from '@/utils/get-similar-quality-video'
import { useMutation, useQueries, useQuery } from '@tanstack/react-query'
import { useSelections } from 'ahooks'
import { Button, Checkbox, Col, Modal, Row, Select } from 'antd'
import * as R from 'ramda'
import { ReactNode, useMemo, useState } from 'react'
import { pickVideoInfo } from './utils'

const MAX_TASK_COUNT = 100

export type DownloadModalProps = {
  videoInfo: VideoInfoSchema
  defaultPage?: number
  trigger?: (onOpen: () => void) => ReactNode
  onOk?: () => void
}

export default function DownloadModal(props: DownloadModalProps) {
  const [session] = useSession()
  const { addAutoRun } = useDownloadQueue()
  const [modal, contextHolder] = Modal.useModal()

  const { data: taskList } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskService.all()
  })

  // 视频第一个分p
  const { data: playurlData } = useQuery({
    queryKey: ['video', 'playurl', props.videoInfo.bvid, props.videoInfo.cid],
    enabled: !!props.videoInfo.bvid,
    queryFn: () => mediaService.playurl(props.videoInfo.bvid, props.videoInfo.cid)
  })

  // 所有视频分p的数据
  const pageInfoResArr = useQueries({
    queries: props.videoInfo.pages.map((v) => ({
      queryKey: ['video', 'playurl', props.videoInfo.bvid, v.cid],
      enabled: !!props.videoInfo.bvid && !!v.cid,
      queryFn: () => mediaService.playurl(props.videoInfo.bvid, v.cid),
      select: (res: PageInfoSchema) => {
        return { page: v.page, info: res }
      },
      // 下载地址有效时间 180 秒
      gcTime: 3 * 60 * 1000,
      staleTime: 3 * 60 * 1000
    }))
  })

  // 清晰度
  const qualityOptions = useMemo(() => {
    if (!Array.isArray(playurlData?.support_formats)) return []

    return playurlData.support_formats.map((item) => ({
      value: item.quality,
      label: item.new_description,
      disabled: !session && item.quality > 64
    }))
  }, [playurlData, session])

  // 视频分p
  const pages = useMemo(() => {
    if (!Array.isArray(props.videoInfo.pages)) return []
    return props.videoInfo.pages.map((v) => ({ value: v.page, label: v.part }))
  }, [props.videoInfo])

  const [open, setOpen] = useState(false)
  const [quality, setQuality] = useState<number>()

  // 选择分p
  const {
    selected: selectedPages,
    allSelected,
    isSelected,
    toggle,
    toggleAll,
    setSelected,
    partiallySelected
  } = useSelections(
    pages.map((v) => v.value),
    [props.defaultPage].filter(Boolean) as number[]
  )

  const beforeOpen = () => {
    setQuality(qualityOptions?.find((v) => !v.disabled)?.value)
    setSelected([props.defaultPage].filter(Boolean) as number[])
    setOpen(true)
  }

  const onCancel = () => {
    setOpen(false)
  }

  const { mutateAsync: onOk, isPending } = useMutation({
    mutationFn: async () => {
      if (!quality || selectedPages.length === 0) return

      // 检查任务是否达到上限
      const nextTaskCount = selectedPages.length + (taskList?.length || 0)
      if (nextTaskCount >= MAX_TASK_COUNT) {
        modal.warning({
          title: '提示',
          content: `(〜￣△￣)〜 任务数量超过 ${MAX_TASK_COUNT} 了，先清空一下吧`
        })
        return
      }

      const taskParamsArr = selectedPages
        .map((p) => {
          // 根据分p序号找到对应的视频信息
          const matchedPageInfo = pageInfoResArr.find((res) => res?.data?.page === p)?.data?.info

          // id 相同时，bandwidth 不同
          // 先根据 bandwidth 降序
          // 保证下载的是高码率的
          const videos = R.sort((a, b) => b.bandwidth - a.bandwidth, matchedPageInfo?.dash?.video || [])
          const matchedVideo = getSimilarQualityVideo(quality, videos)
          const videoDownloadUrl = matchedVideo?.baseUrl || ''

          const audios = R.sort((a, b) => b.bandwidth - a.bandwidth, matchedPageInfo?.dash?.audio || [])
          const audioDownloadUrl = R.head(audios)?.baseUrl || ''

          const params: DownloadBVParams = {
            mid: props.videoInfo.owner.mid.toString(),
            bvid: props.videoInfo.bvid,
            page: p,
            quality: matchedVideo?.id || quality,
            videoDownloadUrl,
            audioDownloadUrl,
            coverImageUrl: props.videoInfo.pic,
            videoInfo: pickVideoInfo(props.videoInfo)
          }

          return params
        })
        .filter((v) => Boolean(v.videoDownloadUrl && v.audioDownloadUrl))

      const tasks = taskParamsArr.map((p, i, arr) => {
        return async () => {
          const id = await taskService.create(p)
          addAutoRun(id, p)
          // 多任务添加延迟
          await sleep(i === arr.length - 1 ? 0 : 500)
        }
      })

      await taskOneByOne(tasks)
    },

    onSuccess() {
      onCancel()
      props.onOk?.()
    }
  })

  return (
    <>
      {typeof props.trigger === 'function' ? props.trigger(beforeOpen) : <Button onClick={beforeOpen}>下载</Button>}
      {contextHolder}

      <Modal width={420} open={open} onCancel={onCancel} footer={null}>
        <section className='space-y-4'>
          <h2 className='mb-8 text-lg font-bold text-center'>下载视频</h2>

          <div className='flex items-center justify-between'>
            <Select
              placeholder='选择清晰度'
              className='w-40'
              options={qualityOptions}
              value={quality}
              onChange={setQuality}
            />

            <Checkbox checked={allSelected} onClick={toggleAll} indeterminate={partiallySelected}>
              全选
            </Checkbox>
          </div>

          <div className='h-60 space-y-2 mb-4 overflow-auto'>
            <ul className='space-y-2'>
              {pages.map((v) => (
                <li
                  key={v.value}
                  className={cls(
                    'px-2 py-1 rounded-md border cursor-pointer transition-all select-none',
                    isSelected(v.value)
                      ? 'bg-primary/10 border-primary'
                      : 'bg-gray-100 hover:bg-primary/10 border-transparent'
                  )}
                  onClick={() => toggle(v.value)}
                >
                  {v.label}
                </li>
              ))}
            </ul>
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Button block onClick={onCancel}>
                取消
              </Button>
            </Col>
            <Col span={12}>
              <Button
                block
                type='primary'
                disabled={!quality || !selectedPages.length}
                loading={isPending}
                onClick={() => onOk()}
              >
                开始下载({selectedPages.length})
              </Button>
            </Col>
          </Row>
        </section>
      </Modal>
    </>
  )
}

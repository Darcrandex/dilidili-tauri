/**
 * @name DownloadModal
 * @description 下载信息确认
 * @author darcrand
 */

import { ETaskStatus } from '@/const/enums'
import { downloadBV } from '@/core'
import { useRootDirPath } from '@/hooks/useRootDirPath'
import { mediaService } from '@/services/media'
import { taskService } from '@/services/task'
import { useSession } from '@/stores/session'
import { cls } from '@/utils/cls'
import { getSimilarQualityVideo } from '@/utils/get-similar-quality-video'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSelections } from 'ahooks'
import { App, Button, Checkbox, Flex, Modal, Select } from 'antd'
import { clamp, first, sortBy } from 'lodash-es'
import { ReactNode, useMemo, useState } from 'react'
import { pickVideoInfo } from './utils'

const MAX_TASK_COUNT = clamp(
  process.env.VITE_MAX_TASK_COUNT ? Number.parseInt(process.env.VITE_MAX_TASK_COUNT) : 100,
  1,
  100,
)
const MAX_PROCESS_COUNT = clamp(
  process.env.VITE_MAX_PROCESS_COUNT ? Number.parseInt(process.env.VITE_MAX_PROCESS_COUNT) : 10,
  1,
  10,
)

export type DownloadModalProps = {
  videoInfo: Bilibili.VideoInfoSchema
  defaultPage?: number
  trigger?: (onOpen: () => void) => ReactNode
  onOk?: () => void
}

export default function DownloadModal(props: DownloadModalProps) {
  const [session] = useSession()
  const { modal } = App.useApp()
  const rootDirPath = useRootDirPath()
  const queryClient = useQueryClient()

  const { data: taskList } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskService.all(),
  })

  // 视频第一个分p
  const { data: playurlData } = useQuery({
    queryKey: ['video', 'playurl', props.videoInfo.bvid, props.videoInfo.cid],
    enabled: !!props.videoInfo.bvid,
    queryFn: () => mediaService.playurl(props.videoInfo.bvid, props.videoInfo.cid),
  })

  // 所有视频分p的数据
  const pageInfoResArr = useQueries({
    queries: props.videoInfo.pages.map((v) => ({
      queryKey: ['video', 'playurl', props.videoInfo.bvid, v.cid],
      enabled: !!props.videoInfo.bvid && !!v.cid,
      queryFn: () => mediaService.playurl(props.videoInfo.bvid, v.cid),
      select: (res: Bilibili.PageInfoSchema) => {
        return { page: v.page, info: res }
      },
      // 下载地址有效时间 180 秒
      gcTime: 3 * 60 * 1000,
      staleTime: 3 * 60 * 1000,
    })),
  })

  // 清晰度
  const qualityOptions = useMemo(() => {
    if (!Array.isArray(playurlData?.support_formats)) return []

    return playurlData.support_formats.map((item) => ({
      value: item.quality,
      label: item.new_description,
      disabled: !session && item.quality > 64,
    }))
  }, [playurlData, session])

  // 视频分p
  const pages = useMemo(() => {
    if (!Array.isArray(props.videoInfo.pages)) return []
    return props.videoInfo.pages.map((v) => ({
      value: v.page,
      label: v.part?.trim() ? v.part : '无标题',
    }))
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
    partiallySelected,
  } = useSelections(
    pages.map((v) => v.value),
    [props.defaultPage].filter(Boolean) as number[],
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
      if (!quality || selectedPages.length === 0 || !rootDirPath) return

      // 检查任务是否达到上限
      const nextTaskCount = selectedPages.length + (taskList?.length || 0)
      if (nextTaskCount >= MAX_TASK_COUNT) {
        modal.warning({
          title: '提示',
          content: `(〜￣△￣)〜 任务数量超过 ${MAX_TASK_COUNT} 了，先清空一下吧`,
        })
        throw new Error('超过总任务上限')
      }

      // 检查下载中的任务上限
      const pendingCount = taskList
        ? taskList.filter((v) => v.status === ETaskStatus.Downloading || v.status === ETaskStatus.Merging).length
        : 0
      if (pendingCount >= MAX_PROCESS_COUNT) {
        modal.warning({
          title: '提示',
          content: `(〜￣△￣)〜 最多同时下载 ${MAX_PROCESS_COUNT} 个任务`,
        })
        throw new Error('超过最多进程上限')
      }

      // 检查是否为相同视频文件
      const getTaskHash = (...args: any[]) => args.join('-')
      const taskHash = getTaskHash([props.videoInfo.owner.mid, props.videoInfo.bvid, quality])
      const hasSameTask = taskList?.some(
        (v) =>
          (v.status === ETaskStatus.Downloading || v.status === ETaskStatus.Merging) &&
          getTaskHash(v.params.mid, v.params.bvid, v.params.quality) === taskHash,
      )

      if (hasSameTask) {
        modal.warning({
          title: '提示',
          content: `(〜￣△￣)〜 相同的视频任务正在下载中`,
        })
        throw new Error('相同视频任务下载中')
      }

      const taskParamsArr = selectedPages.map((p) => {
        // 根据分p序号找到对应的视频信息
        const matchedPageInfo = pageInfoResArr.find((res) => res?.data?.page === p)?.data?.info

        // id 相同时，bandwidth 不同
        // 先根据 bandwidth 降序
        // 保证下载的是高码率的
        const videos = sortBy(matchedPageInfo?.dash?.video || [], ['bandwidth'])
        const matchedVideo = getSimilarQualityVideo(quality, videos)
        const videoDownloadUrl = matchedVideo?.baseUrl || ''

        const audios = sortBy(matchedPageInfo?.dash?.audio || [], ['bandwidth'])
        const audioDownloadUrl = first(audios)?.baseUrl || ''

        const params: AppScope.DownloadBVParams = {
          mid: props.videoInfo.owner.mid.toString(),
          bvid: props.videoInfo.bvid,
          page: p,
          quality,
          qualityName: qualityOptions.find((v) => v.value === matchedVideo?.id)?.label || '',
          videoDownloadUrl,
          audioDownloadUrl,
          coverImageUrl: props.videoInfo.pic,
          videoInfo: pickVideoInfo(props.videoInfo),
        }

        return params
      })

      taskParamsArr
        .filter((v) => Boolean(v.videoDownloadUrl && v.audioDownloadUrl))
        .forEach((v) => {
          downloadBV(v, rootDirPath).then(() => {
            queryClient.invalidateQueries({ queryKey: ['video'] })
          })
        })
    },

    onSuccess() {
      onCancel()
      props.onOk?.()
    },
  })

  return (
    <>
      {typeof props.trigger === 'function' ? props.trigger(beforeOpen) : <Button onClick={beforeOpen}>下载</Button>}

      <Modal width='420px' open={open} onCancel={onCancel} footer={null}>
        <section className='space-y-4'>
          <h2 className='mb-8 text-center text-lg font-bold'>下载视频</h2>

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

          <div className='mb-4 h-60 space-y-2 overflow-auto'>
            <ul className='space-y-2'>
              {pages.map((v) => (
                <li
                  key={v.value}
                  className={cls(
                    'cursor-pointer rounded-md border px-2 py-1 transition-all select-none',
                    isSelected(v.value)
                      ? 'border-primary bg-primary/10'
                      : 'hover:bg-primary/10 border-transparent bg-gray-100',
                  )}
                  onClick={() => toggle(v.value)}
                >
                  {v.label}
                </li>
              ))}
            </ul>
          </div>

          <Flex gap={16}>
            <Button block onClick={onCancel}>
              取消
            </Button>

            <Button
              block
              type='primary'
              disabled={!quality || !selectedPages.length}
              loading={isPending}
              onClick={() => onOk()}
            >
              开始下载({selectedPages.length})
            </Button>
          </Flex>
        </section>
      </Modal>
    </>
  )
}

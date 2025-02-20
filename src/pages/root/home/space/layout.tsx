/**
 * @name SpaceLayout
 * @description
 * @author darcrand
 */

import OwnerListItem from '@/components/OwnerListItem'
import ResizeDivider from '@/components/ResizeDivider'
import { ECommon } from '@/constants/common'
import { useAllBVData } from '@/hooks/useAllBVData'
import { useRootDirPath } from '@/hooks/useRootDirPath'
import { useAdideWidth } from '@/stores/aside-width'
import { useMemo } from 'react'
import SpacePage from './page'

export default function SpaceLayout() {
  const [leftWidth] = useAdideWidth()
  const rootDirPath = useRootDirPath()
  const { data } = useAllBVData(rootDirPath)
  const allUps = useMemo(() => {
    return [{ mid: ECommon.AllMid as string }].concat(
      data?.ups.map((v) => ({ mid: v.mid })) || [],
    )
  }, [data])

  return (
    <>
      <section className='flex h-full flex-1'>
        <aside
          className='g-custom-scrollbar flex-shrink-0 overflow-y-auto'
          style={{ width: leftWidth }}
        >
          {allUps.map((v) => (
            <OwnerListItem key={v.mid} mid={v.mid} />
          ))}
        </aside>

        <ResizeDivider />

        <main className='g-custom-scrollbar flex-1 overflow-y-scroll'>
          <SpacePage />
        </main>
      </section>
    </>
  )
}

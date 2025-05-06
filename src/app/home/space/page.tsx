/**
 * @name SpacePage
 * @description
 * @author darcrand
 */

import OwnerListItem from '@/components/OwnerListItem'
import ResizeDivider from '@/components/ResizeDivider'
import SpaceMain from '@/components/SpaceMain'
import { ECommon } from '@/const/enums'
import { db } from '@/db'
import { useAdideWidth } from '@/stores/aside-width'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'

export default function SpacePage() {
  const list = useLiveQuery(() => db.users.toArray())
  const allUps = useMemo(
    () => [
      { id: ECommon.AllMid, mid: ECommon.AllMid, name: 'All', avatar: '' },
      ...(list || []),
    ],
    [list],
  )

  const [leftWidth] = useAdideWidth()

  return (
    <>
      <section className='flex h-full flex-1'>
        <aside
          className='g-custom-scrollbar flex-shrink-0 overflow-y-auto'
          style={{ width: leftWidth }}
        >
          {allUps.map((v) => (
            <OwnerListItem key={v.mid} data={v} />
          ))}
        </aside>

        <ResizeDivider />

        <main className='g-custom-scrollbar flex-1 overflow-y-scroll'>
          <SpaceMain />
        </main>
      </section>
    </>
  )
}

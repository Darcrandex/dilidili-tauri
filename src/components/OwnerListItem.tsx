/**
 * @name OwnerListItem
 * @description 左侧-用户列表项
 */

import { ECommon } from '@/const/enums'
import { useVideoQuery } from '@/stores/video-query'
import { cls } from '@/utils/cls'
import { Avatar } from 'antd'
import ImageView from './ImageView'

export default function OwnerListItem(props: { data: AppScope.UserItem }) {
  const [query, setQuery] = useVideoQuery()
  const isActive = query.mid === props.data.mid
  const isAll = props.data.mid === ECommon.AllMid

  return (
    <>
      <div
        className={cls(
          'group/owner m-2 flex cursor-pointer items-center rounded-md p-2 transition-all select-none',
          isActive ? 'text-primary !bg-slate-100' : '!text-gray-500 hover:!bg-slate-50',
        )}
        onClick={() => setQuery({ mid: props.data.mid })}
      >
        {isAll ? (
          <Avatar className='h-8 w-8 flex-shrink-0'>All</Avatar>
        ) : (
          <ImageView src={props.data.avatar} className='h-8 w-8 flex-shrink-0 rounded-full bg-gray-100' />
        )}

        <span className='group-hover/owner:text-primary ml-2 truncate text-sm'>{props.data.name}</span>
      </div>
    </>
  )
}

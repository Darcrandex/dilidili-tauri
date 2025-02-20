/**
 * @name OwnerListItem
 * @description 列表中单个UP主的信息
 * @author darcrand
 */

import { ECommon } from '@/constants/common'
import { userService } from '@/services/user'
import { useVideoQuery } from '@/stores/video-query'
import ImageView from '@/ui/ImageView'
import { cls } from '@/utils/cls'
import { useQuery } from '@tanstack/react-query'
import { Avatar } from 'antd'

export type OwnerListItemProps = { mid: string }

export default function OwnerListItem(props: OwnerListItemProps) {
  const [query, setQuery] = useVideoQuery()
  const isActive = query.mid === props.mid
  const isAll = props.mid === ECommon.AllMid

  const { data } = useQuery({
    enabled: !!props.mid && props.mid !== ECommon.AllMid,
    queryKey: ['up', 'info', props.mid],
    queryFn: () => userService.getById(props.mid),
  })

  return (
    <>
      <div
        className={cls(
          'group/owner m-2 flex cursor-pointer items-center rounded-md p-2 transition-all select-none',
          isActive
            ? 'text-primary !bg-slate-100'
            : '!text-gray-500 hover:!bg-slate-50',
        )}
        onClick={() => setQuery({ mid: props.mid })}
      >
        {isAll ? (
          <Avatar className='h-8 w-8 flex-shrink-0'>All</Avatar>
        ) : (
          <ImageView
            src={data?.card?.face}
            className='h-8 w-8 flex-shrink-0 rounded-full bg-gray-100'
          />
        )}

        <span className='group-hover/owner:text-primary ml-2 truncate text-sm'>
          {isAll ? '全部UP' : data?.card?.name}
        </span>
      </div>
    </>
  )
}

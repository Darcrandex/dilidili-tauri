/**
 * @name OwnerListItem
 * @description 列表中单个UP主的信息
 * @author darcrand
 */

import { userService } from '@/services/user'
import UImage from '@/ui/UImage'
import { cls } from '@/utils/cls'
import { useQuery } from '@tanstack/react-query'
import { NavLink } from 'react-router-dom'

export type OwnerListItemProps = { mid: string; path: string }

export default function OwnerListItem(props: OwnerListItemProps) {
  const { data } = useQuery({
    queryKey: ['up', 'info', props.mid],
    queryFn: () => userService.getById(props.mid)
  })

  return (
    <>
      <NavLink
        className={({ isActive }) =>
          cls(
            'm-2 flex items-center space-x-2 rounded-md p-2 transition-all',
            isActive ? '!bg-slate-100 text-primary' : '!text-gray-500 hover:!bg-slate-50'
          )
        }
        to={props.mid}
      >
        <UImage src={data?.card?.face} className='h-8 w-8 flex-shrink-0 rounded-full' />
        <span className='truncate text-sm'>{data?.card?.name}</span>
      </NavLink>
    </>
  )
}

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
            'flex items-center space-x-2 m-2 p-2 rounded-md transition-all',
            isActive ? 'bg-slate-100' : 'hover:bg-slate-50'
          )
        }
        to={props.mid}
      >
        <UImage src={data?.card?.face} className='w-8 h-8 rounded-full' />
        <span className='truncate text-sm'>{data?.card?.name}</span>
      </NavLink>
    </>
  )
}

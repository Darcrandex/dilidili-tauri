/**
 * @name AsideMenus
 * @description
 * @author darcrand
 */

import { cls } from '@/utils/cls'
import { HomeOutlined, SettingOutlined, SmileOutlined } from '@ant-design/icons'
import { NavLink } from 'react-router-dom'

const menus = [
  { to: '/home', title: '首页', icon: <HomeOutlined /> },
  { to: '/mine', title: '我的', icon: <SmileOutlined /> },
  { to: '/settings', title: '设置', icon: <SettingOutlined /> }
]

export default function AsideMenus() {
  return (
    <>
      <aside className='border-r'>
        <nav className='mt-4'>
          {menus.map((v) => (
            <NavLink
              key={v.to}
              to={v.to}
              replace
              className={({ isActive }) =>
                cls(
                  'flex flex-col items-center justify-center transition-all text-2xl px-6 py-4',
                  isActive ? 'text-primary' : 'text-gray-500 hover:text-primary/50'
                )
              }
            >
              {v.icon}
              <span className='mt-2 text-xs'>{v.title}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

/**
 * @name AsideMenus
 * @description
 * @author darcrand
 */

import { cls } from '@/utils/cls'
import { HomeOutlined, InfoCircleOutlined, SettingOutlined, SmileOutlined } from '@ant-design/icons'
import { NavLink } from 'react-router-dom'

const menus = [
  { to: '/home', title: '首页', icon: <HomeOutlined /> },
  { to: '/mine', title: '我的', icon: <SmileOutlined /> },
  { to: '/settings', title: '设置', icon: <SettingOutlined /> },
  { to: '/about', title: '关于', icon: <InfoCircleOutlined /> }
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
                  'flex flex-col items-center justify-center px-6 py-4 text-2xl transition-all',
                  isActive ? 'text-primary' : '!text-gray-500 hover:!text-primary/50'
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

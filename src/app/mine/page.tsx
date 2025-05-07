/**
 * @name Mine
 * @description
 * @author darcrand
 */

import ImageView from '@/components/ImageView'
import LoginModal from '@/components/LoginModal'
import { userService } from '@/services/user'
import { useSession } from '@/stores/session'
import { LogoutOutlined } from '@ant-design/icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from 'antd'
import { isNil } from 'lodash-es'

export default function MinePage() {
  const [session, setSession] = useSession()
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', session],
    enabled: !!session,
    queryFn: () => userService.profile(),
    retry: false,
  })

  const onLogout = () => {
    setSession('')
    queryClient.invalidateQueries()
  }

  const isLogin = !isNil(profile)

  return (
    <>
      {isLoading && <p className='my-10 text-center text-slate-400'>loading...</p>}

      {isLogin ? (
        <>
          <div className='mx-auto max-w-7xl p-4'>
            <section className='flex items-center rounded-lg bg-slate-50 p-4'>
              <ImageView src={profile?.face} className='h-20 w-20 rounded-full' />

              <div className='ml-4'>
                <p className='space-x-2'>
                  <span className='text-xl font-bold'>{profile?.uname}</span>
                  <sup className='inline-block bg-orange-500 px-1 text-xs text-white'>
                    lv.{profile?.level_info.current_level}
                  </sup>
                  <sup className='bg-primary rounded-full px-2 py-1 text-xs text-white'>{profile.vip_label.text}</sup>
                </p>
                <p className='mt-2 text-sm text-gray-500'>MID:{profile?.mid}</p>
              </div>

              <Button className='ml-auto' icon={<LogoutOutlined />} onClick={onLogout}>
                退出登录
              </Button>
            </section>
          </div>
        </>
      ) : null}

      <LoginModal
        renderTrigger={(onOpen) =>
          !isLoading &&
          !isLogin && (
            <section className='m-10 space-y-4 text-center'>
              <p>还没有登录</p>
              <p>
                <Button type='primary' onClick={onOpen}>
                  登录
                </Button>
              </p>
            </section>
          )
        }
      />
    </>
  )
}

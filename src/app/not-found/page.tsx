/**
 * @name NotFound
 * @description
 * @author darcrand
 */

import { Button } from 'antd'
import { useNavigate } from 'react-router'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <>
      <div className='flex min-h-screen flex-col items-center justify-center'>
        <div className='text-9xl font-bold tracking-widest text-white drop-shadow-lg'>404</div>

        <h1 className='mt-4 mb-8 text-xl font-bold text-gray-400 uppercase'>Page Not Found</h1>

        <Button size='large' type='link' onClick={() => navigate('/')}>
          返回首页
        </Button>
      </div>
    </>
  )
}

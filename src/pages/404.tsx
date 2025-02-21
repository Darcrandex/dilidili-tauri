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
      <h1 className='mt-[20vh] text-center'>
        <span className='mr-4 text-2xl font-extrabold'>404</span>
        <Button type='link' onClick={() => navigate('/')}>
          返回首页
        </Button>
      </h1>
    </>
  )
}

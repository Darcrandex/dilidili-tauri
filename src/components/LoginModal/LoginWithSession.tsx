/**
 * @name LoginWithSession
 * @description
 * @author darcrand
 */

import { useSession } from '@/stores/session'
import { Button, Input } from 'antd'
import { useState } from 'react'

export default function LoginWithSession(props: { onSuccess?: () => void }) {
  const [, setSession] = useSession()
  const [value, setValue] = useState('')
  const onOk = async () => {
    setSession(value)
    props.onSuccess?.()
  }

  return (
    <>
      <Input.TextArea
        placeholder='从浏览器调试工具中复制 SESSDATA 并粘贴到这里'
        rows={4}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <Button type='primary' className='mt-4' onClick={onOk}>
        确定
      </Button>
    </>
  )
}

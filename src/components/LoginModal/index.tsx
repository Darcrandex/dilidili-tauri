/**
 * @name LoginModal
 * @description
 * @author darcrand
 */

import { useQueryClient } from '@tanstack/react-query'
import { Button, Modal, Tabs } from 'antd'
import { ReactNode, useState } from 'react'
import LoginWithCode from './LoginWithCode'
import LoginWithSession from './LoginWithSession'

export type LoginModalProps = {
  renderTrigger?: (onOpen: () => void) => ReactNode
  onSuccess?: () => void
}

export default function LoginModal(props: LoginModalProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const onSuccess = () => {
    setOpen(false)
    queryClient.invalidateQueries()
    props.onSuccess?.()
  }

  return (
    <>
      {typeof props.renderTrigger === 'function' ? (
        props.renderTrigger(() => setOpen(true))
      ) : (
        <Button onClick={() => setOpen(true)}>登录</Button>
      )}

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnClose
        width={400}
      >
        <Tabs
          defaultActiveKey='1'
          centered
          items={[
            {
              key: '1',
              label: '扫描登录',
              children: <LoginWithCode onSuccess={onSuccess} />,
            },
            {
              key: '2',
              label: '手动登录',
              children: <LoginWithSession onSuccess={onSuccess} />,
            },
          ]}
        />
      </Modal>
    </>
  )
}

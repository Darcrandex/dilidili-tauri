/**
 * @name Tasks
 * @description
 * @author darcrand
 */

import TaskItem from '@/components/TaskItem'
import { db } from '@/db'
import { taskService } from '@/services/task'
import UEmpty from '@/ui/UEmpty'
import { ClearOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'

export default function Tasks() {
  const taskList = useLiveQuery(() => db.tasks.orderBy('createdAt').reverse().toArray())
  const [open, setOpen] = useState(false)

  const onRemoveAll = async () => {
    await taskService.clear()
    setOpen(false)
  }

  return (
    <>
      <div className='mx-auto max-w-xl p-4'>
        <section className='space-y-4'>
          <div className='space-x-4'>
            <Button icon={<ClearOutlined />} disabled={taskList?.length === 0} onClick={() => setOpen(true)}>
              清空下载任务
            </Button>
          </div>

          <ul className='space-y-8'>
            {taskList?.map((v) => (
              <li key={v.id}>
                <TaskItem task={v} />
              </li>
            ))}
          </ul>

          {taskList?.length === 0 && <UEmpty>没有任务</UEmpty>}
        </section>
      </div>

      <Modal title='提示' open={open} onOk={onRemoveAll} onCancel={() => setOpen(false)}>
        <p>此操作不会删除已下载的文件</p>
        <p>确定要清空下载任务吗?</p>
      </Modal>
    </>
  )
}

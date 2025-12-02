import { modal } from '@/components/GlobalAntdMessage'
import Nothing from '@/components/Nothing'
import TaskItem from '@/components/TaskItem'
import { ETaskStatus } from '@/const/enums'
import { db } from '@/db'
import { taskService } from '@/services/task'
import { ClearOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useLiveQuery } from 'dexie-react-hooks'

export default function TasksPage() {
  const taskList = useLiveQuery(() => db.tasks.orderBy('createdAt').reverse().toArray())

  const onRemoveAll = async () => {
    const hasPending = taskList?.some((v) => v.status === ETaskStatus.Downloading || v.status === ETaskStatus.Merging)

    if (hasPending) {
      modal.info({
        title: '提示',
        content: '有正在下载的任务，请稍等',
      })
      return
    }

    modal.confirm({
      title: '提示',
      content: '此操作不会删除已下载的文件，确定要清空下载任务吗?',
      onOk: async () => {
        await taskService.clear()
      },
    })
  }

  return (
    <>
      <section className='g-custom-scrollbar mx-auto h-full max-w-7xl overflow-auto p-4'>
        <section className='space-y-4'>
          <div className='space-x-4'>
            <Button icon={<ClearOutlined />} hidden={!taskList || taskList?.length === 0} onClick={onRemoveAll}>
              清空下载任务({taskList?.length || 0})
            </Button>
          </div>

          <ul className='space-y-8'>
            {taskList?.map((v) => (
              <li key={v.id}>
                <TaskItem task={v} />
              </li>
            ))}
          </ul>

          {taskList?.length === 0 && <Nothing>没有任务</Nothing>}
        </section>
      </section>
    </>
  )
}

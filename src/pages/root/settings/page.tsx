/**
 * @name Settings
 * @description
 * @author darcrand
 */

import { taskService } from '@/services/task'
import { useSession } from '@/stores/session'
import { useSettings } from '@/stores/settings'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { videoDir } from '@tauri-apps/api/path'
import { open } from '@tauri-apps/plugin-dialog'
import { open as openShell } from '@tauri-apps/plugin-shell'
import { App, Button, Form, Input } from 'antd'
import * as R from 'ramda'

async function clearAllIndexedDB() {
  try {
    // 获取所有已存在的 IndexedDB 数据库名称
    const databaseNames = await indexedDB.databases()
    // 遍历每个数据库名称
    for (const { name } of databaseNames) {
      if (name) {
        // 打开一个删除数据库的请求
        const deleteRequest = indexedDB.deleteDatabase(name)
        // 处理删除成功的情况
        deleteRequest.onsuccess = function () {
          console.log(`Database ${name} deleted successfully.`)
        }
        // 处理删除失败的情况
        deleteRequest.onerror = function () {
          console.error(`Error deleting database ${name}:`, deleteRequest.error)
        }
      }
    }
  } catch (error) {
    console.error('Error getting database names:', error)
  }
}

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [, setSession] = useSession()
  const [settings, setSettings] = useSettings()
  const { data: videoDirPath } = useQuery({
    queryKey: ['videoDir'],
    queryFn: async () => await videoDir(),
  })
  const rootDirPath = settings.rootDirPath || videoDirPath

  const onSelectRootPath = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: rootDirPath,
    })

    if (R.is(String, selected) && R.isNotEmpty(selected)) {
      setSettings((prev) => ({ ...prev, rootDirPath: selected }))
      queryClient.invalidateQueries({ queryKey: [] })
    }
  }

  const openRootDir = async () => {
    if (rootDirPath) {
      await openShell(rootDirPath)
    }
  }

  const { message } = App.useApp()
  const clearCache = async () => {
    localStorage.clear()
    taskService.clear()

    setSession('')
    setSettings((prev) => ({ ...prev, rootDirPath: '' }))

    queryClient.invalidateQueries({ queryKey: [] })
    message.success('缓存已清空')
  }

  return (
    <>
      <div className='mx-auto max-w-7xl p-4'>
        <Form layout='vertical'>
          <Form.Item label='视频根目录'>
            <div className='flex gap-2'>
              <Input value={rootDirPath} readOnly />
              <Button onClick={() => onSelectRootPath()}>更改目录</Button>
            </div>
            <Button className='mt-2' type='link' onClick={openRootDir}>
              查看当前目录
            </Button>
          </Form.Item>
        </Form>

        <Form layout='vertical'>
          <Form.Item label='缓存操作'>
            <Button onClick={clearCache}>清空缓存</Button>
          </Form.Item>
        </Form>
      </div>
    </>
  )
}

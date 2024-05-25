/**
 * @name Settings
 * @description
 * @author darcrand
 */

import { taskService } from '@/services/task'
import { useSession } from '@/stores/use-session'
import { useSettings } from '@/stores/use-settings'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { open } from '@tauri-apps/api/dialog'
import { videoDir } from '@tauri-apps/api/path'
import { open as openShell } from '@tauri-apps/api/shell'
import { Button, Form, Input, message } from 'antd'
import * as R from 'ramda'

export default function Settings() {
  const queryClient = useQueryClient()
  const [, setSession] = useSession()
  const [settings, setSettings] = useSettings()
  const { data: videoDirPath } = useQuery({ queryKey: ['videoDir'], queryFn: async () => await videoDir() })
  const rootDirPath = settings.rootDirPath || videoDirPath

  const onSelectRootPath = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: rootDirPath
    })

    if (R.is(String, selected) && R.isNotEmpty(selected)) {
      setSettings((prev) => ({ ...prev, rootDirPath: selected }))
    }
  }

  const openRootDir = async () => {
    if (rootDirPath) {
      await openShell(rootDirPath)
    }
  }

  const [messageApi, contextHolder] = message.useMessage()
  const clearCache = async () => {
    setSession('')
    taskService.clear()
    queryClient.invalidateQueries()
    messageApi.success('缓存已清空')
  }

  return (
    <>
      {contextHolder}

      <div className='max-w-xl mx-auto p-4'>
        <Form layout='vertical'>
          <Form.Item label='视频根目录'>
            <div className='flex space-x-2'>
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

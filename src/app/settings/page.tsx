/**
 * @name Settings
 * @description
 * @author darcrand
 */

import { message, modal } from '@/components/GlobalAntdMessage'
import { useRootDirPath } from '@/hooks/useRootDirPath'
import { fsService } from '@/services/fs'
import { mediaService } from '@/services/media'
import { taskService } from '@/services/task'
import { userService } from '@/services/user'
import { useSession } from '@/stores/session'
import { useSettings } from '@/stores/settings'
import { toDbData } from '@/utils/to-db-data'
import { useQueryClient } from '@tanstack/react-query'
import { open } from '@tauri-apps/plugin-dialog'
import { open as openShell } from '@tauri-apps/plugin-shell'
import { Button, Form, Input, Space } from 'antd'
import { isEmpty, isString } from 'lodash-es'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [, setSession] = useSession()
  const [, setSettings] = useSettings()

  const rootDirPath = useRootDirPath()

  const onSelectRootPath = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: rootDirPath,
    })

    if (isString(selected) && !isEmpty(selected)) {
      setSettings((prev) => ({ ...prev, rootDirPath: selected }))
      queryClient.invalidateQueries({ queryKey: [] })
    }
  }

  const openRootDir = async () => {
    if (rootDirPath) {
      await openShell(rootDirPath)
    }
  }

  const clearCache = async () => {
    localStorage.clear()
    taskService.clear()

    setSession('')
    setSettings((prev) => ({ ...prev, rootDirPath: '' }))

    queryClient.invalidateQueries({ queryKey: [] })
    message.success('缓存已清空')
  }

  const clearDB = async () => {
    modal.confirm({
      title: '清空数据库',
      content: (
        <div>
          <p>将清空数据库, 是否继续?</p>
          <p>注意: 该操作不可逆</p>
        </div>
      ),
      onOk: async () => {
        await mediaService.clear()
        await taskService.clear()
        await userService.clear()

        message.success('数据库已清空')
        queryClient.invalidateQueries({ queryKey: [] })
      },
    })
  }

  const getFileDirData = async () => {
    if (!rootDirPath) return

    modal.confirm({
      title: '导入',
      content: (
        <div>
          <p>将尝试从 "{rootDirPath}" 解析文件, 并更新到数据库</p>
          <p>
            注意: 该操作会先清空当前数据库,
            如果已经有视频文件,请将当前的视频文件合并到 "{rootDirPath}"
            目录下再操作
          </p>
        </div>
      ),
      onOk: async () => {
        const res = await fsService.getAllBVDataAsync(rootDirPath)
        const data = await toDbData(res.bvs)

        // 先清空数据库
        await mediaService.clear()
        await taskService.clear()
        await userService.clear()

        // 导入数据
        await mediaService.batchCreate(data.videoArr)
        await userService.batchCreate(data.userArr)

        message.success('导入完成')
        queryClient.invalidateQueries({ queryKey: [] })
      },
    })
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

          <Form.Item label='缓存操作'>
            <Button onClick={clearCache}>清空缓存</Button>
          </Form.Item>

          <Form.Item label='数据库'>
            <Space>
              <Button onClick={clearDB}>清空数据库</Button>
              <Button onClick={getFileDirData}>从文件夹导入</Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </>
  )
}

/**
 * @name About
 * @description
 * @author darcrand
 */

import { useQuery } from '@tanstack/react-query'
import { getTauriVersion, getVersion } from '@tauri-apps/api/app'
import { checkUpdate } from '@tauri-apps/api/updater'
import { Descriptions, type DescriptionsProps } from 'antd'

export default function About() {
  const { data: version } = useQuery({ queryKey: ['app-version'], queryFn: getVersion })
  const { data: tauriVersion } = useQuery({ queryKey: ['tauri-version'], queryFn: getTauriVersion })

  const onCheck = async () => {
    const res = await checkUpdate()
    console.log(res)
  }

  const items: DescriptionsProps['items'] = [
    {
      key: 'author',
      label: '作者',
      children: (
        <a href='https://github.com/Darcrandex' target='_blank' rel='noreferrer'>
          darcrand
        </a>
      )
    },
    {
      key: 'repo',
      label: 'GitHub Repo',
      children: (
        <a href='https://github.com/Darcrandex/dilidili-tauri' target='_blank' rel='noreferrer'>
          dilidili-tauri
        </a>
      )
    },
    {
      key: 'version',
      label: '版本',
      children: (
        <a href='https://github.com/Darcrandex/dilidili-tauri/releases' target='_blank' rel='noreferrer'>
          {version}
        </a>
      )
    },
    { key: 'tauri', label: 'Tauri', children: tauriVersion }
  ]

  return (
    <>
      <div className='max-w-xl mx-auto p-4'>
        <Descriptions title='dilidili' items={items} />
      </div>
    </>
  )
}

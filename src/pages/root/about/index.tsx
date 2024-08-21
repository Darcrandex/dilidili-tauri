/**
 * @name About
 * @description
 * @author darcrand
 */

import { OWNER, REPOSITORY } from '@/constant/common'
import { useLatestVersion } from '@/queries/useLatestVersion'
import { useQuery } from '@tanstack/react-query'
import { getTauriVersion } from '@tauri-apps/api/app'
import { Descriptions, Space, type DescriptionsProps } from 'antd'

export default function About() {
  const { data: tauriVersion } = useQuery({ queryKey: ['tauri-version'], queryFn: getTauriVersion })
  const { version, latestVersion, hasUpdate } = useLatestVersion()

  const items: DescriptionsProps['items'] = [
    {
      key: 'author',
      label: '作者',
      children: (
        <a href={`https://github.com/${OWNER}`} target='_blank' rel='noreferrer'>
          {OWNER}
        </a>
      )
    },
    {
      key: 'repo',
      label: 'GitHub Repo',
      children: (
        <a href={`https://github.com/${OWNER}/${REPOSITORY}`} target='_blank' rel='noreferrer'>
          dilidili-tauri
        </a>
      )
    },
    {
      key: 'version',
      label: '版本',
      children: (
        <Space>
          <span>{version}</span>
          {hasUpdate && (
            <a href={`https://github.com/${OWNER}/${REPOSITORY}/releases/latest`} target='_blank' rel='noreferrer'>
              最新: {latestVersion}
            </a>
          )}
        </Space>
      )
    },
    { key: 'tauri', label: 'Tauri', children: tauriVersion }
  ]

  return (
    <>
      <div className='mx-auto max-w-xl p-4'>
        <Descriptions title='dilidili' items={items} />
      </div>
    </>
  )
}

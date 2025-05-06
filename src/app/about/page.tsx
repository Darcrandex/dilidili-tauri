/**
 * @name About
 * @description 关于页面
 */

import { useLatestVersion } from '@/hooks/useLatestVersion'
import { useQuery } from '@tanstack/react-query'
import { getTauriVersion } from '@tauri-apps/api/app'
import { Descriptions, Divider, Space, type DescriptionsProps } from 'antd'

const OWNER = import.meta.env.VITE_APP_GIT_OWNER
const REPOSITORY = import.meta.env.VITE_APP_GIT_REPO

export default function AboutPage() {
  const { data: tauriVersion } = useQuery({
    queryKey: ['tauri-version'],
    queryFn: getTauriVersion,
  })
  const { version, latestVersion, hasUpdate } = useLatestVersion()

  const items: DescriptionsProps['items'] = [
    {
      key: 'author',
      label: '作者',
      children: (
        <a
          href={`https://github.com/${OWNER}`}
          target='_blank'
          rel='noreferrer'
        >
          {OWNER}
        </a>
      ),
    },
    {
      key: 'repo',
      label: 'GitHub',
      children: (
        <a
          href={`https://github.com/${OWNER}/${REPOSITORY}`}
          target='_blank'
          rel='noreferrer'
        >
          dilidili-tauri
        </a>
      ),
    },
    {
      key: 'version',
      label: '版本',
      children: (
        <Space>
          <span>{version}</span>
          {hasUpdate && (
            <a
              href={`https://github.com/${OWNER}/${REPOSITORY}/releases/latest`}
              target='_blank'
              rel='noreferrer'
            >
              最新: {latestVersion}
            </a>
          )}
        </Space>
      ),
    },
    { key: 'tauri', label: 'Tauri', children: tauriVersion },
  ]

  return (
    <>
      <div className='mx-auto max-w-7xl p-4'>
        <Descriptions title='dilidili' items={items} />

        <Divider />
        <p className='text-center text-slate-400'>buy me a coffee</p>
        <img
          src='/images/pay-by-wechat.png'
          alt='pay'
          className='mx-auto block h-auto w-48'
        />
      </div>
    </>
  )
}

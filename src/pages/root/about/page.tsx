import { useLatestVersion } from '@/hooks/useLatestVersion'
import { useQuery } from '@tanstack/react-query'
import { getTauriVersion } from '@tauri-apps/api/app'
import { Descriptions, Space, type DescriptionsProps } from 'antd'

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
      label: 'GitHub Repo',
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
      </div>
    </>
  )
}

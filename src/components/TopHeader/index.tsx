/**
 * @name TopHeader
 * @description
 * @author darcrand
 */

import logoImage from '@/assets/logos/dilidili-logo1@0.25x.png'
import { cls } from '@/utils/cls'
import { PropsWithChildren } from 'react'

export type TopHeaderProps = PropsWithChildren<{
  className?: string
  showLogo?: boolean
}>

export default function TopHeader(props: TopHeaderProps) {
  return (
    <>
      <header className={cls('relative flex items-center border-b select-none', props.className)}>
        {props.showLogo !== false && <img src={logoImage} alt='dilidili' className='w-auto h-8 mx-4 my-2' />}

        <div>{props.children}</div>
      </header>
    </>
  )
}

import { cls } from '@/utils/cls'
import { PropsWithChildren } from 'react'

export type NothingProps = PropsWithChildren<{
  className?: string
  style?: React.CSSProperties
}>

export default function Nothing(props: NothingProps) {
  return (
    <>
      <div
        className={cls(
          'my-10 space-y-2 text-center text-gray-400',
          props.className,
        )}
        style={props.style}
      >
        <p>╮（﹀＿﹀）╭</p>
        <p>{props.children}</p>
      </div>
    </>
  )
}

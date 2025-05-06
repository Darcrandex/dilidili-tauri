/**
 * @name GlobalAntdMessage
 * @description 在普通 js 文件中使用 antd message
 * @description https://ant-design.antgroup.com/components/app-cn#%E5%85%A8%E5%B1%80%E5%9C%BA%E6%99%AFredux-%E5%9C%BA%E6%99%AF
 * @author darcrand
 */

import { App as AntdApp } from 'antd'
import type { MessageInstance } from 'antd/es/message/interface'
import type { ModalStaticFunctions } from 'antd/es/modal/confirm'
import type { NotificationInstance } from 'antd/es/notification/interface'

let message: MessageInstance
let notification: NotificationInstance
let modal: Omit<ModalStaticFunctions, 'warn'>

// 在非 react 组件的 js 文件中导入并使用
export { message, modal, notification }

// 在根组件在挂载该空组件
export default function GlobalAntdMessage() {
  const staticFunction = AntdApp.useApp()
  message = staticFunction.message
  modal = staticFunction.modal
  notification = staticFunction.notification
  return null
}

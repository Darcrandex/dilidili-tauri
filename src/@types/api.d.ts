// 定义接口
// 不要使用 import 导入类型

declare namespace API {
  type ResponseSchema<T = unknown> = {
    code: number
    msg: string
    data: T
  }

  type TopicListItem = {
    id: string
    title: string
  }
}

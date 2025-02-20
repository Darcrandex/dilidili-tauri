import { ETaskStatus } from '@/constants/common'
import { db } from '@/db'
import { uuid } from '@/utils/common'

export const taskService = {
  all() {
    return db.tasks.toArray()
  },

  one(id: string) {
    return db.tasks.get(id)
  },

  create(params: AppScope.DownloadBVParams) {
    return db.tasks.add({
      id: uuid(),
      params,
      status: ETaskStatus.Ready,
      createdAt: Date.now(),
    })
  },

  update(id: string, dto: Partial<Omit<AppScope.DownloadTask, 'id'>>) {
    return db.tasks.update(id, dto)
  },

  remove(id: string) {
    return db.tasks.delete(id)
  },

  clear() {
    // 删除旧版本的数据库
    window.indexedDB.deleteDatabase('myDatabase')

    return db.tasks.clear()
  },
}

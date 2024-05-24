import { db } from '@/db'
import { ETaskStatus } from '@/enum/common'
import { DownloadBVParams, DownloadTask } from '@/types/global'
import { uuid } from '@/utils/common'

export const taskService = {
  all() {
    return db.tasks.toArray()
  },

  one(id: string) {
    return db.tasks.get(id)
  },

  create(params: DownloadBVParams) {
    return db.tasks.add({
      id: uuid(),
      params,
      status: ETaskStatus.Ready,
      createdAt: Date.now()
    })
  },

  update(id: string, dto: Partial<Omit<DownloadTask, 'id'>>) {
    return db.tasks.update(id, dto)
  },

  remove(id: string) {
    return db.tasks.delete(id)
  },

  clear() {
    return db.tasks.clear()
  }
}

import { db } from '@/db'

export const taskService = {
  async create(data: Omit<AppScope.TaskItem, 'createdAt' | 'updatedAt'>) {
    await db.tasks.add({
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    return { success: true, data: data.id }
  },

  async update(id: string, data: Partial<AppScope.TaskItem>) {
    return db.tasks.update(id, { ...data, updatedAt: Date.now() })
  },

  async remove(id: string) {
    return db.tasks.delete(id)
  },

  async batchRemove(ids: string[]) {
    return db.tasks.bulkDelete(ids)
  },

  async all() {
    return db.tasks.toArray()
  },

  async clear() {
    return db.tasks.clear()
  },
}

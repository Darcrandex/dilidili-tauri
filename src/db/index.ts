import type { DownloadTask } from '@/types/global'
import Dexie, { Table } from 'dexie'

export class MySubClassedDexie extends Dexie {
  tasks!: Table<DownloadTask, string>

  constructor() {
    super('myDatabase')
    this.version(1).stores({
      tasks: 'id, createdAt, status, params'
    })
  }
}

export const db = new MySubClassedDexie()

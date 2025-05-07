import { EIndexDB } from '@/const/enums'
import Dexie, { Table } from 'dexie'

export class MyDexie extends Dexie {
  users!: Table<AppScope.UserItem, string>
  tasks!: Table<AppScope.TaskItem, string>
  videos!: Table<AppScope.VideoItem, string>

  constructor() {
    super(EIndexDB.Name)
    this.version(EIndexDB.Version).stores({
      tasks: 'id, title, createdAt, updatedAt',
      users: 'id, mid, name, avatar, createdAt, updatedAt',
      videos: 'id, mid, ownerName, bvid, page, quality, qualityName, title,  duration, pubdate, createdAt, updatedAt',
    })
  }
}

export const db = new MyDexie()

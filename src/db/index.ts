import Dexie, { Table } from 'dexie'

export class MySubClassedDexie extends Dexie {
  tasks!: Table<AppScope.DownloadTask, string>

  constructor() {
    super('dilidili-tasks')
    this.version(1).stores({
      tasks: 'id, createdAt, status, params',
    })
  }
}

export const db = new MySubClassedDexie()

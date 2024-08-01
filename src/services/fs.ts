import type { BVItemFromFile, UserBaseInfoShema, VideoInfoSchema } from '@/types/global'
import { exists, readDir, readTextFile } from '@tauri-apps/api/fs'
import { join } from '@tauri-apps/api/path'
import * as R from 'ramda'

const midRegex = /^\d{3,}$/ // UP 主 mid 规则
const bvRegex = /^BV[0-9a-zA-Z]{3,}$/ // BV 视频 id 规则

export const fsService = {
  async getDirTree(rootDirPath: string) {
    const tree = await readDir(rootDirPath, { recursive: true })

    return tree
      .filter((item) => R.isNotNil(item.name) && midRegex.test(item.name))
      .map((item) => ({ ...item, children: item.children?.filter((c) => R.isNotNil(c.name) && bvRegex.test(c.name)) }))
  },

  // 获取 UP 主 ID 列表
  async getOwnerDirs(rootDirPath: string) {
    // 过滤 mid 格式的文件夹
    const midRegex = /^\d{5,}$/
    const tree = await readDir(rootDirPath, { recursive: true })

    return tree
      .filter((item) => R.isNotNil(item.name) && midRegex.test(item.name))
      .map((item) => ({ mid: item.name!, path: item.path }))
  },

  // 获取 UP 主 ID 列表
  async getOwnerIds(rootDirPath: string) {
    const tree = await readDir(rootDirPath, { recursive: true })

    return tree.filter((item) => R.isNotNil(item.name) && midRegex.test(item.name)).map((item) => item.name!)
  },

  // 获取所有的 BV
  async getBVList(rootDirPath: string) {
    if (!rootDirPath) return []

    const tree = await readDir(rootDirPath, { recursive: true })
    const bvList: BVItemFromFile[] = []

    for (const v of tree) {
      if (R.isNotNil(v.name) && midRegex.test(v.name)) {
        const mid = v.name
        if (R.is(Array, v.children)) {
          for (const c of v.children) {
            if (R.isNotNil(c.name) && bvRegex.test(c.name)) {
              const bvid = c.name
              const infoPath = await join(c.path, `${bvid}-info.json`)
              const coverPath = await join(c.path, `${bvid}-cover.jpg`)

              // 过滤没有视频或没有封面的 bv
              if (!(await exists(infoPath)) || !(await exists(coverPath))) continue

              try {
                const videoInfo: VideoInfoSchema = JSON.parse(await readTextFile(infoPath))
                bvList.push({ mid, bvid, videoInfo, path: c.path, children: c.children })
              } catch (error) {
                console.log('bv 文件夹中没有视频信息', error)
              }
            }
          }
        }
      }
    }

    return bvList
  },

  // V2
  // 整合处理所有的视频，和 UP 主信息
  // 用于全局只处理一次请求
  async getAllBVData(rootDirPath: string): Promise<{ ups: Array<UserBaseInfoShema>; bvs: Array<BVItemFromFile> }> {
    if (!rootDirPath) return { ups: [], bvs: [] }

    const tree = await readDir(rootDirPath, { recursive: true })

    // UP ID 列表
    const upBaseInfoList: Array<UserBaseInfoShema> = []
    // 所有的 BV 列表
    const bvList: BVItemFromFile[] = []

    for (const v of tree) {
      if (R.isNotNil(v.name) && midRegex.test(v.name)) {
        const mid = v.name
        upBaseInfoList.push({ mid, path: v.path })

        if (R.is(Array, v.children)) {
          for (const c of v.children) {
            if (R.isNotNil(c.name) && bvRegex.test(c.name)) {
              const bvid = c.name
              const infoPath = await join(c.path, `${bvid}-info.json`)
              const coverPath = await join(c.path, `${bvid}-cover.jpg`)

              // 过滤没有视频或没有封面的 bv
              if (!(await exists(infoPath)) || !(await exists(coverPath))) continue

              try {
                const videoInfo: VideoInfoSchema = JSON.parse(await readTextFile(infoPath))
                bvList.push({ mid, bvid, videoInfo, path: c.path, children: c.children })
              } catch (error) {
                console.log('bv 文件夹中没有视频信息', error)
              }
            }
          }
        }
      }
    }

    return { ups: upBaseInfoList, bvs: bvList }
  }
}

import type { BVItemFromFile, UserBaseInfoShema, VideoInfoSchema } from '@/types/global'
import { exists, readDir, readTextFile, type FileEntry } from '@tauri-apps/api/fs'
import { join } from '@tauri-apps/api/path'
import * as R from 'ramda'

const midRegex = /^\d{3,}$/ // UP 主 mid 规则
const bvRegex = /^BV[0-9a-zA-Z]{3,}$/ // BV 视频 id 规则

// 检查文件是否存在的函数
async function checkFilesExist(files: string[]): Promise<boolean> {
  const results = await Promise.all(files.map((file) => exists(file)))
  return results.every((result) => result)
}

// 处理单个 UP 文件夹的函数
async function processUpFolder(v: FileEntry): Promise<{ upInfo: UserBaseInfoShema; bvItems: BVItemFromFile[] }> {
  const mid = v.name || ''
  const upInfo: UserBaseInfoShema = { mid, path: v.path }
  const bvItems: BVItemFromFile[] = []

  if (R.is(Array, v.children)) {
    const validBvPromises = v.children.map(async (c: FileEntry) => {
      if (R.isNotNil(c.name) && bvRegex.test(c.name)) {
        const bvid = c.name
        const infoPath = await join(c.path, `${bvid}-info.json`)
        const coverPath = await join(c.path, `${bvid}-cover.jpg`)

        if (await checkFilesExist([infoPath, coverPath])) {
          try {
            const videoInfo: VideoInfoSchema = JSON.parse(await readTextFile(infoPath))
            return { mid, bvid, videoInfo, path: c.path, children: c.children }
          } catch (error) {
            console.log('bv 文件夹中没有视频信息', error)
            return null
          }
        }
      }
      return null
    })

    const validBvResults = await Promise.all(validBvPromises)
    bvItems.push(...(validBvResults.filter((item) => item !== null) as BVItemFromFile[]))
  }

  return { upInfo, bvItems }
}

async function getAllBVDataAsync(
  rootDirPath: string
): Promise<{ ups: Array<UserBaseInfoShema>; bvs: Array<BVItemFromFile> }> {
  if (!rootDirPath) return { ups: [], bvs: [] }

  try {
    console.time('getAllBVDataAsync')
    const tree = await readDir(rootDirPath, { recursive: true })

    // UP ID 列表
    const upBaseInfoList: Array<UserBaseInfoShema> = []
    // 所有的 BV 列表
    const bvList: BVItemFromFile[] = []

    const matchedTree = tree.filter((v) => v.name && midRegex.test(v.name))
    const upFolderPromises = matchedTree.map(processUpFolder)
    const upFolderResults = await Promise.all(upFolderPromises)

    upFolderResults.forEach((result) => {
      upBaseInfoList.push(result.upInfo)
      bvList.push(...result.bvItems)
    })

    console.timeEnd('getAllBVDataAsync')
    return { ups: upBaseInfoList, bvs: bvList }
  } catch (error) {
    console.error('读取目录时发生错误', error)
    return { ups: [], bvs: [] }
  }
}

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

  // 整合处理所有的视频，和 UP 主信息
  // 用于全局只处理一次请求
  async getAllBVData(rootDirPath: string): Promise<{ ups: Array<UserBaseInfoShema>; bvs: Array<BVItemFromFile> }> {
    if (!rootDirPath) return { ups: [], bvs: [] }

    console.time('getAllBVData')
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

    console.timeEnd('getAllBVData')

    return { ups: upBaseInfoList, bvs: bvList }
  },

  getAllBVDataAsync
}

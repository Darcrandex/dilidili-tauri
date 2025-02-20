import { join } from '@tauri-apps/api/path'
import { exists, readDir, readTextFile } from '@tauri-apps/plugin-fs'
import * as R from 'ramda'

const midRegex = /^\d{3,}$/ // UP 主 mid 规则
const bvRegex = /^BV[0-9a-zA-Z]{3,}$/ // BV 视频 id 规则

/**
 * 递归获取文件夹下所有的文件和子文件夹
 * @param path 文件夹路径
 */
async function readDirTree(path: string): Promise<AppScope.FileEntry[]> {
  try {
    // 调用 readDir 函数读取指定路径下的所有条目
    const entries = await readDir(path)
    // 用于存储最终的文件条目数组
    const fileEntries: AppScope.FileEntry[] = []

    // 遍历每个条目
    for (const entry of entries) {
      // 创建一个新的 FileEntry 对象

      const entryPath = await join(path, entry.name)
      const fileEntry: AppScope.FileEntry = {
        name: entry.name,
        path: entryPath,
        isDirectory: entry.isDirectory,
        isFile: entry.isFile,
      }

      // 如果当前条目是一个文件夹
      if (entry.isDirectory) {
        // 递归调用 readDirTree 函数来获取其所有子条目
        const children = await readDirTree(entryPath)
        // 将子条目添加到当前条目的 children 属性中
        fileEntry.children = children
      }

      // 将当前条目添加到最终的文件条目数组中
      fileEntries.push(fileEntry)
    }

    // 返回最终的文件条目数组
    return fileEntries
  } catch (error) {
    // 处理可能的错误
    console.error('Error reading directory tree:', error)
    return []
  }
}

// 检查文件是否存在的函数
async function checkFilesExist(files: string[]): Promise<boolean> {
  const results = await Promise.all(files.map((file) => exists(file)))
  return results.every((result) => result)
}

// 处理单个 UP 文件夹的函数
async function processUpFolder(v: AppScope.FileEntry): Promise<{
  upInfo: AppScope.UserBaseInfoShema
  bvItems: AppScope.BVItemFromFile[]
}> {
  const mid = v.name || ''
  const upInfo: AppScope.UserBaseInfoShema = { mid, path: v.name }
  const bvItems: AppScope.BVItemFromFile[] = []

  if (R.is(Array, v.children)) {
    const validBvPromises = v.children.map(async (c: AppScope.FileEntry) => {
      if (R.isNotNil(c.name) && bvRegex.test(c.name)) {
        const bvid = c.name
        const infoPath = await join(c.path, `${bvid}-info.json`)
        const coverPath = await join(c.path, `${bvid}-cover.jpg`)

        if (await checkFilesExist([infoPath, coverPath])) {
          try {
            const videoInfo: AppScope.VideoInfoSchema = JSON.parse(
              await readTextFile(infoPath),
            )
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
    bvItems.push(
      ...(validBvResults.filter(
        (item) => item !== null,
      ) as AppScope.BVItemFromFile[]),
    )
  }

  return { upInfo, bvItems }
}

/**
 * 读取资源文件夹中的文件, 构建临时使用的视频列表数据
 * @param rootDirPath
 */
async function getAllBVDataAsync(rootDirPath: string): Promise<{
  ups: Array<AppScope.UserBaseInfoShema>
  bvs: Array<AppScope.BVItemFromFile>
}> {
  if (!rootDirPath) return { ups: [], bvs: [] }

  try {
    console.time('getAllBVDataAsync')
    const tree = await readDirTree(rootDirPath)

    // UP ID 列表
    const upBaseInfoList: Array<AppScope.UserBaseInfoShema> = []
    // 所有的 BV 列表
    const bvList: AppScope.BVItemFromFile[] = []

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
  getAllBVDataAsync,
}

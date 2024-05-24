/* eslint-disable no-undef */
// 根据不同的平台，复制对应的 ffmpeg 文件到 tauri 中

import { execa } from 'execa'
import { existsSync, promises } from 'node:fs'
import { resolve } from 'node:path'

// 准备好不同平台下的 ffmpeg
const originFilePathMapping = {
  win32: 'src-tauri/binaries/windows/ffmpeg.exe',
  darwin: 'src-tauri/binaries/macos/ffmpeg',
  linux: 'src-tauri/binaries/linux/ffmpeg'
}

async function main() {
  // 注意
  // 这里的 ./ 不是当前文件的目录
  // 而是项目的根目录
  // 即 package.json 所在的目录
  const rootPath = resolve('./')
  const extension = process.platform === 'win32' ? '.exe' : ''

  console.log(`Platform: ${process.platform}`)

  const originFilePath = resolve(rootPath, originFilePathMapping[process.platform])

  if (!originFilePath) {
    throw new Error(`Unsupported platform: ${process.platform}`)
  }

  const rustInfo = (await execa('rustc', ['-vV'])).stdout
  const targetTriple = /host: (\S+)/g.exec(rustInfo)[1]
  if (!targetTriple) {
    throw new Error('Failed to determine platform target triple')
  }

  const targetFilePath = resolve(rootPath, `src-tauri/binaries/ffmpeg-${targetTriple}${extension}`)

  if (existsSync(targetFilePath)) {
    console.log(`File already exists: ${targetFilePath}`)
    return
  }

  // 复制对应的文件到 bin 目录
  // 其他没有使用到的 ffmpeg 文件不会被打包到程序中
  await promises.copyFile(originFilePath, targetFilePath)

  console.log(`File copied: ${targetFilePath}`)
}

main().catch((e) => {
  throw e
})

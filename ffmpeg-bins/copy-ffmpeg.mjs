// 根据不同的平台，复制对应的 ffmpeg 文件到 tauri 中
import { execSync } from 'child_process'
import { existsSync, promises } from 'node:fs'
import { platform as getPlatform } from 'node:os'
import { resolve } from 'node:path'
import { argv } from 'node:process'

// 按以下文件路径准备好不同平台下的 ffmpeg
const originFilePathMapping = {
  win32: 'ffmpeg-bins/windows/ffmpeg.exe',
  darwin: 'ffmpeg-bins/macos/ffmpeg',
  linux: 'ffmpeg-bins/linux/ffmpeg',
}

async function main() {
  // 注意
  // 这里的 ./ 不是当前文件的目录
  // 而是项目的根目录
  // 即 package.json 所在的目录
  const rootPath = resolve('./')

  const platform = getPlatform()
  // 为了配合 github action 的配置
  // 获取命令行传入的平台
  const target = argv.find((str) => str.includes(platform))
  const extension = platform === 'win32' ? '.exe' : ''
  const originFilePath = resolve(rootPath, originFilePathMapping[platform])

  if (!originFilePath) {
    throw new Error(`${platform} 平台不支持`)
  }

  // 本地运行时获取当前平台
  const rustInfo = execSync('rustc -vV')
  const targetTriple = target || /host: (\S+)/g.exec(rustInfo)[1]

  if (!targetTriple) {
    throw new Error('无法获取 target triple')
  }

  // 'binaries/ffmpeg' 名称必须与 'src-tauri/tauri.conf.json' 中定义的名称一致
  const targetFilePath = resolve(
    rootPath,
    `src-tauri/binaries/ffmpeg-${targetTriple}${extension}`,
  )

  if (existsSync(targetFilePath)) {
    console.log(`文件已存在: ${targetFilePath}`)
    return
  }

  if (!existsSync('src-tauri/binaries')) {
    await promises.mkdir('src-tauri/binaries', { recursive: true })
  }

  // 复制对应的文件到 bin 目录
  // 其他没有使用到的 ffmpeg 文件不会被打包到程序中
  await promises.copyFile(originFilePath, targetFilePath)

  console.log(`复制成功: ${targetFilePath}`)
}

main()

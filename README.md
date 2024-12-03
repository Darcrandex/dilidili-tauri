## 感谢

- [bilibili-API-collect](https://github.com/SocialSisterYi/bilibili-API-collect/tree/master)

## ffmpeg 方案

将所有平台的二进制文件下载到项目，通过环境变量判断平台，并复制对应的文件到 tauri 项目中

## fuck

- （使用默认程序）打开本地文件，[参考文档](https://tauri.app/v1/api/config/#shellallowlistopen)，如果需要自定义支持的文件，需要修改字符串；由于是任意文件，所有是 `"^"`

- 读取本地图片，转化可访问的图片 url
  ```json
  "protocol": {
    "all": true,
    "asset": true,
    "assetScope": ["*/**"] // 这个必须
  }
  ```

## debug

打开调试工具
`Ctrl + Shift + i` `Command + Option + i`

## release

1. 修改版本号 `package.json` `src-tauri/tauri.conf.json`
2. 提交一个tag。 格式为`app-v${version}`，例如`app-v1.1.1`
3. 推代码，执行 github-action

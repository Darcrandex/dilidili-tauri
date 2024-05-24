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

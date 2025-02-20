# dilidili 重构

## deps

- vitejs
- react-router@7
- tailwindcss
- antd-ui
- jotai
- react-query
- eslint@9
- react-dev-inspector

## dev

```bash
pnpm dev
```

## bilibili-api

感谢[bilibili-API-collect](https://github.com/SocialSisterYi/bilibili-API-collect/tree/master)开源项目

## 项目构建

先使用 vite 创建项目, 或者其他的模版项目; 然后根据[官方文档](https://v2.tauri.app/start/create-project/#manual-setup-tauri-cli)额外安装 tauri@v2

### sidecar 模式使用 ffmpeg

> [参考文档 Embedding External Binaries](https://v2.tauri.app/develop/sidecar/)

1. 安装 [shell 插件](https://v2.tauri.app/plugin/shell/)
2. 配置`src-tauri/tauri.conf.json`
   ```json
   { "bundle": { "externalBin": ["binaries/ffmpeg"] } }
   ```
3. 配置 shell 的执行权限 `src-tauri/capabilities/default.json`

   ```json
   {
     "permissions": [
       {
         "identifier": "shell:allow-execute",
         "allow": [
           {
             "name": "binaries/ffmpeg",
             "sidecar": true, // sidecar 模式
             "args": true // 允许 ffmpeg 输入参数(居然不是默认允许的,草弹)
           }
         ]
       }
     ]
   }
   ```

4. 根据 `ffmpeg-bins/copy-ffmpeg.mjs` 中所述, 准备 ffmpeg 可执行文件

### http 请求

1. 安装 [http](https://v2.tauri.app/plugin/http-client/) 插件
2. 配置 `src-tauri/Cargo.toml`
   ```yml
   tauri-plugin-http = { version = "2", features = ["unsafe-headers"] }
   ```
3. 参考`src/core/request.ts`中的`getCORSHeaders`, 使请求允许跨域
4. 配置权限 `src-tauri/capabilities/default.json`
   ```json
   {
     "permissions": [
       {
         "identifier": "http:default",
         "allow": [{ "url": "https://api.bilibili.com/*" }] // 可以使用通配符, 允许所有域名
       }
     ]
   }
   ```

### 访问本地图片

> 参考文档
> [convertfilesrc](https://v2.tauri.app/reference/javascript/api/namespacecore/#convertfilesrc) , [csp](https://v2.tauri.app/security/csp/)

配置

```json
{
  "app": {
    "security": {
      "csp": {
        "default-src": "'self' customprotocol: asset:",
        "connect-src": "ipc: http://ipc.localhost",
        "img-src": "'self' asset: http://asset.localhost blob: data:",
        "style-src": "'unsafe-inline' 'self'"
      },
      "assetProtocol": {
        "enable": true,
        "scope": ["**/*"] // 由于本 app 的资源文件夹是任意配置的, 因此不限制访问路径
      }
    }
  }
}
```

## release

修改 `package.json`和`src-tauri/tauri.conf.json`中的`version`字段; 创建并推送标签; 在`github-action`中执行脚本

```bash
git tag 'app-v1.1.1'
git push origin --tags
```

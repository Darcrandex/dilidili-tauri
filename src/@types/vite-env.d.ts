/// <reference types="vite/client" />

interface ImportMetaEnv {
  // 在这里定义 vite 环境变量的类型
  // 这样在写代码的时候，import.meta.env 就会有对应的提示
  VITE_APP_PORT: string
  VITE_BASE_URL: string
}

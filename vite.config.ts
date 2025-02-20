import { inspectorServer } from '@react-dev-inspector/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react-swc'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, './')

  return {
    plugins: [
      legacy(),
      react(),
      tailwindcss(),
      inspectorServer(),
      createHtmlPlugin({
        inject: {
          data: {
            TITLE: 'vite-react-ts-template',
            BUILD_TIME: new Date().toLocaleString(),
          },
        },
      }),
    ],

    resolve: { alias: { '@': path.resolve(__dirname, './src') } },

    server: {
      port: Number(env.VITE_APP_PORT || 3000),
    },

    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            antd: ['antd'],
            antdIcons: ['@ant-design/icons'],
          },
        },
      },
    },
  }
})

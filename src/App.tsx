/**
 * @name App
 * @description
 * @author darcrand
 */

import { Suspense, useEffect } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { routes } from './routes'

const router = createBrowserRouter(routes)

export default function App() {
  // 禁用右键菜单
  useEffect(() => {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })
  }, [])

  return (
    <>
      <Suspense fallback={<h1>loading...</h1>}>
        <RouterProvider router={router} />
      </Suspense>
    </>
  )
}

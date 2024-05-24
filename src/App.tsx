/**
 * @name App
 * @description
 * @author darcrand
 */

import { Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { routes } from './routes'

const router = createBrowserRouter(routes)

export default function App() {
  return (
    <>
      <Suspense fallback={<h1>loading...</h1>}>
        <RouterProvider router={router} />
      </Suspense>
    </>
  )
}

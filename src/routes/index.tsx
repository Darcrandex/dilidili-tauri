import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { withSuspense } from './with-suspense'

const Root = withSuspense(lazy(() => import('@/pages/root')))
const Home = withSuspense(lazy(() => import('@/pages/root/home')))
const Search = withSuspense(lazy(() => import('@/pages/root/home/search')))
const Space = withSuspense(lazy(() => import('@/pages/root/home/space')))
const SpacePage = withSuspense(lazy(() => import('@/pages/root/home/space/[id]')))
const Tasks = withSuspense(lazy(() => import('@/pages/root/home/tasks')))
const Mine = withSuspense(lazy(() => import('@/pages/root/mine')))
const Settings = withSuspense(lazy(() => import('@/pages/root/settings')))
const NotFound = withSuspense(lazy(() => import('@/pages/404')))

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <Navigate to='home' /> },
      {
        path: 'home',
        element: <Home />,
        children: [
          { index: true, element: <Navigate to='search' /> },

          {
            path: 'search',
            element: <Search />
          },
          {
            path: 'tasks',
            element: <Tasks />
          },
          {
            path: 'space',
            element: <Space />,
            children: [
              { index: true, element: <SpacePage /> },

              {
                path: ':id',
                element: <SpacePage />
              }
            ]
          }
        ]
      },

      {
        path: 'mine',
        element: <Mine />
      },
      {
        path: 'settings',
        element: <Settings />
      }
    ]
  },

  {
    path: '*',
    element: <NotFound />
  }
]

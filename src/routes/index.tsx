import { lazy } from 'react'
import { Navigate, type RouteObject } from 'react-router'

const AppLayout = lazy(() => import('@/app/layout'))
const HomeLayout = lazy(() => import('@/app/home/layout'))
const SearchPage = lazy(() => import('@/app/home/search/page'))
const TaskPage = lazy(() => import('@/app/home/task/page'))
const SpacePage = lazy(() => import('@/app/home/space/page'))

const MinePage = lazy(() => import('@/app/mine/page'))
const SettingsPage = lazy(() => import('@/app/settings/page'))
const AboutPage = lazy(() => import('@/app/about/page'))
const NotFound = lazy(() => import('@/app/not-found/page'))

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate replace to='home' /> },
      {
        path: 'home',
        element: <HomeLayout />,
        children: [
          { index: true, element: <Navigate replace to='search' /> },
          { path: 'search', element: <SearchPage /> },
          { path: 'task', element: <TaskPage /> },
          { path: 'space', element: <SpacePage /> },
        ],
      },

      { path: 'mine', element: <MinePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'about', element: <AboutPage /> },
    ],
  },

  { path: '*', element: <NotFound /> },
]

import { Navigate, RouteObject } from 'react-router'
import {
  AboutPage,
  HomeLayout,
  MinePage,
  NotFound,
  RootLayout,
  SearchPage,
  SettingsPage,
  SpaceLayout,
  TasksPage,
} from './lazy-load'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to='home' /> },
      {
        path: 'home',
        element: <HomeLayout />,
        children: [
          { index: true, element: <Navigate to='search' /> },
          { path: 'search', element: <SearchPage /> },
          { path: 'tasks', element: <TasksPage /> },
          { path: 'space', element: <SpaceLayout /> },
        ],
      },

      { path: 'mine', element: <MinePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'about', element: <AboutPage /> },
    ],
  },

  {
    path: '*',
    element: <NotFound />,
  },
]

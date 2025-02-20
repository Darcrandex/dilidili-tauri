import { lazy } from 'react'

export const RootLayout = lazy(() => import('@/pages/root/layout'))

export const HomeLayout = lazy(() => import('@/pages/root/home/layout'))

export const NotFound = lazy(() => import('@/pages/404'))

export const AboutPage = lazy(() => import('@/pages/root/about/page'))

export const MinePage = lazy(() => import('@/pages/root/mine/page'))

export const SettingsPage = lazy(() => import('@/pages/root/settings/page'))

export const SearchPage = lazy(() => import('@/pages/root/home/search/page'))

export const TasksPage = lazy(() => import('@/pages/root/home/tasks/page'))

export const SpaceLayout = lazy(() => import('@/pages/root/home/space/layout'))

export const SpacePage = lazy(() => import('@/pages/root/home/space/page'))

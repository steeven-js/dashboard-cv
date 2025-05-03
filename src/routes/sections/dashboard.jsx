import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

import { usePathname } from '../hooks';

// ----------------------------------------------------------------------

const IndexPage = lazy(() => import('src/pages/dashboard/one'));
const PageTwo = lazy(() => import('src/pages/dashboard/two'));
const PageThree = lazy(() => import('src/pages/dashboard/three'));
const PageFour = lazy(() => import('src/pages/dashboard/four'));
const PageFive = lazy(() => import('src/pages/dashboard/five'));
const PageSix = lazy(() => import('src/pages/dashboard/six'));

// CV Pages
const CVListPage = lazy(() => import('src/pages/dashboard/cv-list.jsx'));
const CVDetailsPage = lazy(() => import('src/pages/dashboard/cv-details.jsx'));
const CVEditPage = lazy(() => import('src/pages/dashboard/cv-edit.jsx'));
const CVNewPage = lazy(() => import('src/pages/dashboard/cv-new.jsx'));

// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      { element: <IndexPage />, index: true },
      { path: 'two', element: <PageTwo /> },
      { path: 'three', element: <PageThree /> },
      {
        path: 'group',
        children: [
          { element: <PageFour />, index: true },
          { path: 'five', element: <PageFive /> },
          { path: 'six', element: <PageSix /> },
        ],
      },
      // Routes CV
      {
        path: 'cv',
        children: [
          { element: <CVListPage />, index: true },
          { path: 'list', element: <CVListPage /> },
          { path: 'new', element: <CVNewPage /> },
          { path: 'details/:id', element: <CVDetailsPage /> },
          { path: 'edit/:id', element: <CVEditPage /> },
        ],
      },
    ],
  },
];

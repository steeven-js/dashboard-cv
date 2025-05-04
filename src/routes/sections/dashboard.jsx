import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

import { usePathname } from '../hooks';

// ----------------------------------------------------------------------

const CVBuilderPage = lazy(() => import('src/sections/cv/cv-builder'));
const TechnicalSkillsPage = lazy(() => import('src/sections/cv/skills'));
const SkillVisualizationDemo = lazy(() => import('src/sections/cv/skills/skill-visualization-demo'));

// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

// Définir DashboardLayoutWrapper comme un composant React fonctionnel
function DashboardLayoutWrapper() {
  return (
    <DashboardLayout>
      <SuspenseOutlet />
    </DashboardLayout>
  );
}

// ----------------------------------------------------------------------

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? <DashboardLayoutWrapper /> : <AuthGuard><DashboardLayoutWrapper /></AuthGuard>,
    children: [
      { element: <CVBuilderPage />, index: true },
      { path: 'personal-info', element: <CVBuilderPage /> },
      { path: 'technical-skills', element: <TechnicalSkillsPage /> },
      { path: 'skill-visualization', element: <SkillVisualizationDemo /> },
      { path: 'professional-experience', element: <CVBuilderPage /> },
      { path: 'personal-projects', element: <CVBuilderPage /> },
      { path: 'education', element: <CVBuilderPage /> },
    ],
  },
];

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { AuthSplitLayout } from 'src/layouts/auth-split';

import { SplashScreen } from 'src/components/loading-screen';

import { GuestGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

/** **************************************
 * Supabase
 *************************************** */
const Supabase = {
  SignInPage: lazy(() => import('src/pages/auth/supabase/sign-in')),
  SignUpPage: lazy(() => import('src/pages/auth/supabase/sign-up')),
  VerifyPage: lazy(() => import('src/pages/auth/supabase/verify')),
  UpdatePasswordPage: lazy(() => import('src/pages/auth/supabase/update-password')),
  ResetPasswordPage: lazy(() => import('src/pages/auth/supabase/reset-password')),
};

const authSupabase = {
  path: 'supabase',
  children: [
    {
      path: 'sign-in',
      element: (
        <GuestGuard>
          <AuthSplitLayout
            slotProps={{
              section: { title: 'Hi, Welcome back' },
            }}
          >
            <Supabase.SignInPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'sign-up',
      element: (
        <GuestGuard>
          <AuthSplitLayout>
            <Supabase.SignUpPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'verify',
      element: (
        <AuthSplitLayout>
          <Supabase.VerifyPage />
        </AuthSplitLayout>
      ),
    },
    {
      path: 'reset-password',
      element: (
        <AuthSplitLayout>
          <Supabase.ResetPasswordPage />
        </AuthSplitLayout>
      ),
    },
    {
      path: 'update-password',
      element: (
        <AuthSplitLayout>
          <Supabase.UpdatePasswordPage />
        </AuthSplitLayout>
      ),
    },
  ],
};

// ----------------------------------------------------------------------

export const authRoutes = [
  {
    path: 'auth',
    element: (
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    ),
    children: [authSupabase],
  },
];

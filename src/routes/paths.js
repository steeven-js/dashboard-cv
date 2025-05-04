// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

function path(root, sublink) {
  return `${root}${sublink}`;
}

const ROOTS_DASHBOARD = '/dashboard';

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS_DASHBOARD,
    personalInfo: `${ROOTS_DASHBOARD}/personal-info`,
    technicalSkills: `${ROOTS_DASHBOARD}/technical-skills`,
    professionalExperience: `${ROOTS_DASHBOARD}/professional-experience`,
    personalProjects: `${ROOTS_DASHBOARD}/personal-projects`,
    education: `${ROOTS_DASHBOARD}/education`,
  },
  
  // CV Builder
  cv: {
    root: path(ROOTS_DASHBOARD, '/cv'),
    builder: path(ROOTS_DASHBOARD, '/cv/builder'),
    skills: path(ROOTS_DASHBOARD, '/cv/skills'),
    experience: path(ROOTS_DASHBOARD, '/cv/experience'),
    education: path(ROOTS_DASHBOARD, '/cv/education'),
    projects: path(ROOTS_DASHBOARD, '/cv/projects'),
  },
};

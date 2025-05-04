import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
};

// ----------------------------------------------------------------------

export const navData = [
  /**
   * CV Dynamique
   */
  {
    subheader: 'CV Dynamique',
    items: [
      { 
        title: 'Informations Personnelles', 
        path: paths.dashboard.personalInfo, 
        icon: ICONS.user 
      },
      { 
        title: 'Compétences Techniques', 
        path: paths.dashboard.technicalSkills, 
        icon: ICONS.parameter 
      },
      { 
        title: 'Expériences Professionnelles', 
        path: paths.dashboard.professionalExperience, 
        icon: ICONS.job 
      },
      { 
        title: 'Projets Personnels', 
        path: paths.dashboard.personalProjects, 
        icon: ICONS.folder 
      },
      { 
        title: 'Formations et Diplômes', 
        path: paths.dashboard.education, 
        icon: ICONS.course 
      },
    ],
  },
];

/**
 * Modèle de données pour les compétences techniques
 */

// Catégories de compétences disponibles
export const SKILL_CATEGORIES = [
  { value: 'Front-end', label: 'Front-end' },
  { value: 'Back-end', label: 'Back-end' },
  { value: 'Mobile', label: 'Mobile' },
  { value: 'DevOps', label: 'DevOps' },
  { value: 'Database', label: 'Base de données' },
  { value: 'Design', label: 'Design' },
  { value: 'Tools', label: 'Outils' },
  { value: 'Other', label: 'Autre' },
];

// Structure des niveaux de compétence
export const SKILL_LEVELS = [
  { value: 1, label: 'Débutant' },
  { value: 2, label: 'Intermédiaire' },
  { value: 3, label: 'Avancé' },
  { value: 4, label: 'Expert' },
  { value: 5, label: 'Maître' },
];

// Suggestions de compétences par catégorie
export const CATEGORIZED_SKILLS = {
  'Front-end': [
    'React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'HTML', 'CSS', 'JavaScript', 'TypeScript',
    'Redux', 'Webpack', 'Vite', 'jQuery', 'Bootstrap', 'Tailwind CSS', 'Material UI', 'Sass',
    'Emotion', 'Styled Components', 'React Router', 'SWR', 'React Query', 'MobX', 'Remix'
  ],
  'Back-end': [
    'Node.js', 'Express.js', 'PHP', 'Laravel', 'Ruby on Rails', 'Django', 'Flask', 'ASP.NET',
    'Spring Boot', 'Java', 'Python', 'Go', 'Rust', 'C#', 'C++', 'GraphQL', 'REST', 'NestJS',
    'FastAPI', 'Strapi', 'Symfony', 'Hapi.js', 'Koa.js', 'Apollo Server'
  ],
  'Mobile': [
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'Ionic', 'Expo', 'Android SDK', 'iOS SDK',
    'SwiftUI', 'Xamarin', 'Cordova', 'Capacitor', 'Jetpack Compose', 'Mobile First Design'
  ],
  'Database': [
    'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Firebase', 'Redis', 'Elasticsearch', 'Supabase',
    'MariaDB', 'Oracle', 'SQL Server', 'DynamoDB', 'Cassandra', 'Neo4j', 'CouchDB', 'Firestore'
  ],
  'DevOps': [
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'Jenkins', 'GitHub Actions', 'Terraform',
    'Ansible', 'Nginx', 'Prometheus', 'Grafana', 'Linux', 'Bash', 'CI/CD', 'GitLab CI',
    'CircleCI', 'Travis CI', 'Pulumi', 'ArgoCD', 'Heroku', 'Netlify', 'Vercel'
  ],
  'Design': [
    'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'InVision', 'UX Research',
    'UI Design', 'Wireframing', 'Prototyping', 'User Testing', 'Accessibility', 'Design Systems'
  ],
  'Tools': [
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'JIRA', 'Confluence', 'Notion', 'Trello',
    'Slack', 'VS Code', 'IntelliJ IDEA', 'WebStorm', 'Postman', 'Insomnia', 'npm', 'yarn', 'pnpm'
  ],
  'Other': [
    'Agile', 'Scrum', 'Kanban', 'SEO', 'Analytics', 'Documentation', 'Testing', 'Jest',
    'Cypress', 'Selenium', 'WebdriverIO', 'Mocha', 'Chai', 'Sinon', 'TDD', 'BDD'
  ]
};

// Toutes les suggestions de compétences au format plat
export const SKILL_SUGGESTIONS = Object.values(CATEGORIZED_SKILLS).flat();

// Structure de base d'une compétence technique
export const DEFAULT_SKILL = {
  id: null,
  name: '',
  category: '',
  level: 3,
  yearsExperience: 1,
  tags: [],
  visibility: true,
  displayOrder: 0
};

/**
 * Obtient des suggestions de compétences basées sur une catégorie
 * @param {string} category - Catégorie de compétence
 * @returns {string[]} - Liste de suggestions
 */
export const getSkillSuggestionsByCategory = (category) => CATEGORIZED_SKILLS[category] || [];

/**
 * Obtient les suggestions les plus pertinentes basées sur le texte saisi
 * @param {string} input - Texte saisi par l'utilisateur
 * @param {string} category - Catégorie sélectionnée (optionnel)
 * @returns {string[]} - Liste des suggestions filtrées
 */
export const getFilteredSkillSuggestions = (input, category = null) => {
  const searchTerm = input.toLowerCase();
  
  // Utiliser les compétences de la catégorie spécifique si elle est fournie
  const sourceSuggestions = category ? CATEGORIZED_SKILLS[category] || [] : SKILL_SUGGESTIONS;
  
  // Filtrer et limiter les suggestions
  return sourceSuggestions
    .filter(skill => skill.toLowerCase().includes(searchTerm))
    .slice(0, 10);
}; 
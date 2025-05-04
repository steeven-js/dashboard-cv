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

/**
 * Tags prédéfinis par catégorie pour faciliter le matching avec les offres d'emploi
 */
export const PREDEFINED_TAGS = {
  'Front-end': [
    'UI', 'Interface utilisateur', 'UX', 'Responsive', 'Web', 'SPA', 'Client-side', 
    'Frontend', 'JavaScript', 'CSS', 'HTML', 'Composants', 'Rendu'
  ],
  'Back-end': [
    'API', 'Serveur', 'Server-side', 'Backend', 'Microservices', 'Authentification', 
    'Base de données', 'Performance', 'Sécurité', 'REST', 'GraphQL'
  ],
  'Mobile': [
    'iOS', 'Android', 'Mobile', 'App', 'Tablette', 'Responsive', 'Native', 
    'Cross-platform', 'Hybride', 'Offline', 'Push Notifications'
  ],
  'Database': [
    'SQL', 'NoSQL', 'DBMS', 'Modélisation', 'Indexation', 'Requêtes', 'Stockage', 
    'Cache', 'Transactions', 'Migration', 'Optimisation'
  ],
  'DevOps': [
    'CI/CD', 'Pipeline', 'Automatisation', 'Déploiement', 'Container', 'Infrastructure', 
    'Cloud', 'Monitoring', 'Logging', 'Scaling', 'Sécurité'
  ],
  'Design': [
    'UI/UX', 'Wireframe', 'Prototype', 'Maquette', 'Layout', 'Design system', 
    'Accessibilité', 'Usabilité', 'Responsive', 'Mobile-first'
  ],
  'Tools': [
    'Version control', 'Automation', 'Testing', 'Build', 'Package', 'Dependency', 
    'Task runner', 'Bundler', 'Linter', 'Debug'
  ],
  'Other': [
    'Agile', 'Scrum', 'Management', 'Documentation', 'Testing', 'QA', 
    'Analytics', 'SEO', 'Accessibilité', 'Performance'
  ]
};

/**
 * Obtient les tags prédéfinis pour une catégorie spécifique
 * @param {string} category - Catégorie de compétence
 * @returns {string[]} - Liste des tags prédéfinis
 */
export const getPredefinedTagsByCategory = (category) => PREDEFINED_TAGS[category] || [];

/**
 * Analyse les tags les plus populaires parmi toutes les compétences
 * @param {Array} skills - Liste des compétences avec leurs tags
 * @returns {Array} - Tags populaires avec leur compte d'utilisation
 */
export const analyzePopularTags = (skills = []) => {
  // Compteur de tags
  const tagCounter = {};
  
  // Parcourir toutes les compétences et compter les tags
  skills.forEach(skill => {
    if (skill.tags && Array.isArray(skill.tags)) {
      skill.tags.forEach(tag => {
        tagCounter[tag] = (tagCounter[tag] || 0) + 1;
      });
    }
  });
  
  // Convertir en tableau et trier par popularité
  const popularTags = Object.entries(tagCounter)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  
  return popularTags;
};

/**
 * Calcule la correspondance entre une offre d'emploi et les compétences utilisateur
 * @param {Object} jobOffer - Objet contenant les tags et compétences de l'offre
 * @param {Array} userSkills - Compétences de l'utilisateur
 * @returns {Object} - Score de correspondance et analyse détaillée
 */
export const calculateTagMatching = (jobOffer, userSkills = []) => {
  // Extraire tous les tags des compétences utilisateur
  const userTags = [];
  userSkills.forEach(skill => {
    // Ajouter le nom de la compétence comme tag
    userTags.push(skill.name.toLowerCase());
    
    // Ajouter tous les tags associés
    if (skill.tags && Array.isArray(skill.tags)) {
      skill.tags.forEach(tag => userTags.push(tag.toLowerCase()));
    }
  });
  
  // Extraire les tags de l'offre
  const jobTags = [];
  if (jobOffer.requiredSkills) {
    jobOffer.requiredSkills.forEach(skill => {
      jobTags.push(skill.toLowerCase());
    });
  }
  
  if (jobOffer.tags && Array.isArray(jobOffer.tags)) {
    jobOffer.tags.forEach(tag => jobTags.push(tag.toLowerCase()));
  }
  
  // Compter les correspondances
  const matches = [];
  const missing = [];
  
  jobTags.forEach(tag => {
    const isMatch = userTags.some(userTag => 
      userTag === tag || 
      userTag.includes(tag) || 
      tag.includes(userTag)
    );
    
    if (isMatch) {
      matches.push(tag);
    } else {
      missing.push(tag);
    }
  });
  
  // Calculer le score
  const matchScore = jobTags.length > 0 ? (matches.length / jobTags.length) * 100 : 0;
  
  return {
    score: Math.round(matchScore),
    matches,
    missing,
    totalTags: jobTags.length
  };
};

/**
 * Suggère des tags pertinents basés sur le nom de la compétence et sa catégorie
 * @param {string} skillName - Nom de la compétence
 * @param {string} category - Catégorie de la compétence
 * @returns {Array} - Tags suggérés
 */
export const suggestRelevantTags = (skillName, category) => {
  const suggestions = [];
  
  // Ajouter les tags prédéfinis de la catégorie
  if (category && PREDEFINED_TAGS[category]) {
    suggestions.push(...PREDEFINED_TAGS[category].slice(0, 5));
  }
  
  // Analyser le nom de la compétence pour trouver des mots-clés connexes
  const skillLower = skillName.toLowerCase();
  
  // Pour les frameworks frontend
  if (skillLower.includes('react')) {
    suggestions.push('JavaScript', 'SPA', 'Composants', 'Frontend', 'UI');
  } else if (skillLower.includes('vue')) {
    suggestions.push('JavaScript', 'SPA', 'Frontend', 'Composants');
  } else if (skillLower.includes('angular')) {
    suggestions.push('TypeScript', 'SPA', 'Frontend', 'Composants');
  }
  
  // Pour les langages de programmation
  if (skillLower.includes('python')) {
    suggestions.push('Scripting', 'Backend', 'Data Science', 'Automation');
  } else if (skillLower.includes('java')) {
    suggestions.push('Backend', 'Enterprise', 'JVM', 'OOP');
  } else if (skillLower.includes('javascript') || skillLower.includes('js')) {
    suggestions.push('Frontend', 'Web', 'Scripting', 'Browser');
  }
  
  // Pour les bases de données
  if (skillLower.includes('sql')) {
    suggestions.push('Database', 'Queries', 'RDBMS', 'Data');
  } else if (skillLower.includes('mongo')) {
    suggestions.push('NoSQL', 'Database', 'Document DB', 'Data');
  }
  
  // Retourner un tableau de suggestions uniques
  return [...new Set(suggestions)];
}; 
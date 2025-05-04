/**
 * Exemples d'offres d'emploi pour les tests et démos
 */

export const JOB_OFFER_SAMPLES = [
  {
    id: 'job-001',
    title: 'Développeur Front-End React',
    company: {
      name: 'TechSolutions',
      website: 'https://techsolutions.example.com',
      logoUrl: 'https://via.placeholder.com/150?text=TS',
      location: 'Paris, France',
      industry: 'Technologies de l\'information',
      size: '51-200',
    },
    status: 'active',
    contract: {
      type: 'cdi',
      duration: null,
      workMode: 'hybrid',
      salaryMin: 45000,
      salaryMax: 55000,
      currency: 'EUR',
      benefits: [
        'Tickets restaurant',
        'Mutuelle santé',
        'RTT',
        'Télétravail 3j/semaine',
        'Plan d\'épargne entreprise',
      ],
    },
    description: `TechSolutions recherche un Développeur Front-End React passionné pour rejoindre notre équipe produit.

    Vous serez responsable de la conception et de l'implémentation d'interfaces utilisateur réactives et performantes pour nos applications web. Vous travaillerez en étroite collaboration avec nos designers UX/UI et nos développeurs backend pour créer des expériences utilisateur exceptionnelles.`,
    requirements: [
      'Expérience professionnelle de 3 ans minimum en développement front-end',
      'Maîtrise de React, Redux et des hooks React',
      'Bonnes connaissances en HTML5, CSS3 et JavaScript ES6+',
      'Expérience avec les tests unitaires et d\'intégration (Jest, React Testing Library)',
      'Connaissance des bonnes pratiques de performance web',
      'Expérience avec TypeScript',
      'Diplôme en informatique ou équivalent',
    ],
    responsibilities: [
      'Développer des interfaces utilisateur réactives et performantes',
      'Implémenter des designs UI/UX fidèles aux maquettes',
      'Collaborer avec l\'équipe backend pour intégrer les APIs',
      'Optimiser les applications pour une performance maximale',
      'Maintenir et améliorer le code existant',
      'Participer aux revues de code et aux réunions d\'équipe',
      'Proposer des solutions techniques innovantes',
    ],
    keySkills: [
      'React',
      'Redux',
      'JavaScript',
      'TypeScript',
      'HTML5',
      'CSS3',
      'Jest',
      'Git',
    ],
    applicationInfo: {
      url: 'https://techsolutions.example.com/careers/frontend-developer',
      contactEmail: 'recrutement@techsolutions.example.com',
      contactName: 'Marie Dubois',
      contactPhone: '',
      deadline: '2023-12-15T00:00:00Z',
    },
    metadata: {
      source: 'Site web de l\'entreprise',
      importedAt: '2023-11-01T14:30:00Z',
      lastUpdated: '2023-11-01T14:30:00Z',
      favorite: true,
      notes: 'Entreprise bien notée sur Glassdoor, environnement de travail moderne.',
      confidenceScore: 0.95,
    },
    analysis: {
      matchScore: 0.87,
      skillsMatch: [
        { name: 'React', score: 0.95, category: 'Front-end' },
        { name: 'JavaScript', score: 0.90, category: 'Front-end' },
        { name: 'TypeScript', score: 0.85, category: 'Front-end' },
        { name: 'HTML', score: 0.95, category: 'Front-end' },
        { name: 'CSS', score: 0.90, category: 'Front-end' },
        { name: 'Git', score: 0.95, category: 'Tools' },
      ],
      missingSkills: [
        'React Testing Library',
        'Redux',
      ],
      keywords: [
        'interfaces utilisateur',
        'performance',
        'expérience utilisateur',
        'collaboration',
        'optimisation',
      ],
    },
  },
  {
    id: 'job-002',
    title: 'Développeur Full Stack JavaScript',
    company: {
      name: 'InnovateTech',
      website: 'https://innovatetech.example.com',
      logoUrl: 'https://via.placeholder.com/150?text=IT',
      location: 'Lyon, France',
      industry: 'Développement logiciel',
      size: '11-50',
    },
    status: 'active',
    contract: {
      type: 'cdi',
      duration: null,
      workMode: 'remote',
      salaryMin: 50000,
      salaryMax: 65000,
      currency: 'EUR',
      benefits: [
        'Télétravail à 100%',
        'Horaires flexibles',
        'Budget formation',
        'Matériel au choix',
        'Prime annuelle',
      ],
    },
    description: `InnovateTech recrute un Développeur Full Stack JavaScript pour renforcer son équipe.

    Vous participerez au développement de notre plateforme SaaS en pleine croissance, en travaillant sur tous les aspects de l'application, du backend au frontend. Notre stack technique est basée sur Node.js, Express, React et MongoDB.`,
    requirements: [
      'Expérience de 2+ ans en développement full stack JavaScript',
      'Maîtrise de Node.js, Express et React',
      'Bonne connaissance des bases de données NoSQL (MongoDB)',
      'Expérience avec Git et les méthodologies agiles',
      'Capacité à travailler de manière autonome en télétravail',
      'Bonnes compétences en communication écrite et orale',
    ],
    responsibilities: [
      'Développer de nouvelles fonctionnalités sur notre plateforme SaaS',
      'Maintenir et améliorer les fonctionnalités existantes',
      'Collaborer avec l\'équipe produit pour définir les spécifications techniques',
      'Participer aux revues de code et assurer la qualité du code',
      'Résoudre les problèmes techniques et les bugs',
      'Contribuer à l\'évolution de notre architecture technique',
    ],
    keySkills: [
      'JavaScript',
      'Node.js',
      'Express',
      'React',
      'MongoDB',
      'Git',
      'REST API',
      'Agile',
    ],
    applicationInfo: {
      url: 'https://innovatetech.example.com/jobs/fullstack-developer',
      contactEmail: 'jobs@innovatetech.example.com',
      contactName: 'Thomas Martin',
      contactPhone: '+33123456789',
      deadline: '2023-12-31T00:00:00Z',
    },
    metadata: {
      source: 'LinkedIn',
      importedAt: '2023-11-05T09:15:00Z',
      lastUpdated: '2023-11-05T09:15:00Z',
      favorite: true,
      notes: 'Startup innovante avec une bonne culture tech.',
      confidenceScore: 0.92,
    },
    analysis: {
      matchScore: 0.82,
      skillsMatch: [
        { name: 'JavaScript', score: 0.95, category: 'Front-end' },
        { name: 'React', score: 0.90, category: 'Front-end' },
        { name: 'Node.js', score: 0.75, category: 'Back-end' },
        { name: 'Git', score: 0.95, category: 'Tools' },
        { name: 'REST API', score: 0.85, category: 'Back-end' },
      ],
      missingSkills: [
        'MongoDB',
        'Express',
      ],
      keywords: [
        'full stack',
        'SaaS',
        'télétravail',
        'autonomie',
        'plateforme',
      ],
    },
  },
  {
    id: 'job-003',
    title: 'Développeur Mobile React Native',
    company: {
      name: 'AppMakers',
      website: 'https://appmakers.example.com',
      logoUrl: 'https://via.placeholder.com/150?text=AM',
      location: 'Bordeaux, France',
      industry: 'Applications mobiles',
      size: '11-50',
    },
    status: 'active',
    contract: {
      type: 'freelance',
      duration: 6,
      workMode: 'hybrid',
      salaryMin: 450,
      salaryMax: 550,
      currency: 'EUR',
      benefits: [],
    },
    description: `AppMakers recherche un développeur mobile React Native expérimenté pour une mission de 6 mois, avec possibilité de prolongation.

    Vous rejoindrez notre équipe pour développer une application mobile innovante dans le secteur de la santé connectée. L'application sera disponible sur iOS et Android et communiquera avec des objets connectés via Bluetooth.`,
    requirements: [
      'Expérience significative en développement React Native',
      'Connaissance approfondie de JavaScript/TypeScript',
      'Expérience dans le développement d\'applications iOS et Android',
      'Maîtrise des outils de débogage mobile',
      'Expérience avec les API Bluetooth et les objets connectés',
      'Connaissance des bonnes pratiques de développement mobile',
    ],
    responsibilities: [
      'Développer une application mobile React Native pour iOS et Android',
      'Implémenter les interactions avec les objets connectés via Bluetooth',
      'Assurer la qualité du code et la maintenabilité',
      'Participer aux sessions de planification et aux réunions d\'équipe',
      'Collaborer avec les designers et les développeurs backend',
      'Résoudre les problèmes techniques complexes',
    ],
    keySkills: [
      'React Native',
      'JavaScript',
      'TypeScript',
      'iOS',
      'Android',
      'Bluetooth',
      'API REST',
      'Git',
    ],
    applicationInfo: {
      url: 'https://appmakers.example.com/careers/react-native-developer',
      contactEmail: 'jobs@appmakers.example.com',
      contactName: 'Sophie Laurent',
      contactPhone: '',
      deadline: null,
    },
    metadata: {
      source: 'Malt',
      importedAt: '2023-11-10T11:20:00Z',
      lastUpdated: '2023-11-10T11:20:00Z',
      favorite: false,
      notes: 'Mission intéressante dans le secteur de la santé connectée.',
      confidenceScore: 0.88,
    },
    analysis: {
      matchScore: 0.65,
      skillsMatch: [
        { name: 'JavaScript', score: 0.90, category: 'Front-end' },
        { name: 'TypeScript', score: 0.85, category: 'Front-end' },
        { name: 'Git', score: 0.95, category: 'Tools' },
        { name: 'API REST', score: 0.80, category: 'Back-end' },
      ],
      missingSkills: [
        'React Native',
        'Bluetooth',
        'iOS',
        'Android',
      ],
      keywords: [
        'mobile',
        'objets connectés',
        'santé',
        'bluetooth',
        'mission',
      ],
    },
  }
];

/**
 * Objet JSON d'exemple pour tester l'importation
 */
export const SAMPLE_JSON_IMPORT = {
  title: "Développeur Backend Node.js",
  company: {
    name: "DataFlow",
    website: "https://dataflow.example.com",
    location: "Nantes, France",
    industry: "Big Data"
  },
  contract: {
    type: "cdi",
    workMode: "hybrid",
    salaryMin: 48000,
    salaryMax: 58000,
    currency: "EUR"
  },
  description: "DataFlow cherche un développeur backend Node.js pour renforcer son équipe produit. Vous participerez au développement de notre plateforme d'analyse de données en temps réel.",
  requirements: [
    "3+ ans d'expérience en développement Node.js",
    "Connaissance des bases de données SQL et NoSQL",
    "Expérience avec les architectures microservices",
    "Maîtrise de Git et des workflows de CI/CD"
  ],
  responsibilities: [
    "Développer et maintenir des API REST et GraphQL",
    "Optimiser les performances de nos services backend",
    "Concevoir des architectures scalables",
    "Participer à la revue de code"
  ],
  keySkills: [
    "Node.js",
    "Express",
    "MongoDB",
    "PostgreSQL",
    "Docker",
    "GraphQL",
    "Microservices"
  ],
  applicationInfo: {
    url: "https://dataflow.example.com/jobs/backend-developer",
    contactEmail: "careers@dataflow.example.com"
  }
};

/**
 * Exemple de texte brut d'offre d'emploi pour tester l'importation
 */
export const SAMPLE_TEXT_IMPORT = `Ingénieur DevOps

CloudSphere

Nous recherchons un Ingénieur DevOps pour rejoindre notre équipe infrastructure à Toulouse. Télétravail partiel possible.

Description du poste:
Vous serez responsable de la mise en place et de la maintenance de notre infrastructure cloud, de l'automatisation des déploiements et de l'amélioration continue de nos processus CI/CD.

Responsabilités:
- Concevoir, déployer et maintenir notre infrastructure cloud (AWS)
- Mettre en place et améliorer nos pipelines CI/CD
- Automatiser les processus de déploiement et de test
- Surveiller les performances de nos systèmes
- Collaborer avec les équipes de développement pour résoudre les problèmes d'infrastructure
- Documenter les architectures et processus

Profil recherché:
- Minimum 2 ans d'expérience en DevOps
- Expertise AWS (EC2, S3, RDS, EKS)
- Maîtrise de Docker et Kubernetes
- Expérience avec Terraform et Ansible
- Connaissance des outils CI/CD (GitLab CI, Jenkins)
- Bonnes compétences en scripting (Bash, Python)
- Capacité à travailler en équipe

Contrat: CDI
Salaire: 45000€ - 60000€ selon expérience

Contact: recrutement@cloudsphere.example.com`;

/**
 * Obtient un exemple d'offre d'emploi par son ID
 * @param {string} id - ID de l'offre d'emploi
 * @returns {Object|null} - Offre d'emploi correspondante ou null
 */
export const getJobOfferSampleById = (id) => JOB_OFFER_SAMPLES.find(offer => offer.id === id) || null; 
/**
 * Modèle de données pour les offres d'emploi
 */

// Statuts possibles d'une offre d'emploi
export const JOB_OFFER_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'applied', label: 'Candidature envoyée' },
  { value: 'interview', label: 'Entretien en cours' },
  { value: 'offer', label: 'Offre reçue' },
  { value: 'rejected', label: 'Refusée' },
  { value: 'archived', label: 'Archivée' },
];

// Types de contrat disponibles
export const CONTRACT_TYPES = [
  { value: 'cdi', label: 'CDI' },
  { value: 'cdd', label: 'CDD' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Stage' },
  { value: 'apprenticeship', label: 'Alternance' },
  { value: 'other', label: 'Autre' },
];

// Modes de travail
export const WORK_MODES = [
  { value: 'onsite', label: 'Sur site' },
  { value: 'remote', label: 'Télétravail' },
  { value: 'hybrid', label: 'Hybride' },
];

// Structure de base d'une offre d'emploi
export const DEFAULT_JOB_OFFER = {
  id: null,
  title: '',
  company: {
    name: '',
    website: '',
    logoUrl: '',
    location: '',
    industry: '',
    size: '',
  },
  status: 'active',
  contract: {
    type: '',
    duration: null,
    workMode: '',
    salaryMin: null,
    salaryMax: null,
    currency: 'EUR',
    benefits: [],
  },
  description: '',
  requirements: [],
  responsibilities: [],
  keySkills: [],
  applicationInfo: {
    url: '',
    contactEmail: '',
    contactName: '',
    contactPhone: '',
    deadline: null,
  },
  metadata: {
    source: '',
    importedAt: null,
    lastUpdated: null,
    favorite: false,
    notes: '',
    confidenceScore: null,
  },
  analysis: {
    matchScore: null,
    skillsMatch: [],
    missingSkills: [],
    keywords: [],
  },
};

/**
 * Obtient les suggestions d'industries les plus courantes
 * @returns {string[]} - Liste des industries
 */
export const INDUSTRY_SUGGESTIONS = [
  'Technologies de l\'information',
  'Développement logiciel',
  'Services informatiques',
  'E-commerce',
  'Finance',
  'Santé',
  'Éducation',
  'Télécommunications',
  'Médias',
  'Publicité',
  'Conseil',
  'Assurance',
  'Industrie pharmaceutique',
  'Automobile',
  'Aéronautique',
  'Transport',
  'Logistique',
  'Énergie',
  'Immobilier',
  'Agroalimentaire',
  'Tourisme',
  'Environnement',
  'Luxe',
  'Mode',
  'Grande distribution',
  'Secteur public',
  'Associations',
];

/**
 * Obtient les suggestions pour les tailles d'entreprise
 * @returns {Array} - Liste des tailles d'entreprise
 */
export const COMPANY_SIZE_OPTIONS = [
  { value: '1-10', label: '1-10 employés' },
  { value: '11-50', label: '11-50 employés' },
  { value: '51-200', label: '51-200 employés' },
  { value: '201-500', label: '201-500 employés' },
  { value: '501-1000', label: '501-1000 employés' },
  { value: '1001-5000', label: '1001-5000 employés' },
  { value: '5001+', label: '5001+ employés' },
];

/**
 * Obtient les suggestions pour les devises
 * @returns {Array} - Liste des devises principales
 */
export const CURRENCY_OPTIONS = [
  { value: 'EUR', label: '€ (Euro)' },
  { value: 'USD', label: '$ (Dollar US)' },
  { value: 'GBP', label: '£ (Livre Sterling)' },
  { value: 'CHF', label: 'CHF (Franc Suisse)' },
  { value: 'CAD', label: '$ (Dollar Canadien)' },
];

/**
 * Obtient les suggestions pour les avantages courants
 * @returns {string[]} - Liste des avantages
 */
export const BENEFITS_SUGGESTIONS = [
  'Tickets restaurant',
  'Mutuelle santé',
  'Prévoyance',
  'Participation/Intéressement',
  'RTT',
  'Horaires flexibles',
  'Télétravail',
  'Formation continue',
  'Plan d\'épargne entreprise',
  'Comité d\'entreprise',
  'Salle de sport',
  'Crèche d\'entreprise',
  'Remboursement transport',
]; 
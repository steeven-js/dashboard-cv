/**
 * Utilitaires pour normaliser et valider les données d'offres d'emploi
 */
import { DEFAULT_JOB_OFFER } from 'src/data/job-offer-model';

/**
 * Nettoie et normalise une chaîne de caractères
 * @param {string|any} value - Valeur à nettoyer
 * @param {string} defaultValue - Valeur par défaut si non valide
 * @returns {string} - Chaîne nettoyée
 */
const normalizeString = (value, defaultValue = '') => {
  if (typeof value !== 'string') return defaultValue;
  return value.trim() || defaultValue;
};

/**
 * Normalise un nombre
 * @param {number|string|any} value - Valeur à normaliser
 * @param {number|null} defaultValue - Valeur par défaut si non valide
 * @returns {number|null} - Nombre normalisé
 */
const normalizeNumber = (value, defaultValue = null) => {
  if (value === null || value === undefined) return defaultValue;
  
  const num = Number(value);
  return !isNaN(num) ? num : defaultValue;
};

/**
 * Normalise un tableau
 * @param {Array|any} value - Valeur à normaliser
 * @param {Array} defaultValue - Valeur par défaut si non valide
 * @returns {Array} - Tableau normalisé
 */
const normalizeArray = (value, defaultValue = []) => {
  if (!Array.isArray(value)) return defaultValue;
  return value;
};

/**
 * Normalise une URL
 * @param {string|any} value - Valeur à normaliser
 * @param {string} defaultValue - Valeur par défaut si non valide
 * @returns {string} - URL normalisée
 */
const normalizeUrl = (value, defaultValue = '') => {
  const url = normalizeString(value, defaultValue);
  if (!url) return defaultValue;
  
  try {
    // Vérifier si l'URL est valide
    new URL(url);
    return url;
  } catch {
    // Essayer d'ajouter http:// si pas de protocole
    if (!url.match(/^https?:\/\//)) {
      try {
        new URL(`http://${url}`);
        return `http://${url}`;
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  }
};

/**
 * Normalise les informations de l'entreprise
 * @param {Object} company - Données de l'entreprise
 * @returns {Object} - Données normalisées
 */
const normalizeCompany = (company = {}) => ({
  name: normalizeString(company.name, ''),
  website: normalizeUrl(company.website, ''),
  logoUrl: normalizeUrl(company.logoUrl || company.logo_url, ''),
  location: normalizeString(company.location, ''),
  industry: normalizeString(company.industry, ''),
  size: normalizeString(company.size, ''),
});

/**
 * Normalise les informations de contrat
 * @param {Object} contract - Données du contrat
 * @returns {Object} - Données normalisées
 */
const normalizeContract = (contract = {}) => ({
  type: normalizeString(contract.type, ''),
  duration: normalizeNumber(contract.duration),
  workMode: normalizeString(contract.workMode || contract.work_mode, ''),
  salaryMin: normalizeNumber(contract.salaryMin || contract.salary_min),
  salaryMax: normalizeNumber(contract.salaryMax || contract.salary_max),
  currency: normalizeString(contract.currency, 'EUR'),
  benefits: normalizeArray(contract.benefits),
});

/**
 * Normalise les informations de candidature
 * @param {Object} applicationInfo - Données de candidature
 * @returns {Object} - Données normalisées
 */
const normalizeApplicationInfo = (applicationInfo = {}) => ({
  url: normalizeUrl(applicationInfo.url, ''),
  contactEmail: normalizeString(applicationInfo.contactEmail || applicationInfo.contact_email, ''),
  contactName: normalizeString(applicationInfo.contactName || applicationInfo.contact_name, ''),
  contactPhone: normalizeString(applicationInfo.contactPhone || applicationInfo.contact_phone, ''),
  deadline: applicationInfo.deadline || null,
});

/**
 * Normalise les métadonnées
 * @param {Object} metadata - Métadonnées
 * @returns {Object} - Données normalisées
 */
const normalizeMetadata = (metadata = {}) => ({
  source: normalizeString(metadata.source, ''),
  importedAt: metadata.importedAt || metadata.imported_at || new Date().toISOString(),
  lastUpdated: metadata.lastUpdated || metadata.last_updated || new Date().toISOString(),
  favorite: typeof metadata.favorite === 'boolean' ? metadata.favorite : false,
  notes: normalizeString(metadata.notes, ''),
  confidenceScore: normalizeNumber(metadata.confidenceScore || metadata.confidence_score, null),
});

/**
 * Normalise les données d'analyse
 * @param {Object} analysis - Données d'analyse
 * @returns {Object} - Données normalisées
 */
const normalizeAnalysis = (analysis = {}) => ({
  matchScore: normalizeNumber(analysis.matchScore || analysis.match_score, null),
  skillsMatch: normalizeArray(analysis.skillsMatch || analysis.skills_match).map(skill => ({
    name: normalizeString(skill.name, ''),
    score: normalizeNumber(skill.score, 0),
    category: normalizeString(skill.category, ''),
  })),
  missingSkills: normalizeArray(analysis.missingSkills || analysis.missing_skills),
  keywords: normalizeArray(analysis.keywords),
});

/**
 * Normalise toutes les données d'une offre d'emploi
 * @param {Object} jobOffer - Données brutes de l'offre d'emploi
 * @returns {Object} - Offre d'emploi normalisée
 */
export const normalizeJobOffer = (jobOffer = {}) => {
  if (!jobOffer || typeof jobOffer !== 'object') {
    return { ...DEFAULT_JOB_OFFER };
  }

  return {
    id: jobOffer.id || null,
    title: normalizeString(jobOffer.title, ''),
    company: normalizeCompany(jobOffer.company),
    status: normalizeString(jobOffer.status, 'active'),
    contract: normalizeContract(jobOffer.contract),
    description: normalizeString(jobOffer.description, ''),
    requirements: normalizeArray(jobOffer.requirements),
    responsibilities: normalizeArray(jobOffer.responsibilities),
    keySkills: normalizeArray(jobOffer.keySkills || jobOffer.key_skills),
    applicationInfo: normalizeApplicationInfo(jobOffer.applicationInfo || jobOffer.application_info),
    metadata: normalizeMetadata(jobOffer.metadata),
    analysis: normalizeAnalysis(jobOffer.analysis),
  };
};

/**
 * Extrait les compétences clés à partir de la description d'une offre d'emploi
 * @param {string} description - Description du poste
 * @param {string[]} existingSkills - Compétences déjà identifiées
 * @returns {string[]} - Liste de compétences potentielles
 */
export const extractSkillsFromDescription = (description, existingSkills = []) => {
  if (!description || typeof description !== 'string') return [];
  
  // Liste de compétences techniques courantes à rechercher
  const commonSkills = [
    'React', 'Angular', 'Vue.js', 'JavaScript', 'TypeScript', 'Node.js', 'Python',
    'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'AWS', 'Azure', 'Google Cloud',
    'Docker', 'Kubernetes', 'DevOps', 'CI/CD', 'Git', 'SQL', 'NoSQL', 'MongoDB',
    'PostgreSQL', 'MySQL', 'GraphQL', 'REST API', 'Redux', 'HTML', 'CSS', 'Sass',
    'LESS', 'Webpack', 'Babel', 'ESLint', 'Jest', 'Mocha', 'Cypress', 'Testing',
    'UI/UX', 'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Scrum', 'Agile',
    'Jira', 'Confluence', 'Kanban'
  ];
  
  // Recherche des compétences dans la description
  const foundSkills = new Set(existingSkills);
  
  commonSkills.forEach(skill => {
    // Recherche avec une regex qui respecte les limites de mots
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(description)) {
      foundSkills.add(skill);
    }
  });
  
  return [...foundSkills];
};

/**
 * Extraire et diviser une liste d'exigences ou de responsabilités
 * @param {string} text - Texte contenant des points sous forme de liste
 * @returns {string[]} - Tableau des points individuels
 */
export const extractListFromText = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  // Diviser par retours à la ligne et puces courantes
  const lines = text.split(/\r?\n/);
  const result = [];
  
  lines.forEach(line => {
    // Nettoyer la ligne
    const trimmed = line.trim();
    if (!trimmed) return;
    
    // Supprimer les puces courantes (-, •, *, etc.)
    const cleaned = trimmed.replace(/^[-•*⁃◦⦿⦾⨀⬤⚫⚪☐☑☒]|\d+\.\s*/, '').trim();
    
    if (cleaned) {
      result.push(cleaned);
    }
  });
  
  return result;
};

/**
 * Détecte si le texte semble être une offre d'emploi
 * @param {string} text - Texte à analyser
 * @returns {boolean} - Vrai si le texte semble être une offre d'emploi
 */
export const isLikelyJobOffer = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  // Mots-clés couramment trouvés dans les offres d'emploi
  const jobOfferKeywords = [
    'poste', 'emploi', 'offre', 'recrutement', 'candidature', 
    'expérience', 'compétences', 'qualifications', 'salaire',
    'responsabilités', 'missions', 'prérequis', 'profil recherché'
  ];
  
  // Vérifier la présence d'au moins quelques mots-clés
  const keywordCount = jobOfferKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  
  return keywordCount >= 3; // Seuil arbitraire
}; 
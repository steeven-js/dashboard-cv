/**
 * Types TypeScript pour les offres d'emploi
 * Utilisés pour définir la structure des données dans l'application
 */

/**
 * @typedef {Object} Company
 * @property {string} name - Nom de l'entreprise
 * @property {string} [website] - Site web de l'entreprise
 * @property {string} [logoUrl] - URL du logo de l'entreprise
 * @property {string} [location] - Localisation de l'entreprise
 * @property {string} [industry] - Secteur d'activité
 * @property {string} [size] - Taille de l'entreprise (nombre d'employés)
 */

/**
 * @typedef {Object} Contract
 * @property {string} type - Type de contrat (CDI, CDD, etc.)
 * @property {number|null} [duration] - Durée du contrat en mois (pour CDD)
 * @property {string} [workMode] - Mode de travail (présentiel, télétravail, hybride)
 * @property {number|null} [salaryMin] - Salaire minimum
 * @property {number|null} [salaryMax] - Salaire maximum
 * @property {string} [currency] - Devise du salaire
 * @property {string[]} [benefits] - Avantages proposés
 */

/**
 * @typedef {Object} ApplicationInfo
 * @property {string} [url] - URL pour postuler
 * @property {string} [contactEmail] - Email de contact
 * @property {string} [contactName] - Nom du contact
 * @property {string} [contactPhone] - Téléphone du contact
 * @property {string|null} [deadline] - Date limite de candidature
 */

/**
 * @typedef {Object} JobOfferMetadata
 * @property {string} [source] - Source de l'offre (site web, API, etc.)
 * @property {string|null} [importedAt] - Date d'importation
 * @property {string|null} [lastUpdated] - Date de dernière mise à jour
 * @property {boolean} [favorite] - Indique si l'offre est favorite
 * @property {string} [notes] - Notes personnelles sur l'offre
 * @property {number|null} [confidenceScore] - Score de confiance de l'analyse
 */

/**
 * @typedef {Object} SkillMatch
 * @property {string} name - Nom de la compétence
 * @property {number} score - Score de correspondance (0-1)
 * @property {string} [category] - Catégorie de la compétence
 */

/**
 * @typedef {Object} JobOfferAnalysis
 * @property {number|null} [matchScore] - Score global de correspondance avec le profil
 * @property {SkillMatch[]} [skillsMatch] - Compétences correspondantes
 * @property {string[]} [missingSkills] - Compétences manquantes
 * @property {string[]} [keywords] - Mots-clés extraits de l'offre
 */

/**
 * @typedef {Object} JobOffer
 * @property {string|null} id - Identifiant unique de l'offre
 * @property {string} title - Titre du poste
 * @property {Company} company - Informations sur l'entreprise
 * @property {string} status - Statut de l'offre (active, appliquée, etc.)
 * @property {Contract} contract - Informations sur le contrat
 * @property {string} description - Description du poste
 * @property {string[]} [requirements] - Prérequis pour le poste
 * @property {string[]} [responsibilities] - Responsabilités du poste
 * @property {string[]} [keySkills] - Compétences clés requises
 * @property {ApplicationInfo} [applicationInfo] - Informations pour postuler
 * @property {JobOfferMetadata} [metadata] - Métadonnées de l'offre
 * @property {JobOfferAnalysis} [analysis] - Analyse de l'offre
 */

/**
 * @typedef {Object} JobOfferImportResult
 * @property {boolean} success - Indique si l'importation a réussi
 * @property {JobOffer|null} data - Données de l'offre importée
 * @property {string|null} error - Message d'erreur en cas d'échec
 * @property {string[]} [warnings] - Avertissements lors de l'importation
 */

// Types d'exportation pour TypeScript (en commentaires pour JS)
/*
export type Company = {
  name: string;
  website?: string;
  logoUrl?: string;
  location?: string;
  industry?: string;
  size?: string;
};

export type Contract = {
  type: string;
  duration?: number | null;
  workMode?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
  benefits?: string[];
};

export type ApplicationInfo = {
  url?: string;
  contactEmail?: string;
  contactName?: string;
  contactPhone?: string;
  deadline?: string | null;
};

export type JobOfferMetadata = {
  source?: string;
  importedAt?: string | null;
  lastUpdated?: string | null;
  favorite?: boolean;
  notes?: string;
  confidenceScore?: number | null;
};

export type SkillMatch = {
  name: string;
  score: number;
  category?: string;
};

export type JobOfferAnalysis = {
  matchScore?: number | null;
  skillsMatch?: SkillMatch[];
  missingSkills?: string[];
  keywords?: string[];
};

export type JobOffer = {
  id: string | null;
  title: string;
  company: Company;
  status: string;
  contract: Contract;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  keySkills?: string[];
  applicationInfo?: ApplicationInfo;
  metadata?: JobOfferMetadata;
  analysis?: JobOfferAnalysis;
};

export type JobOfferImportResult = {
  success: boolean;
  data: JobOffer | null;
  error: string | null;
  warnings?: string[];
};
*/ 
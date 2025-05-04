import * as z from 'zod';

/**
 * Schéma de validation Zod pour les offres d'emploi
 * Définit les règles de validation pour les formulaires d'offres d'emploi
 */

// Schéma pour les informations sur l'entreprise
const CompanySchema = z.object({
  name: z.string().min(1, 'Le nom de l\'entreprise est requis').max(100),
  website: z.string().url('URL invalide').or(z.string().length(0)).optional(),
  logoUrl: z.string().url('URL invalide').or(z.string().length(0)).optional(),
  location: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  size: z.string().max(50).optional(),
});

// Schéma pour les informations de contrat
const ContractSchema = z.object({
  type: z.string().min(1, 'Le type de contrat est requis'),
  duration: z.number().int().nullable().optional(),
  workMode: z.string().optional(),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  currency: z.string().optional(),
  benefits: z.array(z.string()).optional(),
});

// Schéma pour les informations de candidature
const ApplicationInfoSchema = z.object({
  url: z.string().url('URL invalide').or(z.string().length(0)).optional(),
  contactEmail: z.string().email('Email invalide').or(z.string().length(0)).optional(),
  contactName: z.string().max(100).optional(),
  contactPhone: z.string().max(20).optional(),
  deadline: z.string().nullable().optional(),
});

// Schéma pour les métadonnées
const MetadataSchema = z.object({
  source: z.string().optional(),
  importedAt: z.string().nullable().optional(),
  lastUpdated: z.string().nullable().optional(),
  favorite: z.boolean().optional(),
  notes: z.string().optional(),
  confidenceScore: z.number().min(0).max(1).nullable().optional(),
});

// Schéma pour l'analyse
const AnalysisSchema = z.object({
  matchScore: z.number().min(0).max(1).nullable().optional(),
  skillsMatch: z.array(
    z.object({
      name: z.string(),
      score: z.number().min(0).max(1),
      category: z.string().optional(),
    })
  ).optional(),
  missingSkills: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
});

// Schéma principal pour l'offre d'emploi
export const JobOfferSchema = z.object({
  id: z.string().nullable().optional(),
  title: z.string().min(1, 'Le titre du poste est requis').max(200),
  company: CompanySchema,
  status: z.string().default('active'),
  contract: ContractSchema,
  description: z.string().min(1, 'La description est requise'),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  keySkills: z.array(z.string()).optional(),
  applicationInfo: ApplicationInfoSchema.optional(),
  metadata: MetadataSchema.optional(),
  analysis: AnalysisSchema.optional(),
});

/**
 * Valeurs par défaut pour une nouvelle offre d'emploi
 */
export const defaultJobOfferValues = {
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
  },
};

/**
 * Transforme les données du formulaire pour les adapter au format attendu par l'API
 * @param {Object} formData - Données du formulaire
 * @returns {Object} - Données formatées pour l'API
 */
export const transformJobOfferFormData = (formData) => ({
  id: formData.id,
  title: formData.title.trim(),
  company: {
    name: formData.company.name.trim(),
    website: formData.company.website,
    logo_url: formData.company.logoUrl,
    location: formData.company.location,
    industry: formData.company.industry,
    size: formData.company.size,
  },
  status: formData.status,
  contract: {
    type: formData.contract.type,
    duration: formData.contract.duration,
    work_mode: formData.contract.workMode,
    salary_min: formData.contract.salaryMin,
    salary_max: formData.contract.salaryMax,
    currency: formData.contract.currency,
    benefits: formData.contract.benefits || [],
  },
  description: formData.description,
  requirements: formData.requirements || [],
  responsibilities: formData.responsibilities || [],
  key_skills: formData.keySkills || [],
  application_info: {
    url: formData.applicationInfo?.url,
    contact_email: formData.applicationInfo?.contactEmail,
    contact_name: formData.applicationInfo?.contactName,
    contact_phone: formData.applicationInfo?.contactPhone,
    deadline: formData.applicationInfo?.deadline,
  },
  metadata: {
    source: formData.metadata?.source,
    imported_at: formData.metadata?.importedAt,
    last_updated: formData.metadata?.lastUpdated || new Date().toISOString(),
    favorite: formData.metadata?.favorite || false,
    notes: formData.metadata?.notes || '',
    confidence_score: formData.metadata?.confidenceScore,
  },
});

/**
 * Transforme les données de l'API pour les adapter au format attendu par le formulaire
 * @param {Object} apiData - Données de l'API
 * @returns {Object} - Données formatées pour le formulaire
 */
export const transformApiJobOfferData = (apiData) => {
  if (!apiData) return defaultJobOfferValues;
  
  return {
    id: apiData.id,
    title: apiData.title || '',
    company: {
      name: apiData.company?.name || '',
      website: apiData.company?.website || '',
      logoUrl: apiData.company?.logo_url || '',
      location: apiData.company?.location || '',
      industry: apiData.company?.industry || '',
      size: apiData.company?.size || '',
    },
    status: apiData.status || 'active',
    contract: {
      type: apiData.contract?.type || '',
      duration: apiData.contract?.duration || null,
      workMode: apiData.contract?.work_mode || '',
      salaryMin: apiData.contract?.salary_min || null,
      salaryMax: apiData.contract?.salary_max || null,
      currency: apiData.contract?.currency || 'EUR',
      benefits: apiData.contract?.benefits || [],
    },
    description: apiData.description || '',
    requirements: apiData.requirements || [],
    responsibilities: apiData.responsibilities || [],
    keySkills: apiData.key_skills || [],
    applicationInfo: {
      url: apiData.application_info?.url || '',
      contactEmail: apiData.application_info?.contact_email || '',
      contactName: apiData.application_info?.contact_name || '',
      contactPhone: apiData.application_info?.contact_phone || '',
      deadline: apiData.application_info?.deadline || null,
    },
    metadata: {
      source: apiData.metadata?.source || '',
      importedAt: apiData.metadata?.imported_at || null,
      lastUpdated: apiData.metadata?.last_updated || null,
      favorite: apiData.metadata?.favorite || false,
      notes: apiData.metadata?.notes || '',
      confidenceScore: apiData.metadata?.confidence_score || null,
    },
    analysis: apiData.analysis ? {
      matchScore: apiData.analysis.match_score || null,
      skillsMatch: (apiData.analysis.skills_match || []).map(skill => ({
        name: skill.name,
        score: skill.score,
        category: skill.category,
      })),
      missingSkills: apiData.analysis.missing_skills || [],
      keywords: apiData.analysis.keywords || [],
    } : undefined,
  };
}; 
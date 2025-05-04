import * as z from 'zod';

/**
 * Schéma de validation Zod pour les compétences techniques
 * Définit les règles de validation pour les formulaires de compétences
 */

export const SkillSchema = z.object({
  // Champ optionnel pour l'ID (présent lors de la mise à jour)
  id: z.string().uuid().optional(),
  
  // Nom de la compétence (obligatoire)
  name: z
    .string()
    .min(1, 'Le nom de la compétence est requis')
    .max(50, 'Le nom ne doit pas dépasser 50 caractères'),
  
  // Catégorie (obligatoire)
  category: z
    .string()
    .min(1, 'La catégorie est requise'),
  
  // Niveau de maîtrise (1-5)
  level: z
    .number()
    .int()
    .min(1, 'Le niveau minimum est 1')
    .max(5, 'Le niveau maximum est 5'),
  
  // Années d'expérience (valeur positive)
  yearsExperience: z
    .number()
    .min(0, 'La valeur doit être positive')
    .max(50, 'La valeur semble trop élevée'),
  
  // Tags (optionnels, tableau de chaînes)
  tags: z
    .array(z.string())
    .default([])
    .optional(),
  
  // Visibilité (booléen, par défaut true)
  visibility: z
    .boolean()
    .default(true),
  
  // Ordre d'affichage (optionnel, valeur numérique)
  displayOrder: z
    .number()
    .int()
    .nonnegative()
    .optional(),
});

/**
 * Type TypeScript dérivé du schéma Zod
 * Utilisable pour le typage des composants React
 */
export const skillType = SkillSchema.shape;

/**
 * Valeurs par défaut pour une nouvelle compétence
 */
export const defaultSkillValues = {
  name: '',
  category: '',
  level: 3,
  yearsExperience: 1,
  tags: [],
  visibility: true,
};

/**
 * Transforme les données du formulaire pour les adapter au format attendu par l'API
 * @param {Object} formData - Données du formulaire
 * @returns {Object} - Données formatées pour l'API
 */
export const transformSkillFormData = (formData) => ({
    id: formData.id,
    name: formData.name.trim(),
    category: formData.category,
    level: Number(formData.level),
    years_experience: Number(formData.yearsExperience),
    tags: formData.tags || [],
    visibility: Boolean(formData.visibility),
    display_order: formData.displayOrder || 0,
  });

/**
 * Transforme les données de l'API pour les adapter au format attendu par le formulaire
 * @param {Object} apiData - Données de l'API
 * @returns {Object} - Données formatées pour le formulaire
 */
export const transformApiSkillData = (apiData) => {
  if (!apiData) return defaultSkillValues;
  
  return {
    id: apiData.id,
    name: apiData.name || '',
    category: apiData.category || '',
    level: apiData.level || 3,
    yearsExperience: apiData.years_experience || 1,
    tags: apiData.tags || [],
    visibility: apiData.visibility !== undefined ? apiData.visibility : true,
    displayOrder: apiData.display_order || 0,
  };
}; 
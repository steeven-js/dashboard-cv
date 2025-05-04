import * as z from 'zod';

/**
 * Schéma de validation Zod pour les catégories de compétences
 * Définit les règles de validation pour les formulaires de catégories
 */

export const CategorySchema = z.object({
  // Champ optionnel pour l'ID (présent lors de la mise à jour)
  id: z.string().uuid().optional(),
  
  // Valeur de la catégorie (obligatoire)
  value: z
    .string()
    .min(1, 'La valeur de la catégorie est requise')
    .max(50, 'La valeur ne doit pas dépasser 50 caractères'),
  
  // Libellé de la catégorie (obligatoire)
  label: z
    .string()
    .min(1, 'Le libellé de la catégorie est requis')
    .max(50, 'Le libellé ne doit pas dépasser 50 caractères'),
  
  // Couleur (chaine de caractères correspondant aux couleurs MUI)
  color: z
    .string()
    .default('default'),
  
  // Icône (nom de l'icône Iconify)
  icon: z
    .string()
    .optional(),
  
  // Description (optionnelle)
  description: z
    .string()
    .max(200, 'La description ne doit pas dépasser 200 caractères')
    .optional(),
  
  // Parent (pour les sous-catégories)
  parentId: z
    .string()
    .uuid()
    .nullable()
    .optional(),
  
  // Ordre d'affichage
  displayOrder: z
    .number()
    .int()
    .nonnegative()
    .default(0),
    
  // Nombre de compétences associées (calculé, pas stocké)
  skillCount: z
    .number()
    .int()
    .nonnegative()
    .optional(),
});

/**
 * Type TypeScript dérivé du schéma Zod
 * Utilisable pour le typage des composants React
 */
export const categoryType = CategorySchema.shape;

/**
 * Valeurs par défaut pour une nouvelle catégorie
 */
export const defaultCategoryValues = {
  value: '',
  label: '',
  color: 'default',
  icon: 'mdi:folder-outline',
  description: '',
  parentId: null,
  displayOrder: 0,
  skillCount: 0,
};

/**
 * Transforme les données du formulaire pour les adapter au format attendu par l'API
 * @param {Object} formData - Données du formulaire
 * @returns {Object} - Données formatées pour l'API
 */
export const transformCategoryFormData = (formData) => ({
  id: formData.id,
  value: formData.value.trim(),
  label: formData.label.trim(),
  color: formData.color,
  icon: formData.icon,
  description: formData.description?.trim() || '',
  parent_id: formData.parentId,
  display_order: formData.displayOrder || 0,
});

/**
 * Transforme les données de l'API pour les adapter au format attendu par le formulaire
 * @param {Object} apiData - Données de l'API
 * @returns {Object} - Données formatées pour le formulaire
 */
export const transformApiCategoryData = (apiData) => {
  if (!apiData) return defaultCategoryValues;
  
  return {
    id: apiData.id,
    value: apiData.value || '',
    label: apiData.label || '',
    color: apiData.color || 'default',
    icon: apiData.icon || 'mdi:folder-outline',
    description: apiData.description || '',
    parentId: apiData.parent_id || null,
    displayOrder: apiData.display_order || 0,
    skillCount: apiData.skill_count || 0,
  };
}; 
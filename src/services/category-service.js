import { supabase } from 'src/lib/supabase';

import { transformApiCategoryData, transformCategoryFormData } from 'src/sections/cv/schemas/category-schema';

const TABLE_NAME = 'categories';

/**
 * Récupère toutes les catégories avec le nombre de compétences associées
 * @param {Object} options - Options de requête
 * @returns {Promise<Array>} - Tableau des catégories
 */
export async function getCategories(options = {}) {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        skillCount:skills!categories_id_fkey(count)
      `)
      .order('display_order', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    // Transformer les résultats
    return data.map((category) => ({
      ...transformApiCategoryData(category),
      skillCount: category.skillCount?.[0]?.count || 0,
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    throw error;
  }
}

/**
 * Récupère une catégorie par son ID
 * @param {string} id - ID de la catégorie
 * @returns {Promise<Object>} - Catégorie
 */
export async function getCategoryById(id) {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        skillCount:skills!categories_id_fkey(count)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Transformer le résultat
    return {
      ...transformApiCategoryData(data),
      skillCount: data.skillCount?.[0]?.count || 0,
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération de la catégorie ${id}:`, error);
    throw error;
  }
}

/**
 * Crée une nouvelle catégorie
 * @param {Object} category - Données de la catégorie
 * @returns {Promise<Object>} - Catégorie créée
 */
export async function createCategory(category) {
  try {
    // Transformer les données du formulaire pour le format API
    const apiData = transformCategoryFormData(category);
    
    // Récupérer le nombre total de catégories pour déterminer l'ordre par défaut si non spécifié
    if (apiData.display_order === 0) {
      const { count } = await supabase
        .from(TABLE_NAME)
        .select('*', { count: 'exact', head: true });
      
      apiData.display_order = count || 0;
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(apiData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return transformApiCategoryData(data);
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    throw error;
  }
}

/**
 * Met à jour une catégorie existante
 * @param {string} id - ID de la catégorie
 * @param {Object} category - Données mises à jour
 * @returns {Promise<Object>} - Catégorie mise à jour
 */
export async function updateCategory(id, category) {
  try {
    // Transformer les données du formulaire pour le format API
    const apiData = transformCategoryFormData(category);

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(apiData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return transformApiCategoryData(data);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la catégorie ${id}:`, error);
    throw error;
  }
}

/**
 * Supprime une catégorie
 * @param {string} id - ID de la catégorie
 * @returns {Promise<void>}
 */
export async function deleteCategory(id) {
  try {
    // Vérifier d'abord s'il existe des compétences liées à cette catégorie
    const { count, error: countError } = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countError) {
      throw new Error(countError.message);
    }

    // Si des compétences sont liées, ne pas supprimer
    if (count > 0) {
      throw new Error(`Impossible de supprimer la catégorie: ${count} compétence(s) associée(s)`);
    }

    // Vérifier s'il existe des sous-catégories
    const { count: childCount, error: childCountError } = await supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', id);

    if (childCountError) {
      throw new Error(childCountError.message);
    }

    // Si des sous-catégories sont liées, ne pas supprimer
    if (childCount > 0) {
      throw new Error(`Impossible de supprimer la catégorie: ${childCount} sous-catégorie(s) associée(s)`);
    }

    // Procéder à la suppression
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression de la catégorie ${id}:`, error);
    throw error;
  }
}

/**
 * Réorganise les catégories
 * @param {Array} categoryIds - Tableau d'IDs dans le nouvel ordre
 * @returns {Promise<void>}
 */
export async function reorderCategories(categoryIds) {
  try {
    // Créer un tableau de promesses pour mettre à jour chaque catégorie
    const updates = categoryIds.map((id, index) => 
      supabase
        .from(TABLE_NAME)
        .update({ display_order: index })
        .eq('id', id)
    );

    // Exécuter toutes les mises à jour en parallèle
    await Promise.all(updates);
  } catch (error) {
    console.error('Erreur lors de la réorganisation des catégories:', error);
    throw error;
  }
} 
import { useState, useEffect, useCallback } from 'react';

import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  reorderCategories 
} from 'src/services/category-service';

import { useSnackbar } from 'src/components/snackbar';

/**
 * Hook personnalisé pour gérer les catégories de compétences
 * @returns {Object} - Données et fonctions pour gérer les catégories
 */
export function useCategories() {
  const { enqueueSnackbar } = useSnackbar();
  
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour charger les catégories
  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des catégories');
      enqueueSnackbar('Erreur lors du chargement des catégories', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar]);

  // Charger les catégories au montage du composant
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Fonction pour ajouter une catégorie
  const addCategory = useCallback(async (categoryData) => {
    try {
      setIsLoading(true);
      const newCategory = await createCategory(categoryData);
      
      setCategories((prevCategories) => [...prevCategories, newCategory]);
      enqueueSnackbar('Catégorie ajoutée avec succès', { variant: 'success' });
      
      return newCategory;
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'ajout de la catégorie');
      enqueueSnackbar('Erreur lors de l\'ajout de la catégorie', { variant: 'error' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar]);

  // Fonction pour mettre à jour une catégorie
  const editCategory = useCallback(async (categoryData) => {
    try {
      setIsLoading(true);
      const { id, ...data } = categoryData;
      
      const updatedCategory = await updateCategory(id, data);
      
      setCategories((prevCategories) => 
        prevCategories.map((cat) => 
          cat.id === id ? { ...cat, ...updatedCategory } : cat
        )
      );
      
      enqueueSnackbar('Catégorie mise à jour avec succès', { variant: 'success' });
      return updatedCategory;
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour de la catégorie');
      enqueueSnackbar('Erreur lors de la mise à jour de la catégorie', { variant: 'error' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar]);

  // Fonction pour supprimer une catégorie
  const removeCategory = useCallback(async (id) => {
    try {
      setIsLoading(true);
      await deleteCategory(id);
      
      setCategories((prevCategories) => 
        prevCategories.filter((cat) => cat.id !== id)
      );
      
      enqueueSnackbar('Catégorie supprimée avec succès', { variant: 'success' });
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression de la catégorie');
      enqueueSnackbar(err.message || 'Erreur lors de la suppression de la catégorie', { variant: 'error' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar]);

  // Fonction pour réorganiser les catégories
  const reorderCategoryList = useCallback(async (newOrder) => {
    try {
      setIsLoading(true);
      
      // Mettre à jour l'UI immédiatement pour une expérience plus fluide
      const orderedCategories = newOrder.map((id) => 
        categories.find((cat) => cat.id === id)
      );
      
      setCategories(orderedCategories);
      
      // Puis envoyer la mise à jour au serveur
      await reorderCategories(newOrder);
      
      enqueueSnackbar('Ordre des catégories mis à jour', { variant: 'success' });
    } catch (err) {
      setError(err.message || 'Erreur lors de la réorganisation des catégories');
      enqueueSnackbar('Erreur lors de la réorganisation des catégories', { variant: 'error' });
      
      // En cas d'erreur, recharger les catégories pour retrouver l'état correct
      loadCategories();
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [categories, enqueueSnackbar, loadCategories]);

  // Fonction pour récupérer une catégorie par sa valeur
  const getCategoryByValue = useCallback((value) => 
    categories.find((cat) => cat.value === value) || null
  , [categories]);
  
  // Fonction pour récupérer une catégorie par son ID
  const getCategoryById = useCallback((id) => 
    categories.find((cat) => cat.id === id) || null
  , [categories]);

  // Obtenir les catégories racines (sans parent)
  const getRootCategories = useCallback(() => 
    categories.filter((cat) => !cat.parentId)
  , [categories]);

  // Obtenir les sous-catégories d'une catégorie
  const getChildCategories = useCallback((parentId) => 
    categories.filter((cat) => cat.parentId === parentId)
  , [categories]);

  return {
    categories,
    isLoading,
    error,
    addCategory,
    editCategory,
    removeCategory,
    reorderCategoryList,
    loadCategories,
    getCategoryByValue,
    getCategoryById,
    getRootCategories,
    getChildCategories,
  };
} 
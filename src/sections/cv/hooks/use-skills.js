import { useMemo, useContext, useCallback } from 'react';

import { SKILL_LEVELS, SKILL_CATEGORIES, getFilteredSkillSuggestions } from 'src/data/skill-model';

import { SkillsContext } from '../context/skills-context';
import { defaultSkillValues } from '../schemas/skill-schema';

/**
 * Hook personnalisé pour manipuler les compétences techniques
 * Fournit une interface simplifiée pour utiliser le contexte des compétences
 */
export function useSkills() {
  const context = useContext(SkillsContext);

  if (!context) {
    throw new Error('useSkills doit être utilisé à l\'intérieur d\'un SkillsProvider');
  }

  // Destructurer les valeurs du contexte
  const {
    skills,
    loading,
    error,
    initialized,
    addSkill,
    updateSkill,
    removeSkill,
    reorderSkills,
    getSkillsByCategory,
    refreshSkills,
    handleError,
    resetContext,
  } = context;

  // Total des compétences
  const totalSkills = useMemo(() => skills.length, [skills]);

  // Compétences groupées par catégorie
  const skillsByCategory = useMemo(() => {
    const grouped = {};
    
    SKILL_CATEGORIES.forEach(category => {
      grouped[category.value] = skills.filter(skill => skill.category === category.value);
    });
    
    return grouped;
  }, [skills]);

  // Comptage par catégorie
  const categoryCounts = useMemo(() => {
    const counts = {};
    
    skills.forEach(skill => {
      if (!counts[skill.category]) {
        counts[skill.category] = 0;
      }
      counts[skill.category] += 1;
    });
    
    return counts;
  }, [skills]);

  // Niveau moyen des compétences
  const averageSkillLevel = useMemo(() => {
    if (!skills.length) return 0;
    
    const sum = skills.reduce((acc, skill) => acc + skill.level, 0);
    return (sum / skills.length).toFixed(1);
  }, [skills]);

  // Créer une nouvelle compétence
  const createSkill = useCallback(async (skillData) => {
    try {
      // Utiliser les valeurs par défaut pour les champs manquants
      const newSkill = { ...defaultSkillValues, ...skillData };
      return await addSkill(newSkill);
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [addSkill, handleError]);

  // Modifier une compétence existante
  const editSkill = useCallback(async (skillData) => {
    try {
      if (!skillData.id) {
        throw new Error('ID de compétence manquant');
      }
      return await updateSkill(skillData);
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [updateSkill, handleError]);

  // Trouver une compétence par ID
  const findSkillById = useCallback((skillId) => skills.find(skill => skill.id === skillId) || null, [skills]);

  // Supprimer une compétence
  const deleteSkill = useCallback(async (skillId) => {
    try {
      return await removeSkill(skillId);
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [removeSkill, handleError]);

  // Réorganiser les compétences (par glisser-déposer)
  const reorderSkillsList = useCallback(async (newOrderedSkills) => {
    try {
      return await reorderSkills(newOrderedSkills);
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [reorderSkills, handleError]);

  // Rechercher des compétences avec auto-complétion
  const searchSkills = useCallback((query, category = null) => {
    if (!query || query.length < 2) return [];
    
    return getFilteredSkillSuggestions(query, category);
  }, []);

  // Obtenir les catégories disponibles
  const getCategories = useCallback(() => SKILL_CATEGORIES, []);

  // Obtenir les niveaux disponibles
  const getLevels = useCallback(() => SKILL_LEVELS, []);

  // Compétences visibles uniquement (pour l'affichage du CV)
  const visibleSkills = useMemo(() => skills.filter(skill => skill.visibility), [skills]);

  // Retourner toutes les fonctions et valeurs utiles
  return {
    // État
    skills,
    visibleSkills,
    loading,
    error,
    initialized,
    totalSkills,
    skillsByCategory,
    categoryCounts,
    averageSkillLevel,
    
    // Actions
    createSkill,
    editSkill,
    deleteSkill,
    findSkillById,
    getSkillsByCategory,
    reorderSkillsList,
    refreshSkills,
    searchSkills,
    getCategories,
    getLevels,
    resetContext,
  };
} 
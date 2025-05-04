import { v4 as uuidv4 } from 'uuid';

import { supabase } from 'src/lib/supabase';

// Préfixe pour la clé de cache
const SKILLS_CACHE_KEY = 'technical_skills';

// Cache local pour éviter des appels répétés à l'API
const memoryCache = {};

/**
 * Gère la mise en cache des requêtes
 * @param {string} key - Clé de cache
 * @param {Function} fetchFunction - Fonction pour récupérer les données
 * @param {number} expiryTime - Temps d'expiration en ms (par défaut 5 min)
 * @returns {Promise<any>} Données récupérées ou depuis le cache
 */
const cachedQuery = async (key, fetchFunction, expiryTime = 5 * 60 * 1000) => {
  const now = new Date().getTime();
  const cacheKey = `cv_${key}`;
  
  // Vérifier si les données sont en cache et valides
  if (memoryCache[cacheKey] && memoryCache[cacheKey].expiry > now) {
    return memoryCache[cacheKey].data;
  }
  
  // Récupérer des données fraîches
  const data = await fetchFunction();
  
  // Stocker dans le cache
  memoryCache[cacheKey] = {
    data,
    expiry: now + expiryTime,
  };
  
  return data;
};

/**
 * Invalide l'entrée du cache des compétences
 */
const invalidateSkillsCache = () => {
  const cacheKey = `cv_${SKILLS_CACHE_KEY}`;
  delete memoryCache[cacheKey];
};

/**
 * Gère la réponse de Supabase et extrait les données
 * @param {Function} queryFn - Fonction de requête Supabase
 * @returns {Promise<any>} Données extraites
 */
const handleSupabaseResponse = async (queryFn) => {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      console.error('Erreur Supabase:', error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la requête:', error);
    throw error;
  }
};

/**
 * Récupère toutes les compétences techniques de l'utilisateur
 * @returns {Promise<Array>} Liste des compétences
 */
export const getAllSkills = async () => cachedQuery(
  SKILLS_CACHE_KEY,
  async () => {
    // Récupérer les données depuis Supabase
    const data = await handleSupabaseResponse(
      () => supabase
        .from('technical_skills')
        .select('*')
        .order('display_order', { ascending: true })
    );
    
    // Si pas de données dans Supabase, essayer de récupérer l'ordre depuis le localStorage
    if (data && data.length > 0) {
      return data;
    }
    
    try {
      const savedOrder = localStorage.getItem('cv_technical_skills_order');
      if (savedOrder) {
        const orderArray = JSON.parse(savedOrder);
        
        // Créer un map pour l'ordre des compétences
        const orderMap = new Map();
        orderArray.forEach((id, index) => {
          orderMap.set(id, index);
        });
        
        // Trier les données en fonction de l'ordre sauvegardé
        return data.sort((a, b) => {
          const orderA = orderMap.has(a.id) ? orderMap.get(a.id) : Number.MAX_SAFE_INTEGER;
          const orderB = orderMap.has(b.id) ? orderMap.get(b.id) : Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'ordre:', error);
    }
    
    // Retourner les données non triées si pas d'ordre sauvegardé
    return data;
  }
);

/**
 * Récupère une compétence spécifique par son ID
 * @param {string} skillId - ID de la compétence à récupérer
 * @returns {Promise<Object|null>} La compétence trouvée ou null
 */
export const getSkillById = async (skillId) => {
  // D'abord essayer de récupérer depuis le cache
  const cachedSkills = memoryCache[`cv_${SKILLS_CACHE_KEY}`]?.data;
  
  if (cachedSkills) {
    const skill = cachedSkills.find(s => s.id === skillId);
    if (skill) return skill;
  }
  
  // Sinon faire une requête spécifique
  return handleSupabaseResponse(
    () => supabase
      .from('technical_skills')
      .select('*')
      .eq('id', skillId)
      .single()
  );
};

/**
 * Crée ou met à jour une compétence technique
 * @param {Object} skill - Données de la compétence
 * @returns {Promise<Object>} Compétence sauvegardée
 */
export const saveSkill = async (skill) => {
  const { user } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Utilisateur non authentifié');
  
  // Déterminer si c'est une création ou une mise à jour
  const isUpdate = !!skill.id;
  
  // Préparer les données à sauvegarder
  const skillData = {
    ...skill,
    user_id: user.id,
    id: isUpdate ? skill.id : uuidv4(),
    updated_at: new Date(),
  };
  
  // Si création, récupérer l'ordre d'affichage maximal
  if (!isUpdate) {
    const skills = await getAllSkills();
    const displayOrder = skills.length > 0 
      ? Math.max(...skills.map(s => s.display_order || 0)) + 1 
      : 0;
    
    skillData.display_order = displayOrder;
    skillData.created_at = new Date();
  }
  
  const result = await handleSupabaseResponse(
    () => supabase
      .from('technical_skills')
      .upsert(skillData)
      .select()
      .single()
  );
  
  // Invalider le cache après mise à jour
  invalidateSkillsCache();
  
  return result;
};

/**
 * Supprime une compétence technique
 * @param {string} skillId - ID de la compétence à supprimer
 * @returns {Promise<void>}
 */
export const deleteSkill = async (skillId) => {
  await handleSupabaseResponse(
    () => supabase
      .from('technical_skills')
      .delete()
      .eq('id', skillId)
  );
  
  // Invalider le cache après suppression
  invalidateSkillsCache();
};

/**
 * Met à jour l'ordre d'affichage des compétences
 * @param {Array} skills - Liste ordonnée des compétences
 * @returns {Promise<void>}
 */
export const updateSkillsOrder = async (skills) => {
  // Sauvegarder l'ordre dans le localStorage pour performance
  try {
    const orderArray = skills.map(skill => skill.id);
    localStorage.setItem('cv_technical_skills_order', JSON.stringify(orderArray));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'ordre dans localStorage:', error);
  }
  
  // Mettre à jour l'ordre dans Supabase
  const updates = skills.map((skill, index) => ({
    id: skill.id,
    display_order: index
  }));
  
  // Mise à jour en batch
  await handleSupabaseResponse(
    () => supabase
      .from('technical_skills')
      .upsert(updates)
  );
  
  // Invalider le cache
  invalidateSkillsCache();
};

/**
 * Filtre les compétences par catégorie
 * @param {string} category - Catégorie à filtrer
 * @returns {Promise<Array>} Compétences filtrées
 */
export const getSkillsByCategory = async (category) => {
  const skills = await getAllSkills();
  return skills.filter(skill => skill.category === category);
};

/**
 * Obtient des statistiques sur les compétences (nombre par catégorie, niveaux moyens, etc.)
 * @returns {Promise<Object>} Statistiques sur les compétences
 */
export const getSkillsStatistics = async () => {
  const skills = await getAllSkills();
  
  // Initialiser les statistiques
  const statistics = {
    totalCount: skills.length,
    categoryCounts: {},
    averageLevel: 0,
    highestLevelSkills: [],
    mostExperiencedSkills: []
  };
  
  // Pas de compétences
  if (skills.length === 0) {
    return statistics;
  }
  
  // Calculer les statistiques
  let totalLevel = 0;
  
  // Compter par catégorie
  skills.forEach(skill => {
    // Compter par catégorie
    if (!statistics.categoryCounts[skill.category]) {
      statistics.categoryCounts[skill.category] = 0;
    }
    statistics.categoryCounts[skill.category] += 1;
    
    // Ajouter au niveau total
    totalLevel += skill.level || 0;
  });
  
  // Calculer le niveau moyen
  statistics.averageLevel = totalLevel / skills.length;
  
  // Trouver les compétences de plus haut niveau
  const sortedByLevel = [...skills].sort((a, b) => (b.level || 0) - (a.level || 0));
  statistics.highestLevelSkills = sortedByLevel.slice(0, 5);
  
  // Trouver les compétences avec le plus d'expérience
  const sortedByExperience = [...skills].sort((a, b) => (b.years_experience || 0) - (a.years_experience || 0));
  statistics.mostExperiencedSkills = sortedByExperience.slice(0, 5);
  
  return statistics;
}; 
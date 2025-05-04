import { v4 as uuidv4 } from 'uuid';

import { supabase } from 'src/lib/supabase';

/**
 * Service pour gérer les données du CV dans Supabase
 */

// Tables à utiliser dans Supabase - suppression des variables commentées
// Bucket de stockage pour les avatars
const STORAGE_BUCKET = 'dashboard-cv';

// Préfixes pour les clés de cache
const CACHE_KEYS = {
  PERSONAL_INFO: 'personalInfo',
  SKILLS: 'skills',
  EXPERIENCES: 'experiences',
  PROJECTS: 'projects',
  EDUCATION: 'education',
};

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
 * Invalide une entrée du cache
 * @param {string} key - Clé de cache à invalider
 */
const invalidateCache = (key) => {
  const cacheKey = `cv_${key}`;
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
 * Convertit les clés d'un objet du camelCase vers le snake_case
 * @param {Object} obj - L'objet à convertir
 * @returns {Object} - L'objet avec les clés en snake_case
 */
// Commenté car non utilisé
// const toSnakeCase = (obj) => {
//   const result = {};
//   Object.keys(obj).forEach(key => {
//     // Conversion de camelCase vers snake_case
//     const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
//     result[snakeKey] = obj[key];
//   });
//   return result;
// };

/**
 * Convertit les clés d'un objet du snake_case vers le camelCase
 * @param {Object} obj - L'objet à convertir
 * @returns {Object} - L'objet avec les clés en camelCase
 */
// Commenté car non utilisé
// const toCamelCase = (obj) => {
//   if (!obj) return null;
//   
//   const result = {};
//   Object.keys(obj).forEach(key => {
//     // Conversion de snake_case vers camelCase
//     const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
//     result[camelKey] = obj[key];
//   });
//   return result;
// };

/**
 * Récupère les informations personnelles de l'utilisateur
 * @returns {Promise<Object>} Données personnelles
 */
export const getPersonalInfo = async () => cachedQuery(
    CACHE_KEYS.PERSONAL_INFO,
    async () => handleSupabaseResponse(
      () => supabase.from('personal_info').select('*').single()
    )
  );

/**
 * Sauvegarde les informations personnelles de l'utilisateur
 * @param {Object} data - Données à sauvegarder
 * @returns {Promise<Object>} Données sauvegardées
 */
export const savePersonalInfo = async (data) => {
  const { user } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Utilisateur non authentifié');
  
  const result = await handleSupabaseResponse(
    () => supabase.from('personal_info').upsert(
      {
        user_id: user.id,
        ...data,
        updated_at: new Date(),
      },
      { onConflict: 'user_id' }
    ).select().single()
  );
  
  // Invalider le cache après mise à jour
  invalidateCache(CACHE_KEYS.PERSONAL_INFO);
  
  return result;
};

/**
 * Récupère les compétences techniques de l'utilisateur
 * @returns {Promise<Array>} Liste des compétences
 */
export const getTechnicalSkills = async () => cachedQuery(
    CACHE_KEYS.SKILLS,
    async () => {
      // Récupérer les données depuis Supabase
      const data = await handleSupabaseResponse(
        () => supabase
          .from('technical_skills')
          .select('*')
      );
      
      // Récupérer l'ordre depuis le localStorage
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
 * Sauvegarde une compétence technique
 * @param {Object} skill - Données de la compétence
 * @returns {Promise<Object>} Compétence sauvegardée
 */
export const saveTechnicalSkill = async (skill) => {
  const { user } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Utilisateur non authentifié');
  
  // Déterminer si c'est une création ou une mise à jour
  const isUpdate = !!skill.id;
  
  // Si création, récupérer l'ordre d'affichage maximal
  let displayOrder = 0;
  
  if (!isUpdate) {
    const skills = await getTechnicalSkills();
    displayOrder = skills.length > 0 
      ? Math.max(...skills.map(s => s.display_order || 0)) + 1 
      : 0;
  }
  
  const result = await handleSupabaseResponse(
    () => supabase.from('technical_skills').upsert(
      {
        user_id: user.id,
        ...skill,
        display_order: isUpdate ? skill.display_order : displayOrder,
        updated_at: new Date(),
      },
      { onConflict: 'id' }
    ).select().single()
  );
  
  // Invalider le cache après mise à jour
  invalidateCache(CACHE_KEYS.SKILLS);
  
  return result;
};

/**
 * Supprime une compétence technique
 * @param {string} skillId - ID de la compétence à supprimer
 * @returns {Promise<void>}
 */
export const deleteTechnicalSkill = async (skillId) => {
  await handleSupabaseResponse(
    () => supabase.from('technical_skills').delete().eq('id', skillId)
  );
  
  // Invalider le cache après suppression
  invalidateCache(CACHE_KEYS.SKILLS);
};

/**
 * Met à jour l'ordre d'affichage des compétences
 * @param {Array} skills - Liste des compétences avec leur nouvel ordre
 * @returns {Promise<void>}
 */
export const updateTechnicalSkillsOrder = async (skills) => {
  if (!skills || skills.length === 0) return;
  
  // Stocker l'ordre dans le localStorage seulement
  try {
    localStorage.setItem('cv_technical_skills_order', JSON.stringify(skills.map(skill => skill.id)));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'ordre:', error);
  }
  
  // Invalider le cache pour forcer un rechargement
  invalidateCache(CACHE_KEYS.SKILLS);
};

/**
 * Récupère les expériences professionnelles de l'utilisateur
 * @returns {Promise<Array>} Liste des expériences
 */
export const getExperiences = async () => cachedQuery(
    CACHE_KEYS.EXPERIENCES,
    async () => {
      // Récupérer les données depuis Supabase
      const data = await handleSupabaseResponse(
        () => supabase
          .from('experiences')
          .select('*')
      );
      
      // Par défaut, on trie par date de début (la plus récente en premier)
      const sortedByDate = [...data].sort((a, b) => {
        // Si l'une des expériences est en cours, elle doit apparaître en premier
        if (a.current && !b.current) return -1;
        if (!a.current && b.current) return 1;
        
        return new Date(b.start_date || 0) - new Date(a.start_date || 0);
      });
      
      // Récupérer l'ordre depuis le localStorage
      try {
        const savedOrder = localStorage.getItem('cv_experiences_order');
        if (savedOrder) {
          const orderArray = JSON.parse(savedOrder);
          
          // Créer un map pour l'ordre des expériences
          const orderMap = new Map();
          orderArray.forEach((id, index) => {
            orderMap.set(id, index);
          });
          
          // Trier les données en fonction de l'ordre sauvegardé
          return sortedByDate.sort((a, b) => {
            const orderA = orderMap.has(a.id) ? orderMap.get(a.id) : Number.MAX_SAFE_INTEGER;
            const orderB = orderMap.has(b.id) ? orderMap.get(b.id) : Number.MAX_SAFE_INTEGER;
            return orderA - orderB;
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'ordre des expériences:', error);
      }
      
      // Retourner les données triées par date si pas d'ordre sauvegardé
      return sortedByDate;
    }
  );

/**
 * Sauvegarde une expérience professionnelle
 * @param {Object} experience - Données de l'expérience
 * @returns {Promise<Object>} Expérience sauvegardée
 */
export const saveExperience = async (experience) => {
  const { user } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Utilisateur non authentifié');
  
  const result = await handleSupabaseResponse(
    () => supabase.from('experiences').upsert(
      {
        user_id: user.id,
        ...experience,
        updated_at: new Date(),
      },
      { onConflict: 'id' }
    ).select().single()
  );
  
  // Invalider le cache après mise à jour
  invalidateCache(CACHE_KEYS.EXPERIENCES);
  
  return result;
};

/**
 * Supprime une expérience professionnelle
 * @param {string} experienceId - ID de l'expérience à supprimer
 * @returns {Promise<void>}
 */
export const deleteExperience = async (experienceId) => {
  await handleSupabaseResponse(
    () => supabase.from('experiences').delete().eq('id', experienceId)
  );
  
  // Invalider le cache après suppression
  invalidateCache(CACHE_KEYS.EXPERIENCES);
};

/**
 * Récupère les projets personnels de l'utilisateur
 * @returns {Promise<Array>} Liste des projets
 */
export const getPersonalProjects = async () => cachedQuery(
    CACHE_KEYS.PROJECTS,
    async () => {
      // Récupérer les données depuis Supabase
      const data = await handleSupabaseResponse(
        () => supabase
          .from('personal_projects')
          .select('*')
      );
      
      // Par défaut, on trie par date de début (la plus récente en premier)
      const sortedByDate = [...data].sort((a, b) => new Date(b.start_date || 0) - new Date(a.start_date || 0));
      
      // Récupérer l'ordre depuis le localStorage
      try {
        const savedOrder = localStorage.getItem('cv_projects_order');
        if (savedOrder) {
          const orderArray = JSON.parse(savedOrder);
          
          // Créer un map pour l'ordre des projets
          const orderMap = new Map();
          orderArray.forEach((id, index) => {
            orderMap.set(id, index);
          });
          
          // Trier les données en fonction de l'ordre sauvegardé
          return sortedByDate.sort((a, b) => {
            const orderA = orderMap.has(a.id) ? orderMap.get(a.id) : Number.MAX_SAFE_INTEGER;
            const orderB = orderMap.has(b.id) ? orderMap.get(b.id) : Number.MAX_SAFE_INTEGER;
            return orderA - orderB;
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'ordre des projets:', error);
      }
      
      // Retourner les données triées par date si pas d'ordre sauvegardé
      return sortedByDate;
    }
  );

/**
 * Sauvegarde un projet personnel
 * @param {Object} project - Données du projet
 * @returns {Promise<Object>} Projet sauvegardé
 */
export const savePersonalProject = async (project) => {
  const { user } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Utilisateur non authentifié');
  
  const result = await handleSupabaseResponse(
    () => supabase.from('personal_projects').upsert(
      {
        user_id: user.id,
        ...project,
        updated_at: new Date(),
      },
      { onConflict: 'id' }
    ).select().single()
  );
  
  // Invalider le cache après mise à jour
  invalidateCache(CACHE_KEYS.PROJECTS);
  
  return result;
};

/**
 * Supprime un projet personnel
 * @param {string} projectId - ID du projet à supprimer
 * @returns {Promise<void>}
 */
export const deletePersonalProject = async (projectId) => {
  await handleSupabaseResponse(
    () => supabase.from('personal_projects').delete().eq('id', projectId)
  );
  
  // Invalider le cache après suppression
  invalidateCache(CACHE_KEYS.PROJECTS);
};

/**
 * Récupère les formations et diplômes de l'utilisateur
 * @returns {Promise<Array>} Liste des formations
 */
export const getEducation = async () => cachedQuery(
    CACHE_KEYS.EDUCATION,
    async () => {
      // Récupérer les données depuis Supabase
      const data = await handleSupabaseResponse(
        () => supabase
          .from('education')
          .select('*')
      );
      
      // Par défaut, on trie par date de fin (la plus récente en premier)
      const sortedByDate = [...data].sort((a, b) => new Date(b.end_date || 0) - new Date(a.end_date || 0));
      
      // Récupérer l'ordre depuis le localStorage
      try {
        const savedOrder = localStorage.getItem('cv_education_order');
        if (savedOrder) {
          const orderArray = JSON.parse(savedOrder);
          
          // Créer un map pour l'ordre des formations
          const orderMap = new Map();
          orderArray.forEach((id, index) => {
            orderMap.set(id, index);
          });
          
          // Trier les données en fonction de l'ordre sauvegardé
          return sortedByDate.sort((a, b) => {
            const orderA = orderMap.has(a.id) ? orderMap.get(a.id) : Number.MAX_SAFE_INTEGER;
            const orderB = orderMap.has(b.id) ? orderMap.get(b.id) : Number.MAX_SAFE_INTEGER;
            return orderA - orderB;
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'ordre des formations:', error);
      }
      
      // Retourner les données triées par date si pas d'ordre sauvegardé
      return sortedByDate;
    }
  );

/**
 * Sauvegarde une formation ou diplôme
 * @param {Object} education - Données de la formation
 * @returns {Promise<Object>} Formation sauvegardée
 */
export const saveEducation = async (education) => {
  const { user } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Utilisateur non authentifié');
  
  const result = await handleSupabaseResponse(
    () => supabase.from('education').upsert(
      {
        user_id: user.id,
        ...education,
        updated_at: new Date(),
      },
      { onConflict: 'id' }
    ).select().single()
  );
  
  // Invalider le cache après mise à jour
  invalidateCache(CACHE_KEYS.EDUCATION);
  
  return result;
};

/**
 * Supprime une formation ou diplôme
 * @param {string} educationId - ID de la formation à supprimer
 * @returns {Promise<void>}
 */
export const deleteEducation = async (educationId) => {
  await handleSupabaseResponse(
    () => supabase.from('education').delete().eq('id', educationId)
  );
  
  // Invalider le cache après suppression
  invalidateCache(CACHE_KEYS.EDUCATION);
};

/**
 * Met à jour l'ordre d'affichage des formations
 * @param {Array} educationItems - Liste des formations avec leur nouvel ordre
 * @returns {Promise<void>}
 */
export const updateEducationOrder = async (educationItems) => {
  if (!educationItems || educationItems.length === 0) return;
  
  // Stocker l'ordre dans le localStorage seulement
  try {
    localStorage.setItem('cv_education_order', JSON.stringify(educationItems.map(edu => edu.id)));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'ordre des formations:', error);
  }
  
  // Invalider le cache pour forcer un rechargement
  invalidateCache(CACHE_KEYS.EDUCATION);
};

/**
 * Met à jour l'ordre d'affichage des expériences professionnelles
 * @param {Array} experiencesItems - Liste des expériences avec leur nouvel ordre
 * @returns {Promise<void>}
 */
export const updateExperiencesOrder = async (experiencesItems) => {
  if (!experiencesItems || experiencesItems.length === 0) return;
  
  // Stocker l'ordre dans le localStorage seulement
  try {
    localStorage.setItem('cv_experiences_order', JSON.stringify(experiencesItems.map(exp => exp.id)));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'ordre des expériences:', error);
  }
  
  // Invalider le cache pour forcer un rechargement
  invalidateCache(CACHE_KEYS.EXPERIENCES);
};

/**
 * Met à jour l'ordre d'affichage des projets personnels
 * @param {Array} projectItems - Liste des projets avec leur nouvel ordre
 * @returns {Promise<void>}
 */
export const updatePersonalProjectsOrder = async (projectItems) => {
  if (!projectItems || projectItems.length === 0) return;
  
  // Stocker l'ordre dans le localStorage seulement
  try {
    localStorage.setItem('cv_projects_order', JSON.stringify(projectItems.map(project => project.id)));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'ordre des projets:', error);
  }
  
  // Invalider le cache pour forcer un rechargement
  invalidateCache(CACHE_KEYS.PROJECTS);
};

/**
 * Télécharge une capture d'écran pour un projet personnel
 * @param {File} file - Fichier image à télécharger
 * @returns {Promise<Object>} Informations sur la capture d'écran téléchargée
 */
export const uploadProjectScreenshot = async (file) => {
  const { user } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Utilisateur non authentifié');
  
  // Générer un nom de fichier unique
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${uuidv4()}.${fileExt}`;
  const filePath = `projects/${fileName}`;
  
  // Télécharger le fichier dans le storage de Supabase
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) {
    console.error('Erreur lors du téléchargement:', error);
    throw new Error(`Erreur lors du téléchargement: ${error.message}`);
  }
  
  // Récupérer l'URL publique du fichier
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);
  
  // Retourner les informations sur la capture d'écran
  return {
    id: uuidv4(),
    url: publicUrl,
    name: file.name,
    path: filePath,
  };
};

/**
 * Supprime une capture d'écran d'un projet personnel
 * @param {string} filePath - Chemin du fichier à supprimer
 * @returns {Promise<void>}
 */
export const deleteProjectScreenshot = async (filePath) => {
  const { user } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Utilisateur non authentifié');
  
  // Vérifier que le chemin contient l'ID de l'utilisateur pour empêcher la suppression non autorisée
  if (!filePath.includes(user.id)) {
    throw new Error('Autorisation insuffisante pour supprimer ce fichier');
  }
  
  // Supprimer le fichier du storage de Supabase
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([filePath]);
  
  if (error) {
    console.error('Erreur lors de la suppression:', error);
    throw new Error(`Erreur lors de la suppression: ${error.message}`);
  }
};

/**
 * Vérifie la cohérence des données à travers les sections
 * @returns {Promise<Object>} Rapport de validation
 */
export const validateCrossFormData = async () => {
  try {
    // Récupérer toutes les données
    const [personalInfo, skills, experiences, projects, education] = await Promise.all([
      getPersonalInfo(),
      getTechnicalSkills(),
      getExperiences(),
      getPersonalProjects(),
      getEducation(),
    ]);
    
    const issues = [];
    
    // Vérifier les compétences mentionnées dans les expériences
    if (experiences && skills) {
      const skillNames = skills.map(s => s.name.toLowerCase());
      
      experiences.forEach(exp => {
        if (exp.technologies && Array.isArray(exp.technologies)) {
          exp.technologies.forEach(tech => {
            if (!skillNames.includes(tech.toLowerCase())) {
              issues.push({
                section: 'experiences',
                item: exp.id,
                issue: `La compétence "${tech}" mentionnée dans l'expérience "${exp.title}" n'existe pas dans vos compétences techniques.`,
                type: 'missing_skill',
                suggestion: 'Ajoutez cette compétence à votre liste de compétences techniques.',
              });
            }
          });
        }
      });
    }
    
    // Vérifier les compétences mentionnées dans les projets
    if (projects && skills) {
      const skillNames = skills.map(s => s.name.toLowerCase());
      
      projects.forEach(proj => {
        if (proj.technologies && Array.isArray(proj.technologies)) {
          proj.technologies.forEach(tech => {
            if (!skillNames.includes(tech.toLowerCase())) {
              issues.push({
                section: 'projects',
                item: proj.id,
                issue: `La compétence "${tech}" mentionnée dans le projet "${proj.name}" n'existe pas dans vos compétences techniques.`,
                type: 'missing_skill',
                suggestion: 'Ajoutez cette compétence à votre liste de compétences techniques.',
              });
            }
          });
        }
      });
    }
    
    // Vérifier la cohérence des dates
    if (experiences) {
      experiences.forEach(exp => {
        if (exp.end_date && new Date(exp.start_date) > new Date(exp.end_date)) {
          issues.push({
            section: 'experiences',
            item: exp.id,
            issue: `Dans l'expérience "${exp.title}", la date de début est postérieure à la date de fin.`,
            type: 'date_inconsistency',
            suggestion: 'Corrigez les dates pour assurer leur cohérence chronologique.',
          });
        }
      });
    }
    
    if (projects) {
      projects.forEach(proj => {
        if (proj.end_date && new Date(proj.start_date) > new Date(proj.end_date)) {
          issues.push({
            section: 'projects',
            item: proj.id,
            issue: `Dans le projet "${proj.name}", la date de début est postérieure à la date de fin.`,
            type: 'date_inconsistency',
            suggestion: 'Corrigez les dates pour assurer leur cohérence chronologique.',
          });
        }
      });
    }
    
    if (education) {
      education.forEach(edu => {
        if (edu.end_date && new Date(edu.start_date) > new Date(edu.end_date)) {
          issues.push({
            section: 'education',
            item: edu.id,
            issue: `Dans la formation "${edu.degree}", la date de début est postérieure à la date de fin.`,
            type: 'date_inconsistency',
            suggestion: 'Corrigez les dates pour assurer leur cohérence chronologique.',
          });
        }
      });
    }
    
    return {
      valid: issues.length === 0,
      issues,
      data: {
        personalInfo,
        skills,
        experiences,
        projects,
        education,
      }
    };
  } catch (error) {
    console.error('Erreur lors de la validation transversale:', error);
    throw error;
  }
};

/**
 * Génère des suggestions intelligentes basées sur les données existantes
 * @returns {Promise<Object>} Suggestions pour améliorer le CV
 */
export const generateIntelligentSuggestions = async () => {
  try {
    const [personalInfo, skills, experiences, projects, education] = await Promise.all([
      getPersonalInfo(),
      getTechnicalSkills(),
      getExperiences(),
      getPersonalProjects(),
      getEducation(),
    ]);
    
    const suggestions = [];
    
    // Suggestions pour les infos personnelles
    if (personalInfo) {
      if (!personalInfo.summary || personalInfo.summary.length < 100) {
        suggestions.push({
          section: 'personalInfo',
          type: 'improvement',
          issue: 'Votre résumé professionnel est trop court ou inexistant.',
          suggestion: 'Ajoutez un résumé professionnel de 3-5 phrases mettant en avant votre expertise et vos objectifs.',
        });
      }
      
      if (!personalInfo.linkedin) {
        suggestions.push({
          section: 'personalInfo',
          type: 'missing_info',
          issue: 'Aucun profil LinkedIn n\'est renseigné.',
          suggestion: 'Ajoutez votre profil LinkedIn pour permettre aux recruteurs de vous contacter facilement.',
        });
      }
    }
    
    // Suggestions pour les compétences
    if (skills) {
      if (skills.length < 5) {
        suggestions.push({
          section: 'skills',
          type: 'improvement',
          issue: 'Vous avez peu de compétences techniques listées.',
          suggestion: 'Ajoutez au moins 5-10 compétences techniques pertinentes pour votre domaine.',
        });
      }
      
      const highLevelSkills = skills.filter(s => s.level >= 4);
      if (highLevelSkills.length < 3) {
        suggestions.push({
          section: 'skills',
          type: 'improvement',
          issue: 'Vous avez peu de compétences de niveau avancé/expert.',
          suggestion: 'Identifiez vos compétences les plus fortes et mettez-les en valeur avec un niveau approprié.',
        });
      }
    }
    
    // Suggestions pour les expériences
    if (experiences) {
      if (experiences.length === 0) {
        suggestions.push({
          section: 'experiences',
          type: 'missing_info',
          issue: 'Aucune expérience professionnelle n\'est renseignée.',
          suggestion: 'Ajoutez vos expériences professionnelles, même les stages et emplois à temps partiel.',
        });
      } else {
        experiences.forEach(exp => {
          if (!exp.description || exp.description.length < 100) {
            suggestions.push({
              section: 'experiences',
              item: exp.id,
              type: 'improvement',
              issue: `La description de votre expérience "${exp.title}" est trop courte.`,
              suggestion: 'Détaillez davantage vos responsabilités et réalisations (3-5 points).',
            });
          }
          
          if (!exp.technologies || exp.technologies.length === 0) {
            suggestions.push({
              section: 'experiences',
              item: exp.id,
              type: 'missing_info',
              issue: `Aucune technologie n'est mentionnée pour votre expérience "${exp.title}".`,
              suggestion: 'Ajoutez les technologies et outils utilisés pendant cette expérience.',
            });
          }
        });
      }
    }
    
    // Retourner les suggestions avec les données
    return {
      suggestions,
      data: {
        personalInfo,
        skills,
        experiences,
        projects,
        education,
      }
    };
  } catch (error) {
    console.error('Erreur lors de la génération de suggestions:', error);
    throw error;
  }
}; 
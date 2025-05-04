import { v4 as uuidv4 } from 'uuid';

import { supabase } from 'src/lib/supabase';

/**
 * Service pour gérer les données du CV dans Supabase
 */

// Tables à utiliser dans Supabase
const CV_TABLE = 'personal_info';
const TECH_SKILLS_TABLE = 'technical_skills';
const EXPERIENCES_TABLE = 'experiences';
const PERSONAL_PROJECTS_TABLE = 'personal_projects';
const EDUCATION_TABLE = 'education';
// Bucket de stockage pour les avatars
const STORAGE_BUCKET = 'dashboard-cv';

/**
 * Convertit les clés d'un objet du camelCase vers le snake_case
 * @param {Object} obj - L'objet à convertir
 * @returns {Object} - L'objet avec les clés en snake_case
 */
const toSnakeCase = (obj) => {
  const result = {};
  Object.keys(obj).forEach(key => {
    // Conversion de camelCase vers snake_case
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  });
  return result;
};

/**
 * Convertit les clés d'un objet du snake_case vers le camelCase
 * @param {Object} obj - L'objet à convertir
 * @returns {Object} - L'objet avec les clés en camelCase
 */
const toCamelCase = (obj) => {
  if (!obj) return null;
  
  const result = {};
  Object.keys(obj).forEach(key => {
    // Conversion de snake_case vers camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  });
  return result;
};

/**
 * Sauvegarde les informations personnelles dans Supabase
 * @param {Object} personalInfo - Les informations personnelles à sauvegarder
 * @returns {Promise<Object>} - Le résultat de l'opération
 */
export const savePersonalInfo = async (personalInfo) => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    // Convertir les données en snake_case pour Supabase
    const personalInfoSnakeCase = toSnakeCase(personalInfo);
    
    // Traiter le champ avatarUrl spécifiquement pour éviter le conflit de nommage avec la colonne photo_url
    if ('avatar_url' in personalInfoSnakeCase) {
      // On supprime avatar_url car la colonne n'existe pas dans la base de données
      delete personalInfoSnakeCase.avatar_url;
    }
    
    // Extraire la photo de l'objet pour la traiter séparément
    // On ne l'envoie pas directement dans la base de données
    const { ...dataToSave } = personalInfoSnakeCase;
    
    // Vérifier si l'utilisateur a déjà des informations personnelles
    const { data: existingData } = await supabase
      .from(CV_TABLE)
      .select('*')
      .eq('user_id', userId)
      .single();
    
    let result;
    
    if (existingData) {
      // Mise à jour des données existantes
      result = await supabase
        .from(CV_TABLE)
        .update({
          ...dataToSave,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } else {
      // Insertion de nouvelles données
      result = await supabase
        .from(CV_TABLE)
        .insert({
          user_id: userId,
          ...dataToSave,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    }
    
    if (result.error) {
      throw result.error;
    }
    
    // Gestion de l'avatar (champ avatarUrl du formulaire)
    // L'avatar peut être:
    // 1. Un fichier (objet File) : à téléverser
    // 2. Une URL (string) : déjà téléversé, ne rien faire
    // 3. null/undefined : supprimer l'avatar existant si nécessaire
    
    // Cas 1: Un nouveau fichier a été sélectionné via le composant UploadAvatar
    if (personalInfo.avatarUrl instanceof File) {
      console.log("Téléversement d'un nouvel avatar:", personalInfo.avatarUrl.name);
      
      const fileExt = personalInfo.avatarUrl.name.split('.').pop().toLowerCase();
      const fileName = `avatars/${userId}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, personalInfo.avatarUrl, {
          upsert: true,
          contentType: personalInfo.avatarUrl.type,
        });
      
      if (uploadError) {
        console.error('Erreur lors du téléversement de l\'avatar:', uploadError);
        throw uploadError;
      }
      
      // Obtenir l'URL publique de l'avatar
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);
      
      console.log('Avatar téléversé avec succès, URL:', urlData.publicUrl);
      
      // Mettre à jour l'URL de la photo dans la base de données
      const { error: updateError } = await supabase
        .from(CV_TABLE)
        .update({ photo_url: urlData.publicUrl })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Erreur lors de la mise à jour de l\'URL de l\'avatar:', updateError);
        throw updateError;
      }
      
    // Cas 3: L'avatar a été supprimé
    } else if (!personalInfo.avatarUrl && existingData?.photo_url) {
      console.log('Suppression de l\'avatar existant');
      
      // 1. Supprimer le fichier du stockage si possible
      try {
        // Extraire le nom du fichier depuis l'URL
        // Format de l'URL: https://domain/storage/v1/object/dashboard-cv/avatars/user-id/avatar.ext
        const pathMatch = existingData.photo_url.match(/\/storage\/v1\/object\/[^/]+\/(.+)$/);
        const filePath = pathMatch ? pathMatch[1] : null;
        
        if (filePath) {
          const { error: deleteError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([filePath]);
          
          if (deleteError) {
            console.warn('Erreur lors de la suppression du fichier avatar:', deleteError);
          }
        }
      } catch (deleteError) {
        console.warn('Erreur lors de l\'analyse du chemin de l\'avatar:', deleteError);
        // On continue même si la suppression du fichier échoue
      }
      
      // 2. Mettre photo_url à null dans la base de données
      const { error: updateError } = await supabase
        .from(CV_TABLE)
        .update({ photo_url: null })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Erreur lors de la mise à jour de l\'URL de l\'avatar:', updateError);
        throw updateError;
      }
    }
    // Cas 2: Si avatarUrl est une string, c'est l'URL existante, on ne fait rien
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des informations personnelles:', error);
    throw error;
  }
};

/**
 * Récupère les informations personnelles depuis Supabase
 * @returns {Promise<Object>} - Les informations personnelles
 */
export const getPersonalInfo = async () => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    const { data, error } = await supabase
      .from(CV_TABLE)
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      throw error;
    }
    
    // Convertir les données de snake_case vers camelCase
    const personalInfo = toCamelCase(data) || {};
    
    // Mapper photo_url vers avatarUrl pour la compatibilité avec le formulaire
    // S'assurer que avatarUrl est défini même si photoUrl est null
    personalInfo.avatarUrl = personalInfo.photoUrl || null;
    
    console.log('Données récupérées de Supabase:', personalInfo);
    
    return personalInfo;
  } catch (error) {
    console.error('Erreur lors de la récupération des informations personnelles:', error);
    throw error;
  }
};

/**
 * Récupère les compétences techniques depuis Supabase
 * @returns {Promise<Array>} - Les compétences techniques
 */
export const getTechnicalSkills = async () => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    const { data, error } = await supabase
      .from(TECH_SKILLS_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // Convertir les données de snake_case vers camelCase
    const skills = data ? data.map(skill => {
      const camelCaseSkill = toCamelCase(skill);
      return {
        ...camelCaseSkill,
        // S'assurer que les tags sont un tableau même si null dans la base
        tags: camelCaseSkill.tags || [],
      };
    }) : [];
    
    console.log('Compétences récupérées de Supabase:', skills);
    
    return skills;
  } catch (error) {
    console.error('Erreur lors de la récupération des compétences techniques:', error);
    throw error;
  }
};

/**
 * Sauvegarde une compétence technique dans Supabase
 * @param {Object} skill - La compétence à sauvegarder
 * @returns {Promise<Object>} - Le résultat de l'opération
 */
export const saveTechnicalSkill = async (skill) => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    // Convertir les données en snake_case pour Supabase
    let skillSnakeCase = toSnakeCase(skill);
    
    // Ajouter l'ID utilisateur et les dates
    skillSnakeCase = {
      ...skillSnakeCase,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };
    
    let result;
    
    if (skill.id) {
      // Mise à jour d'une compétence existante
      result = await supabase
        .from(TECH_SKILLS_TABLE)
        .update(skillSnakeCase)
        .eq('id', skill.id)
        .eq('user_id', userId);
    } else {
      // Insertion d'une nouvelle compétence
      skillSnakeCase.created_at = new Date().toISOString();
      result = await supabase
        .from(TECH_SKILLS_TABLE)
        .insert(skillSnakeCase);
    }
    
    if (result.error) {
      throw result.error;
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la compétence technique:', error);
    throw error;
  }
};

/**
 * Supprime une compétence technique dans Supabase
 * @param {string} skillId - L'ID de la compétence à supprimer
 * @returns {Promise<Object>} - Le résultat de l'opération
 */
export const deleteTechnicalSkill = async (skillId) => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    const { error } = await supabase
      .from(TECH_SKILLS_TABLE)
      .delete()
      .eq('id', skillId)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression de la compétence technique:', error);
    throw error;
  }
};

/**
 * Met à jour l'ordre des compétences techniques dans Supabase
 * @param {Array} skills - Les compétences avec leur ordre actualisé
 * @returns {Promise<Object>} - Le résultat de l'opération
 */
export const updateTechnicalSkillsOrder = async (skills) => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    // Créer un tableau de promesses pour mettre à jour chaque compétence
    const updatePromises = skills.map((skill, index) => {
      const { id } = skill;
      return supabase
        .from(TECH_SKILLS_TABLE)
        .update({ 
          order_index: index,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', userId);
    });
    
    // Exécuter toutes les mises à jour en parallèle
    const results = await Promise.all(updatePromises);
    
    // Vérifier s'il y a des erreurs
    const errors = results.filter(result => result.error).map(result => result.error);
    
    if (errors.length > 0) {
      throw new Error(`Erreurs lors de la mise à jour de l'ordre: ${JSON.stringify(errors)}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ordre des compétences:', error);
    throw error;
  }
};

/**
 * Récupère les expériences professionnelles de l'utilisateur
 * @returns {Promise<Array>} - La liste des expériences
 */
export const getExperiences = async () => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    let data, error;
    
    try {
      // Essayer d'abord avec le tri par date de début
      ({ data, error } = await supabase
        .from(EXPERIENCES_TABLE)
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false }));
    } catch (sortError) {
      console.warn('Erreur lors du tri par start_date:', sortError);
      
      // Fallback: récupérer sans tri
      ({ data, error } = await supabase
        .from(EXPERIENCES_TABLE)
        .select('*')
        .eq('user_id', userId));
    }
    
    if (error) {
      throw error;
    }
    
    // Convertir les données en camelCase pour le client
    return data ? data.map(item => toCamelCase(item)) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des expériences:', error);
    throw error;
  }
};

/**
 * Sauvegarde une expérience professionnelle dans Supabase
 * @param {Object} experience - L'expérience à sauvegarder
 * @returns {Promise<Object>} - Le résultat de l'opération
 */
export const saveExperience = async (experience) => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    // Convertir les données en snake_case pour Supabase
    let experienceSnakeCase = toSnakeCase(experience);
    
    // Vérifier et corriger les champs de date
    if (experienceSnakeCase.start_date === '') {
      experienceSnakeCase.start_date = null; // Utiliser NULL au lieu d'une chaîne vide
    }
    
    if (experienceSnakeCase.end_date === '') {
      experienceSnakeCase.end_date = null; // Utiliser NULL au lieu d'une chaîne vide
    }
    
    // Ajouter l'ID utilisateur et les dates
    experienceSnakeCase = {
      ...experienceSnakeCase,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };
    
    let result;
    
    if (experience.id) {
      // Mise à jour d'une expérience existante
      result = await supabase
        .from(EXPERIENCES_TABLE)
        .update(experienceSnakeCase)
        .eq('id', experience.id)
        .eq('user_id', userId);
    } else {
      // Insertion d'une nouvelle expérience
      experienceSnakeCase.created_at = new Date().toISOString();
      
      // Déterminer l'ordre maximum actuel
      try {
        const { data: maxOrderData } = await supabase
          .from(EXPERIENCES_TABLE)
          .select('order')
          .eq('user_id', userId)
          .order('order', { ascending: false })
          .limit(1);
        
        const maxOrder = maxOrderData && maxOrderData.length > 0 ? maxOrderData[0].order || 0 : 0;
        experienceSnakeCase.order = maxOrder + 1;
      } catch (orderError) {
        console.warn('La colonne order pourrait ne pas exister:', orderError);
        // Ne pas inclure le champ order si la colonne n'existe pas encore
        delete experienceSnakeCase.order;
      }
      
      result = await supabase
        .from(EXPERIENCES_TABLE)
        .insert(experienceSnakeCase);
    }
    
    if (result.error) {
      throw result.error;
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'expérience:', error);
    throw error;
  }
};

/**
 * Supprime une expérience professionnelle
 * @param {string} experienceId - L'identifiant de l'expérience à supprimer
 * @returns {Promise<Object>} - Le résultat de l'opération
 */
export const deleteExperience = async (experienceId) => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    const { error } = await supabase
      .from(EXPERIENCES_TABLE)
      .delete()
      .eq('id', experienceId)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'expérience:', error);
    throw error;
  }
};

/**
 * Met à jour l'ordre des expériences professionnelles
 * @param {Array} experienceOrders - Tableau d'objets contenant id et order
 * @returns {Promise<Object>} - Le résultat de l'opération
 */
export const updateExperiencesOrder = async (experienceOrders) => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    // Vérifier que la colonne 'order' existe
    try {
      // Tentative de récupération avec tri par order pour vérifier si la colonne existe
      await supabase
        .from(EXPERIENCES_TABLE)
        .select('id')
        .eq('user_id', userId)
        .order('order', { ascending: true })
        .limit(1);
    } catch (columnError) {
      console.warn('La colonne order pourrait ne pas exister:', columnError);
      // Attendre un peu de temps avant de continuer
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Récupérer les expériences existantes pour les mettre à jour individuellement
      const { data: existingExperiences } = await supabase
        .from(EXPERIENCES_TABLE)
        .select('id')
        .eq('user_id', userId);
      
      if (existingExperiences && existingExperiences.length > 0) {
        // Mettre à jour chaque expérience individuellement sans utiliser la colonne order
        const updatePromises = experienceOrders.map(({ id, order }) => supabase
            .from(EXPERIENCES_TABLE)
            .update({ updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId));
        
        await Promise.all(updatePromises);
        return { success: true, message: 'Mise à jour sans colonne order' };
      }
      
      return { success: false, message: 'Impossible de mettre à jour l\'ordre (colonne manquante)' };
    }
    
    // La colonne order existe, procéder normalement
    // Utiliser une transaction Supabase pour mettre à jour toutes les positions
    const updates = experienceOrders.map(({ id, order }) => ({
      id,
      order,
      user_id: userId,
      updated_at: new Date().toISOString(),
    }));
    
    const { error } = await supabase.from(EXPERIENCES_TABLE).upsert(updates);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ordre des expériences:', error);
    throw error;
  }
};

// Projets personnels
export const getPersonalProjects = async () => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    const { data, error } = await supabase
      .from(PERSONAL_PROJECTS_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('order', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // Convertir les données en camelCase pour le client
    return data ? data.map(project => {
      const camelCaseProject = toCamelCase(project);
      
      // Conversion des dates si nécessaire
      if (camelCaseProject.startDate) {
        camelCaseProject.startDate = new Date(camelCaseProject.startDate);
      }
      
      if (camelCaseProject.endDate) {
        camelCaseProject.endDate = new Date(camelCaseProject.endDate);
      }
      
      return camelCaseProject;
    }) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    throw error;
  }
};

export const savePersonalProject = async (projectData) => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    // Extraire les propriétés pertinentes et ignorer screenshots
    const { id, name, role, description, technologies, url, tags, startDate, endDate, isOngoing, visibility, order } = projectData;
    const projectDataToSave = { name, role, description, technologies, url, tags, startDate, endDate, isOngoing, visibility, order };
    
    // Convertir les données en snake_case pour Supabase
    let projectSnakeCase = toSnakeCase(projectDataToSave);
    
    // Ajouter l'ID utilisateur et les dates
    projectSnakeCase = {
      ...projectSnakeCase,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };
    
    let result;
    
    if (id) {
      // Mise à jour d'un projet existant
      result = await supabase
        .from(PERSONAL_PROJECTS_TABLE)
        .update(projectSnakeCase)
        .eq('id', id)
        .eq('user_id', userId);
    } else {
      // Insertion d'un nouveau projet
      projectSnakeCase.created_at = new Date().toISOString();
      
      // Déterminer l'ordre maximum actuel
      try {
        const { data: maxOrderData } = await supabase
          .from(PERSONAL_PROJECTS_TABLE)
          .select('order')
          .eq('user_id', userId)
          .order('order', { ascending: false })
          .limit(1);
        
        const maxOrder = maxOrderData && maxOrderData.length > 0 ? maxOrderData[0].order || 0 : 0;
        projectSnakeCase.order = maxOrder + 1;
      } catch (orderError) {
        console.warn('La colonne order pourrait ne pas exister:', orderError);
        // Utiliser le timestamp actuel comme ordre par défaut si la colonne order n'existe pas
        projectSnakeCase.order = Date.now();
      }
      
      result = await supabase
        .from(PERSONAL_PROJECTS_TABLE)
        .insert(projectSnakeCase);
    }
    
    if (result.error) {
      throw result.error;
    }
    
    // Pour les nouveaux projets, récupérer l'ID généré
    let savedProject = { id: id || null, ...projectDataToSave };
    
    if (!id && result.data) {
      // Récupérer l'ID du projet nouvellement créé
      const { data: newProject } = await supabase
        .from(PERSONAL_PROJECTS_TABLE)
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (newProject && newProject.length > 0) {
        savedProject.id = newProject[0].id;
      }
    }
    
    return savedProject;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du projet:', error);
    throw error;
  }
};

export const deletePersonalProject = async (projectId) => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    const { error } = await supabase
      .from(PERSONAL_PROJECTS_TABLE)
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error);
    throw error;
  }
};

export const updatePersonalProjectsOrder = async (projects) => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    // Créer un tableau de promesses pour mettre à jour chaque projet
    const updatePromises = projects.map((project, index) => supabase
        .from(PERSONAL_PROJECTS_TABLE)
        .update({ 
          order: index,
          updated_at: new Date().toISOString() 
        })
        .eq('id', project.id)
        .eq('user_id', userId));
    
    // Exécuter toutes les mises à jour en parallèle
    const results = await Promise.all(updatePromises);
    
    // Vérifier s'il y a des erreurs
    const errors = results.filter(result => result.error).map(result => result.error);
    
    if (errors.length > 0) {
      throw new Error(`Erreurs lors de la mise à jour de l'ordre: ${JSON.stringify(errors)}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ordre des projets:', error);
    throw error;
  }
};

export const uploadProjectScreenshot = async (file) => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const fileName = `project-screenshots/${userId}/${fileId}.${fileExtension}`;
    
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      });
    
    if (uploadError) {
      throw uploadError;
    }
    
    // Obtenir l'URL publique de la capture d'écran
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);
    
    return {
      id: fileId,
      url: urlData.publicUrl,
      name: file.name,
      path: fileName,
    };
  } catch (error) {
    console.error('Erreur lors de l\'upload de la capture d\'écran:', error);
    throw error;
  }
};

export const deleteProjectScreenshot = async (screenshotPath) => {
  try {
    const { error: deleteError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([screenshotPath]);
    
    if (deleteError) {
      throw deleteError;
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la capture d\'écran:', error);
    throw error;
  }
};

/**
 * Récupère les formations et diplômes depuis Supabase
 * @returns {Promise<Array>} - Les formations et diplômes
 */
export const getEducation = async () => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    const { data, error } = await supabase
      .from(EDUCATION_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('order', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // Convertir les données de snake_case vers camelCase
    return data ? data.map(item => toCamelCase(item)) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des formations:', error);
    throw error;
  }
};

/**
 * Sauvegarde une formation/diplôme dans Supabase
 * @param {Object} education - La formation/diplôme à sauvegarder
 * @returns {Promise<Object>} - Le résultat de l'opération
 */
export const saveEducation = async (education) => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    // Convertir les données en snake_case pour Supabase
    const educationSnakeCase = toSnakeCase(education);
    
    let result;
    
    // Si l'ID est fourni, mettre à jour l'enregistrement existant
    if (education.id) {
      console.log(`Mise à jour de la formation: ${education.id}`);
      
      result = await supabase
        .from(EDUCATION_TABLE)
        .update({
          ...educationSnakeCase,
          updated_at: new Date().toISOString(),
        })
        .eq('id', education.id);
    } else {
      console.log('Création d\'une nouvelle formation');
      
      // Génération d'un nouvel ID
      const newId = uuidv4();
      
      // Récupérer le nombre total de formations pour déterminer l'ordre
      const { data: existingEducation } = await supabase
        .from(EDUCATION_TABLE)
        .select('id')
        .eq('user_id', userId);
      
      const order = existingEducation ? existingEducation.length : 0;
      
      result = await supabase
        .from(EDUCATION_TABLE)
        .insert({
          id: newId,
          user_id: userId,
          ...educationSnakeCase,
          order,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    }
    
    if (result.error) {
      throw result.error;
    }
    
    return { success: true, id: education.id || result.data?.[0]?.id };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la formation:', error);
    throw error;
  }
};

/**
 * Supprime une formation/diplôme de Supabase
 * @param {string} educationId - L'ID de la formation à supprimer
 * @returns {Promise<Object>} - Le résultat de l'opération
 */
export const deleteEducation = async (educationId) => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    const { error } = await supabase
      .from(EDUCATION_TABLE)
      .delete()
      .eq('id', educationId)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression de la formation:', error);
    throw error;
  }
};

/**
 * Met à jour l'ordre des formations dans Supabase
 * @param {Array} educationOrders - Tableau des formations avec leur ordre
 * @returns {Promise<Object>} - Le résultat de l'opération
 */
export const updateEducationOrder = async (educationOrders) => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    // Filtrer les items sans ID valide pour éviter les erreurs
    const validItems = educationOrders.filter(item => item && item.id);
    
    if (validItems.length === 0) {
      console.warn('Aucun élément valide à mettre à jour');
      return { success: false, message: 'Aucun élément valide' };
    }
    
    // Créer un tableau de promesses pour les mises à jour d'ordre
    const updatePromises = validItems.map((item, index) => 
      supabase
        .from(EDUCATION_TABLE)
        .update({ 
          order: index,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)
        .eq('user_id', userId)
    );
    
    // Exécuter toutes les mises à jour en parallèle
    const results = await Promise.all(updatePromises);
    
    // Vérifier s'il y a des erreurs
    const errors = results.filter(result => result.error).map(result => result.error);
    
    if (errors.length > 0) {
      console.error('Erreurs lors de la mise à jour de l\'ordre:', errors);
      throw new Error(`${errors.length} erreurs lors de la mise à jour de l'ordre`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ordre des formations:', error);
    throw error;
  }
}; 
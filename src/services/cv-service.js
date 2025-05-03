import { supabase } from 'src/lib/supabase';

/**
 * Service pour gérer les données du CV dans Supabase
 */

// Tables à utiliser dans Supabase
const CV_TABLE = 'personal_info';
const TECH_SKILLS_TABLE = 'technical_skills';
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
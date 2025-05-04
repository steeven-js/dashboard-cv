import { supabase } from 'src/lib/supabase';

import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

// Délai en ms avant de déclencher la sauvegarde automatique
const AUTO_SAVE_DELAY = 2000;

/**
 * Hook pour gérer la sauvegarde automatique des données
 * @param {Object} options - Options de configuration
 * @param {String} options.tableName - Nom de la table Supabase
 * @param {Function} options.onSuccess - Callback en cas de succès
 * @param {Function} options.onError - Callback en cas d'erreur
 * @returns {Object} - Fonctions de sauvegarde et état
 */
export function createAutoSaveService({ tableName, onSuccess, onError }) {
  let timeoutId = null;
  let isSaving = false;

  /**
   * Annule le timeout de sauvegarde en cours
   */
  const cancelPendingSave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  /**
   * Sauvegarde les données immédiatement
   * @param {Object} data - Données à sauvegarder
   * @returns {Promise} - Promesse avec le résultat de la sauvegarde
   */
  const saveNow = async (data) => {
    if (!data || !tableName) {
      return { error: new Error('Données ou nom de table manquants') };
    }

    isSaving = true;

    try {
      // Si l'ID est présent, on met à jour l'enregistrement existant
      if (data.id) {
        const { data: savedData, error } = await supabase
          .from(tableName)
          .update(data)
          .eq('id', data.id)
          .select()
          .single();

        isSaving = false;

        if (error) throw error;
        if (onSuccess) onSuccess(savedData);
        
        return { data: savedData };
      } 
      // Sinon, on crée un nouvel enregistrement
      else {
        const { data: savedData, error } = await supabase
          .from(tableName)
          .insert(data)
          .select()
          .single();

        isSaving = false;

        if (error) throw error;
        if (onSuccess) onSuccess(savedData);
        
        return { data: savedData };
      }
    } catch (error) {
      isSaving = false;
      
      console.error(`Erreur lors de la sauvegarde automatique dans ${tableName}:`, error);
      
      if (onError) onError(error);
      
      toast.error(`Erreur lors de la sauvegarde: ${error.message || 'Erreur inconnue'}`);
      
      return { error };
    }
  };

  /**
   * Programme une sauvegarde automatique après un délai
   * @param {Object} data - Données à sauvegarder
   * @returns {Promise} - Promesse avec le résultat de la sauvegarde
   */
  const scheduleSave = (data) => {
    cancelPendingSave();

    return new Promise((resolve) => {
      timeoutId = setTimeout(async () => {
        const result = await saveNow(data);
        resolve(result);
      }, AUTO_SAVE_DELAY);
    });
  };

  /**
   * Charge les données depuis la table Supabase
   * @param {String} id - ID de l'enregistrement à charger
   * @returns {Promise} - Promesse avec les données chargées
   */
  const loadData = async (id) => {
    if (!tableName) {
      return { error: new Error('Nom de table manquant') };
    }

    try {
      // Si un ID est fourni, on charge un enregistrement spécifique
      if (id) {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return { data };
      } 
      // Sinon, on charge tous les enregistrements
      else {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return { data };
      }
    } catch (error) {
      console.error(`Erreur lors du chargement depuis ${tableName}:`, error);
      toast.error(`Erreur lors du chargement: ${error.message || 'Erreur inconnue'}`);
      return { error };
    }
  };

  return {
    saveNow,
    scheduleSave,
    cancelPendingSave,
    loadData,
    isSaving: () => isSaving,
  };
} 
import { supabase } from 'src/lib/supabase';

export const cvService = {
  // Créer un nouveau CV
  createCV: async (cvData) => {
    try {
      // Vérifier la structure des données avant insertion
      const dataToInsert = {
        // S'assurer que le user_id est présent
        user_id: (await supabase.auth.getUser()).data.user?.id,
        // Assurer que le champ data contient les informations du CV
        content: cvData.data
      };

      if (!dataToInsert.user_id) {
        throw new Error('Utilisateur non connecté. Veuillez vous connecter pour enregistrer un CV.');
      }

      // Tentative d'insertion dans la table
      const { data, error } = await supabase
        .from('cvs')
        .insert([dataToInsert])
        .select();

      if (error) {
        console.error('Erreur Supabase:', error);
        
        // Gestion spécifique des erreurs
        if (error.code === '42P01' || error.message?.includes('relation "cvs" does not exist')) {
          throw new Error('La table "cvs" n\'existe pas dans la base de données. Veuillez contacter l\'administrateur.');
        }
        
        throw error;
      }
      
      return data?.[0] || null;
    } catch (error) {
      console.error('Erreur dans createCV:', error);
      throw error;
    }
  },

  // Récupérer un CV par ID
  getCV: async (id) => {
    const { data, error } = await supabase
      .from('cvs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Récupérer tous les CVs de l'utilisateur actuel
  getUserCVs: async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user) {
        throw new Error('Utilisateur non connecté');
      }
      
      const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur dans getUserCVs:', error);
      throw error;
    }
  },

  // Mettre à jour un CV
  updateCV: async (id, updates) => {
    const { data, error } = await supabase
      .from('cvs')
      .update({
        content: updates.data
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  // Supprimer un CV
  deleteCV: async (id) => {
    const { error } = await supabase
      .from('cvs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}; 
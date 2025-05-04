import PropTypes from 'prop-types';
import { useMemo, useEffect, useReducer, useCallback, createContext } from 'react';

import { saveSkill, deleteSkill, getAllSkills, updateSkillsOrder } from 'src/services/skills-service';

import { transformApiSkillData, transformSkillFormData } from '../schemas/skill-schema';

// ----------------------------------------------------------------------

// Types d'actions pour le reducer
const ACTIONS = {
  INITIALIZE: 'INITIALIZE',
  ADD_SKILL: 'ADD_SKILL',
  UPDATE_SKILL: 'UPDATE_SKILL',
  DELETE_SKILL: 'DELETE_SKILL',
  REORDER_SKILLS: 'REORDER_SKILLS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  RESET: 'RESET',
};

// État initial du contexte
const initialState = {
  skills: [],
  loading: false,
  error: null,
  initialized: false,
};

// Reducer pour gérer les changements d'état
const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.INITIALIZE:
      return {
        ...state,
        skills: action.payload,
        loading: false,
        initialized: true,
      };
      
    case ACTIONS.ADD_SKILL:
      return {
        ...state,
        skills: [...state.skills, action.payload],
        loading: false,
      };
      
    case ACTIONS.UPDATE_SKILL:
      return {
        ...state,
        skills: state.skills.map((skill) => 
          skill.id === action.payload.id ? action.payload : skill
        ),
        loading: false,
      };
      
    case ACTIONS.DELETE_SKILL:
      return {
        ...state,
        skills: state.skills.filter((skill) => skill.id !== action.payload),
        loading: false,
      };
      
    case ACTIONS.REORDER_SKILLS:
      return {
        ...state,
        skills: action.payload,
        loading: false,
      };
      
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
      
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
      
    case ACTIONS.RESET:
      return initialState;
      
    default:
      return state;
  }
};

// Création du contexte
export const SkillsContext = createContext(null);

// ----------------------------------------------------------------------

export function SkillsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Chargement initial des compétences
  const loadSkills = useCallback(async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      const apiSkills = await getAllSkills();
      
      // Transformer les données API en format pour le frontend
      const formattedSkills = apiSkills.map(transformApiSkillData);
      
      dispatch({ type: ACTIONS.INITIALIZE, payload: formattedSkills });
    } catch (error) {
      console.error('Erreur lors du chargement des compétences:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  }, []);

  // Charger les compétences au montage du composant
  useEffect(() => {
    if (!state.initialized) {
      loadSkills();
    }
  }, [loadSkills, state.initialized]);

  // Ajouter une nouvelle compétence
  const addSkill = useCallback(async (skillData) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      // Transformer les données pour l'API
      const apiData = transformSkillFormData(skillData);
      
      // Enregistrer dans l'API
      const savedSkill = await saveSkill(apiData);
      
      // Transformer la réponse pour le frontend
      const formattedSkill = transformApiSkillData(savedSkill);
      
      dispatch({ type: ACTIONS.ADD_SKILL, payload: formattedSkill });
      
      return formattedSkill;
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'une compétence:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  // Mettre à jour une compétence existante
  const updateSkill = useCallback(async (skillData) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      // Transformer les données pour l'API
      const apiData = transformSkillFormData(skillData);
      
      // Enregistrer dans l'API
      const updatedSkill = await saveSkill(apiData);
      
      // Transformer la réponse pour le frontend
      const formattedSkill = transformApiSkillData(updatedSkill);
      
      dispatch({ type: ACTIONS.UPDATE_SKILL, payload: formattedSkill });
      
      return formattedSkill;
    } catch (error) {
      console.error('Erreur lors de la mise à jour d\'une compétence:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  // Supprimer une compétence
  const removeSkill = useCallback(async (skillId) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      // Supprimer dans l'API
      await deleteSkill(skillId);
      
      dispatch({ type: ACTIONS.DELETE_SKILL, payload: skillId });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression d\'une compétence:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  // Réordonner les compétences
  const reorderSkills = useCallback(async (newOrderedSkills) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      // Mettre à jour l'ordre dans l'API
      await updateSkillsOrder(newOrderedSkills);
      
      dispatch({ type: ACTIONS.REORDER_SKILLS, payload: newOrderedSkills });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la réorganisation des compétences:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  // Récupérer les compétences par catégorie
  const getSkillsByCategory = useCallback((category) => state.skills.filter((skill) => skill.category === category), [state.skills]);

  // Traiter une erreur
  const handleError = useCallback((error) => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
  }, []);

  // Réinitialiser le contexte
  const resetContext = useCallback(() => {
    dispatch({ type: ACTIONS.RESET });
  }, []);

  // Mémorisation des valeurs du contexte
  const value = useMemo(
    () => ({
      ...state,
      addSkill,
      updateSkill,
      removeSkill,
      reorderSkills,
      getSkillsByCategory,
      refreshSkills: loadSkills,
      handleError,
      resetContext,
    }),
    [
      state,
      addSkill,
      updateSkill,
      removeSkill,
      reorderSkills,
      getSkillsByCategory,
      loadSkills,
      handleError,
      resetContext,
    ]
  );

  return <SkillsContext.Provider value={value}>{children}</SkillsContext.Provider>;
}

SkillsProvider.propTypes = {
  children: PropTypes.node.isRequired,
}; 
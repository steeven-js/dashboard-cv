import * as z from 'zod';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import DialogContentText from '@mui/material/DialogContentText';

// Importation des modèles de compétences et tags
import { 
  SKILL_CATEGORIES, 
  CATEGORIZED_SKILLS, 
  suggestRelevantTags,
  getPredefinedTagsByCategory
} from 'src/data/skill-model';

import { Iconify } from 'src/components/iconify';
import { Form, RHFSwitch, RHFSelect, RHFSlider, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

// ----------------------------------------------------------------------

// Schéma de validation Zod
const SkillSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Le nom de la compétence est requis').max(50, 'Maximum 50 caractères'),
  category: z.string().min(1, 'La catégorie est requise'),
  level: z.number().min(1).max(5),
  yearsExperience: z.number().min(0, 'La valeur doit être positive').max(50),
  tags: z.array(z.string()).default([]),
  visibility: z.boolean().default(true),
});

// Valeurs par défaut pour une nouvelle compétence
const defaultValues = {
  name: '',
  category: '',
  level: 3,
  yearsExperience: 1,
  tags: [],
  visibility: true,
};

/**
 * Composant de dialogue pour ajouter ou modifier une compétence technique
 */
export default function SkillDialog({ skill, open, onClose, onSubmit }) {
  const isEdit = !!skill;
  
  // État pour les suggestions intelligentes de tags
  const [suggestedTags, setSuggestedTags] = useState([]);
  
  // Configuration du formulaire avec React Hook Form et Zod
  const methods = useForm({
    resolver: zodResolver(SkillSchema),
    defaultValues,
  });
  
  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  
  // Récupérer les valeurs actuelles pour les suggestions de tags
  const currentCategory = watch('category');
  const currentName = watch('name');
  const currentTags = useMemo(() => watch('tags') || [], [watch]);
  
  // Réinitialiser le formulaire lorsque le dialogue s'ouvre ou la compétence change
  useEffect(() => {
    if (open) {
      if (skill) {
        // Édition d'une compétence existante
        reset({
          id: skill.id,
          name: skill.name || '',
          category: skill.category || '',
          level: skill.level || 3,
          yearsExperience: skill.yearsExperience || 1,
          tags: skill.tags || [],
          visibility: skill.visibility !== undefined ? skill.visibility : true,
        });
      } else {
        // Création d'une nouvelle compétence
        reset(defaultValues);
      }
    }
  }, [open, skill, reset]);

  // Générer des suggestions de tags intelligentes en fonction du nom et de la catégorie
  useEffect(() => {
    if (currentName && currentName.trim().length > 0) {
      const smartSuggestions = suggestRelevantTags(currentName, currentCategory);
      // Filtrer les tags déjà sélectionnés
      const filteredSuggestions = smartSuggestions.filter(tag => !currentTags.includes(tag));
      setSuggestedTags(filteredSuggestions);
    } else {
      setSuggestedTags([]);
    }
  }, [currentName, currentCategory, currentTags]);
  
  // Gérer la soumission du formulaire
  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };
  
  // Obtenir les suggestions de tags en fonction de la catégorie sélectionnée
  const getTagSuggestions = () => {
    if (!currentCategory) {
      // Si aucune catégorie sélectionnée, retourner toutes les suggestions
      return Object.values(CATEGORIZED_SKILLS).flat();
    }
    return [...CATEGORIZED_SKILLS[currentCategory] || [], ...getPredefinedTagsByCategory(currentCategory)];
  };

  // Ajouter un tag suggéré à la liste des tags
  const handleAddSuggestedTag = (tag) => {
    if (!currentTags.includes(tag)) {
      setValue('tags', [...currentTags, tag], { shouldValidate: true });
      // Mettre à jour les suggestions
      setSuggestedTags(prevSuggestions => prevSuggestions.filter(t => t !== tag));
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        {isEdit ? 'Modifier la compétence' : 'Ajouter une compétence'}
      </DialogTitle>
      
      <Form methods={methods} onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent sx={{ pb: 0, mt: 1 }}>
          <DialogContentText sx={{ mb: 3 }}>
            {isEdit 
              ? 'Modifiez les informations ci-dessous pour mettre à jour cette compétence.'
              : 'Remplissez les informations ci-dessous pour ajouter une nouvelle compétence.'}
          </DialogContentText>
          
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
            }}
          >
            <RHFTextField name="name" label="Nom de la compétence" />
            
            <RHFSelect name="category" label="Catégorie">
              <MenuItem value="" disabled>Sélectionnez une catégorie</MenuItem>
              {SKILL_CATEGORIES.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </RHFSelect>
            
            <Box>
              <RHFSlider
                name="level"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={5}
                sx={{
                  '& .MuiSlider-markLabel': { fontSize: 13 },
                }}
              />
              
              <Box sx={{ mt: -2, display: 'flex', justifyContent: 'space-between' }}>
                <FormHelperText sx={{ textAlign: 'left' }}>Débutant</FormHelperText>
                <FormHelperText sx={{ textAlign: 'center' }}>Niveau de maîtrise</FormHelperText>
                <FormHelperText sx={{ textAlign: 'right' }}>Expert</FormHelperText>
              </Box>
            </Box>
            
            <RHFTextField
              name="yearsExperience"
              label="Années d'expérience"
              type="number"
              InputProps={{ 
                inputProps: { min: 0, step: 0.5 },
                endAdornment: (
                  <InputAdornment position="end">
                    <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
                      an(s)
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
            
            {/* Système de gestion des tags amélioré */}
            <Box>
              <RHFAutocomplete
                name="tags"
                label="Tags associés"
                multiple
                freeSolo
                options={getTagSuggestions()}
                helperText="Ajoutez des tags pour faciliter le matching avec les offres d'emploi"
                ChipProps={{ size: 'small' }}
                renderTags={(selected, getTagProps) =>
                  selected.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option}
                      label={option}
                      size="small"
                      variant="soft"
                      color="primary"
                    />
                  ))
                }
              />
              
              {/* Affichage des suggestions intelligentes */}
              {suggestedTags.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <FormHelperText>
                    Tags suggérés pour cette compétence:
                  </FormHelperText>
                  <Stack direction="row" flexWrap="wrap" spacing={0.5} sx={{ mt: 0.5 }}>
                    {suggestedTags.slice(0, 6).map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        color="info"
                        onClick={() => handleAddSuggestedTag(tag)}
                        icon={<Iconify icon="solar:add-circle-linear" width={14} />}
                        sx={{ mr: 0.5, mb: 0.5, cursor: 'pointer' }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
            
            <RHFSwitch
              name="visibility"
              label="Afficher sur le CV"
              labelPlacement="end"
              helperText="Désactiver pour masquer cette compétence sur certains CV"
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            {isEdit ? 'Mettre à jour' : 'Créer'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

SkillDialog.propTypes = {
  skill: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
}; 
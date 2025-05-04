import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import { SKILL_LEVELS, SKILL_CATEGORIES } from 'src/data/skill-model';

import { Field } from 'src/components/hook-form/fields';
import { Form } from 'src/components/hook-form/form-provider';

import SkillTagInput from '../skill-tag-input';
import { SkillSchema, defaultSkillValues } from '../schemas/skill-schema';

// ----------------------------------------------------------------------

/**
 * Dialogue modal pour ajouter ou modifier une compétence technique
 * 
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.open - État d'ouverture du dialogue
 * @param {Function} props.onClose - Fonction appelée à la fermeture
 * @param {Function} props.onSubmit - Fonction appelée à la soumission
 * @param {Object} props.skill - Compétence à éditer (null pour création)
 */
export default function SkillDialog({ open, onClose, onSubmit, skill }) {
  const isEdit = Boolean(skill?.id);
  
  // Configurer React Hook Form avec Zod
  const methods = useForm({
    resolver: zodResolver(SkillSchema),
    defaultValues: useMemo(() => 
      skill || defaultSkillValues
    , [skill]),
  });
  
  const {
    reset,
    setValue,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  
  // Surveiller certains champs pour logique adaptative
  const watchCategory = watch('category');
  
  // Réinitialiser le formulaire quand la compétence change
  useEffect(() => {
    if (open) {
      reset(skill || defaultSkillValues);
    }
  }, [open, reset, skill]);
  
  // Gérer la soumission du formulaire
  const onSubmitForm = handleSubmit(async (data) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  });
  
  // Gérer les tags
  const handleTagsChange = useCallback((newTags) => {
    setValue('tags', newTags);
  }, [setValue]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{ 
        sx: { 
          borderRadius: 2,
          boxShadow: (theme) => theme.customShadows.dialog 
        } 
      }}
    >
      <DialogTitle>
        {isEdit ? 'Modifier une compétence' : 'Ajouter une compétence'}
      </DialogTitle>
      
      <Form methods={methods} onSubmit={onSubmitForm}>
        <DialogContent sx={{ pb: 0 }}>
          <Stack spacing={3}>
            {/* Nom de la compétence */}
            <Field.Text
              name="name"
              label="Nom de la compétence"
              placeholder="ex: React, PHP, Docker..."
              helperText="Le nom de la technologie ou compétence"
              InputLabelProps={{ shrink: true }}
            />
            
            {/* Catégorie */}
            <Field.Select
              name="category"
              label="Catégorie"
              placeholder="Sélectionnez une catégorie"
              InputLabelProps={{ shrink: true }}
            >
              {SKILL_CATEGORIES.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Field.Select>
            
            {/* Niveau de maîtrise */}
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Niveau de maîtrise
              </Typography>
              
              <Field.Slider
                name="level"
                min={1}
                max={5}
                step={1}
                marks={SKILL_LEVELS.map(level => ({
                  value: level.value,
                  label: level.label,
                }))}
                sx={{
                  '& .MuiSlider-markLabel': {
                    fontSize: 12,
                  },
                }}
              />
            </Stack>
            
            {/* Années d'expérience */}
            <Field.Text
              name="yearsExperience"
              label="Années d'expérience"
              type="number"
              placeholder="1"
              helperText="Nombre d'années d'utilisation de cette compétence"
              InputProps={{
                inputProps: { min: 0, max: 50, step: 0.5 },
                endAdornment: <InputAdornment position="end">ans</InputAdornment>,
              }}
              InputLabelProps={{ shrink: true }}
            />
            
            {/* Tags */}
            <SkillTagInput
              name="tags"
              label="Tags associés"
              placeholder="Ajouter des tags..."
              helperText="Mots-clés pour faciliter la recherche et la correspondance"
              value={watch('tags') || []}
              onChange={handleTagsChange}
              category={watchCategory}
            />
            
            {/* Visibilité */}
            <Field.Switch
              name="visibility"
              label="Visible sur le CV"
              labelPlacement="start"
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
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
            {isEdit ? 'Enregistrer' : 'Ajouter'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

SkillDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  skill: PropTypes.object,
}; 
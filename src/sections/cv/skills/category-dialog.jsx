import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';

import { Iconify } from 'src/components/iconify';
import { Form , RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

import { CategorySchema, defaultCategoryValues } from '../schemas/category-schema';

// ----------------------------------------------------------------------

// Options de couleurs disponibles
const COLOR_OPTIONS = [
  { value: 'default', label: 'Par défaut' },
  { value: 'primary', label: 'Primaire' },
  { value: 'secondary', label: 'Secondaire' },
  { value: 'info', label: 'Info' },
  { value: 'success', label: 'Succès' },
  { value: 'warning', label: 'Avertissement' },
  { value: 'error', label: 'Erreur' },
];

// Sélection d'icônes prédéfinies
const ICON_OPTIONS = [
  { value: 'mdi:folder-outline', label: 'Dossier' },
  { value: 'mdi:code-brackets', label: 'Code' },
  { value: 'mdi:language-html5', label: 'HTML' },
  { value: 'mdi:language-css3', label: 'CSS' },
  { value: 'mdi:language-javascript', label: 'JavaScript' },
  { value: 'mdi:database', label: 'Base de données' },
  { value: 'mdi:react', label: 'React' },
  { value: 'mdi:angular', label: 'Angular' },
  { value: 'mdi:vuejs', label: 'Vue.js' },
  { value: 'mdi:nodejs', label: 'Node.js' },
  { value: 'mdi:phone', label: 'Mobile' },
  { value: 'mdi:server', label: 'Serveur' },
  { value: 'mdi:atom', label: 'Science' },
  { value: 'mdi:palette', label: 'Design' },
  { value: 'mdi:tools', label: 'Outils' },
  { value: 'mdi:wrench', label: 'Maintenance' },
  { value: 'mdi:cogs', label: 'Configuration' },
  { value: 'mdi:chart-bar', label: 'Statistiques' },
  { value: 'mdi:shield-check', label: 'Sécurité' },
  { value: 'mdi:book-open-variant', label: 'Documentation' },
];

export default function CategoryDialog({
  category,
  categories = [],
  open,
  onClose,
  onSave,
}) {
  const isEdit = !!category;

  // Initialiser le formulaire avec react-hook-form et Zod comme validateur
  const methods = useForm({
    resolver: zodResolver(CategorySchema),
    defaultValues: useMemo(() => 
      category || defaultCategoryValues,
    [category]),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setValue,
  } = methods;

  // Valeur actuelle du champ label
  const labelValue = watch('label');

  // Quand les props changent, réinitialiser le formulaire
  useEffect(() => {
    if (open) {
      reset(category || defaultCategoryValues);
    }
  }, [open, category, reset]);

  // Générer automatiquement la valeur à partir du label
  useEffect(() => {
    if (!isEdit && labelValue) {
      setValue(
        'value', 
        labelValue
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
      );
    }
  }, [isEdit, labelValue, setValue]);

  // Filtrer les catégories pour n'afficher que les catégories parentes potentielles
  // (exclure la catégorie en cours d'édition et ses enfants)
  const parentCategoryOptions = useMemo(() => {
    if (!categories.length) return [];
    
    return categories
      .filter(cat => !isEdit || cat.id !== category?.id)
      .map(cat => ({
        value: cat.id,
        label: cat.label,
      }));
  }, [categories, isEdit, category]);

  // Soumission du formulaire
  const onSubmit = async (data) => {
    try {
      if (onSave) {
        onSave(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        {isEdit ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
      </DialogTitle>

      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pb: 0, mt: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <RHFTextField
                name="label"
                label="Nom de la catégorie"
                placeholder="Ex: Front-end, Back-end..."
              />
            </Grid>

            <Grid item xs={12}>
              <RHFTextField
                name="value"
                label="Valeur (identifiant)"
                placeholder="Ex: front-end"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mdi:key-variant" width={24} />
                    </InputAdornment>
                  ),
                }}
                helperText="Utilisé comme identifiant technique"
              />
            </Grid>

            <Grid item xs={12}>
              <RHFTextField
                name="description"
                label="Description"
                placeholder="Description courte de la catégorie"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <RHFSelect
                name="color"
                label="Couleur"
                InputLabelProps={{ shrink: true }}
              >
                {COLOR_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </RHFSelect>
            </Grid>

            <Grid item xs={12} sm={6}>
              <RHFAutocomplete
                name="icon"
                label="Icône"
                placeholder="Sélectionnez une icône"
                options={ICON_OPTIONS}
                InputLabelProps={{ shrink: true }}
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.value}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon={option.value} width={24} />
                      <span>{option.label}</span>
                    </Stack>
                  </Box>
                )}
                renderTags={(selected, getTagProps) =>
                  selected.map((option, index) => (
                    <Box
                      key={option.value}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                      {...getTagProps({ index })}
                    >
                      <Iconify icon={option.value} width={16} />
                      {option.label}
                    </Box>
                  ))
                }
              />

              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormHelperText>Aperçu:</FormHelperText>
                <Iconify
                  icon={watch('icon') || 'mdi:folder-outline'}
                  width={24}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <RHFAutocomplete
                name="parentId"
                label="Catégorie parente (optionnel)"
                placeholder="Sélectionnez une catégorie parente"
                options={parentCategoryOptions}
                InputLabelProps={{ shrink: true }}
                helperText="Pour créer une sous-catégorie"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
          >
            Annuler
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isEdit ? 'Enregistrer' : 'Créer'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

CategoryDialog.propTypes = {
  category: PropTypes.object,
  categories: PropTypes.array,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
}; 
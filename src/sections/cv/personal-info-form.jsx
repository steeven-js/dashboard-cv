import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useCallback } from 'react';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import LinearProgress from '@mui/material/LinearProgress';

import { fData } from 'src/utils/format-number';

// Service Supabase
import { getPersonalInfo, savePersonalInfo } from 'src/services/cv-service';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { schemaHelper } from 'src/components/hook-form/schema-helper';

// ----------------------------------------------------------------------

const PersonalInfoSchema = z.object({
  avatarUrl: z.union([
    schemaHelper.file({ message: { required_error: 'Format de fichier invalide' } }).optional(),
    z.string().url().optional(),
    z.literal(null).optional(),
    z.undefined(),
  ]),
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  professionalTitle: z.string().min(1, 'Le titre professionnel est requis'),
  summary: z.string().max(500, 'La description ne doit pas dépasser 500 caractères').optional(),
  email: z.string().email('Format d\'email invalide').min(1, 'L\'email est requis'),
  phone: schemaHelper
    .phoneNumber({
      isValid: isValidPhoneNumber,
      required: false,
      message: {
        invalid_type: 'Format de téléphone invalide',
        required: 'Le téléphone est requis'
      }
    })
    .or(z.string().length(0)),
  linkedin: z.string().url('Doit être une URL valide').optional().or(z.string().length(0)),
  website: z.string().url('Doit être une URL valide').optional().or(z.string().length(0)),
  address: z.string().optional(),
});

// Fonction pour débouncer (délai de frappe)
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// ----------------------------------------------------------------------

export default function PersonalInfoForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const methods = useForm({
    resolver: zodResolver(PersonalInfoSchema),
    defaultValues: {
      avatarUrl: null,
      firstName: '',
      lastName: '',
      professionalTitle: '',
      summary: '',
      email: '',
      phone: '',
      linkedin: '',
      website: '',
      address: '',
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { isDirty, isValid },
    reset,
    watch,
  } = methods;

  // Charger les données au chargement du composant
  useEffect(() => {
    const loadPersonalInfo = async () => {
      try {
        setIsLoading(true);
        const data = await getPersonalInfo();

        if (data && Object.keys(data).length > 0) {
          // Mettre à jour le formulaire avec les données de Supabase
          reset({
            avatarUrl: data.avatarUrl,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            professionalTitle: data.professionalTitle || '',
            summary: data.summary || '',
            email: data.email || '',
            phone: data.phone || '',
            linkedin: data.linkedin || '',
            website: data.website || '',
            address: data.address || '',
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des informations:', error);
        toast.error('Erreur lors du chargement des données', {
          description: 'Impossible de récupérer vos informations personnelles',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPersonalInfo();
  }, [reset]);

  // Surveiller les changements de formulaire
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      setFormChanged(true);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Fonction d'auto-sauvegarde
  const handleAutoSave = useCallback(async (data) => {
    if (!isValid || !formChanged) return;

    try {
      setAutoSaving(true);

      // Sauvegarder les données dans Supabase
      await savePersonalInfo(data);

      toast.info('Auto-sauvegarde réussie', {
        description: 'Vos modifications ont été enregistrées automatiquement',
        icon: <Iconify icon="solar:document-linear" width={24} />,
      });

      setFormChanged(false);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l\'auto-sauvegarde', {
        description: 'Veuillez réessayer ou sauvegarder manuellement',
      });
    } finally {
      setAutoSaving(false);
    }
  }, [isValid, formChanged]);

  // Créer une version debounced de la fonction d'auto-sauvegarde
  const debouncedAutoSave = useCallback(
    (data) => {
      const debouncedFn = debounce((formData) => {
        handleAutoSave(formData);
      }, 2000);
      debouncedFn(data);
    },
    [handleAutoSave]
  );

  // Surveiller les changements pour déclencher l'auto-sauvegarde
  useEffect(() => {
    if (formChanged && isValid) {
      const formData = methods.getValues();
      debouncedAutoSave(formData);
    }
  }, [formChanged, isValid, methods, debouncedAutoSave]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Sauvegarder dans Supabase
      await savePersonalInfo(data);

      // Afficher le message de succès
      toast.success('Informations personnelles sauvegardées', {
        description: 'Vos informations ont été mises à jour avec succès',
        icon: <Iconify icon="solar:check-circle-bold" width={24} />,
      });

      setFormChanged(false);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la sauvegarde', {
        description: 'Veuillez réessayer plus tard',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card sx={{ p: 3, mb: 3 }}>
        <Box sx={{ width: '100%', py: 5 }}>
          <LinearProgress
            color="primary"
            sx={{
              height: 6,
              borderRadius: 1,
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
              }
            }}
          />
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>
            Chargement de vos informations...
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card sx={{ p: 3, mb: 3 }}>
        {autoSaving && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress
              color="info"
              sx={{
                height: 6,
                borderRadius: 1,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 1,
                }
              }}
            />
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, color: 'info.main' }}>
              Auto-sauvegarde en cours...
            </Typography>
          </Box>
        )}

        <Typography variant="h6" sx={{ mb: 2 }}>
          Informations Personnelles
        </Typography>

        <Box sx={{ mb: 5 }}>
          <Field.UploadAvatar
            name="avatarUrl"
            maxSize={3145728}
            helperText={
              <Typography
                variant="caption"
                sx={{
                  mt: 3,
                  mx: 'auto',
                  display: 'block',
                  textAlign: 'center',
                  color: 'text.disabled',
                }}
              >
                Formats autorisés *.jpeg, *.jpg, *.png, *.gif
                <br /> taille max de {fData(3145728)}
              </Typography>
            }
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item md={6} xs={12}>
            <Field.Text name="firstName" label="Prénom *" />
          </Grid>

          <Grid item md={6} xs={12}>
            <Field.Text name="lastName" label="Nom *" />
          </Grid>

          <Grid item xs={12}>
            <Field.Text name="professionalTitle" label="Titre professionnel *" />
          </Grid>

          <Grid item xs={12}>
            <Field.Text
              name="summary"
              label="Résumé professionnel"
              multiline
              rows={4}
              inputProps={{ maxLength: 500 }}
              helperText="Maximum 500 caractères"
            />
          </Grid>

          <Grid item xs={12}>
            <Field.Text name="email" label="Email *" />
          </Grid>

          <Grid item md={6} xs={12}>
            <Field.Phone
              name="phone"
              label="Téléphone"
              country="FR"
              placeholder="+33 1 23 45 67 89"
            />
          </Grid>

          <Grid item md={6} xs={12}>
            <Field.Text name="linkedin" label="LinkedIn" placeholder="https://linkedin.com/in/votre-profil" />
          </Grid>

          <Grid item md={6} xs={12}>
            <Field.Text name="website" label="Site web" placeholder="https://votre-site.com" />
          </Grid>

          <Grid item md={6} xs={12}>
            <Field.Text name="address" label="Adresse" />
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              reset();
              setFormChanged(false);
            }}
            startIcon={<Iconify icon="solar:restart-bold" />}
          >
            Réinitialiser
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            disabled={!isDirty && !formChanged}
            startIcon={<Iconify icon="solar:disk-bold" />}
          >
            Sauvegarder
          </LoadingButton>
        </Stack>
      </Card>
    </Form>
  );
} 
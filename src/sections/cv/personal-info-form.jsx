import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import AlertTitle from '@mui/material/AlertTitle';
import LoadingButton from '@mui/lab/LoadingButton';
import LinearProgress from '@mui/material/LinearProgress';
import InputAdornment from '@mui/material/InputAdornment';

import { fData } from 'src/utils/format-number';

// Service Supabase
import { getPersonalInfo, savePersonalInfo } from 'src/services/cv-service';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form/fields';
import { Form } from 'src/components/hook-form/form-provider';
import { schemaHelper } from 'src/components/hook-form/schema-helper';

// ----------------------------------------------------------------------

// Schéma de validation amélioré avec validation transversale
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
})
// Ajout de validation transversale
.refine(
  (data) => {
    // Validation: si LinkedIn est renseigné, il doit contenir 'linkedin.com'
    if (data.linkedin && !data.linkedin.includes('linkedin.com')) {
      return false;
    }
    return true;
  },
  {
    message: "L'URL LinkedIn doit pointer vers linkedin.com",
    path: ['linkedin'],
  }
);

// Clé de stockage dans le localStorage
const STORAGE_KEY = 'cv_personal_info_draft';
const STORAGE_KEY_TIMESTAMP = 'cv_personal_info_draft_timestamp';

// ----------------------------------------------------------------------

export default function PersonalInfoForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  // Charger les données du local storage si disponibles avec vérification de fraîcheur
  const cachedData = useMemo(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const timestamp = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
      
      // Vérifier si les données ont moins de 24 heures
      if (savedData && timestamp) {
        const savedTime = new Date(timestamp).getTime();
        const now = new Date().getTime();
        const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          return JSON.parse(savedData);
        } else {
          // Données trop anciennes, on les supprime
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(STORAGE_KEY_TIMESTAMP);
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du cache:', error);
      return null;
    }
  }, []);

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
    formState: { isDirty, isValid, errors },
    reset,
    watch,
    getValues,
  } = methods;

  // Charger les données au chargement du composant
  useEffect(() => {
    const loadPersonalInfo = async () => {
      try {
        setIsLoading(true);
        
        // Utiliser le cache en attendant les données du serveur
        if (cachedData) {
          reset(cachedData);
          const timestamp = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
          if (timestamp) setLastSavedTime(timestamp);
          
          toast.info('Formulaire pré-rempli depuis le cache local', {
            description: 'Les données du serveur sont en cours de chargement',
            duration: 3000,
          });
        }
        
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
          
          // Mettre à jour le cache local
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          const now = new Date().toISOString();
          localStorage.setItem(STORAGE_KEY_TIMESTAMP, now);
          setLastSavedTime(now);
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
  }, [reset, cachedData]);

  // Surveiller les changements de formulaire
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      setFormChanged(true);
      
      // Sauvegarder dans le localStorage pour éviter la perte de données
      const currentValues = getValues();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentValues));
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY_TIMESTAMP, now);
    });
    
    return () => subscription.unsubscribe();
  }, [watch, getValues]);

  // Fonction d'auto-sauvegarde avec délai optimisée
  const debouncedAutoSave = useCallback(
    (data) => {
      const save = async () => {
        if (!isValid || !formChanged) return;
        
        try {
          setAutoSaving(true);
          await savePersonalInfo(data);
          
          // Mettre à jour l'horodatage de la dernière sauvegarde
          const now = new Date().toISOString();
          setLastSavedTime(now);
          localStorage.setItem(STORAGE_KEY_TIMESTAMP, now);
          
          setFormChanged(false);
          toast.success('Modifications sauvegardées automatiquement');
        } catch (error) {
          console.error('Erreur lors de l\'auto-sauvegarde:', error);
          // Pas de toast d'erreur pour l'auto-sauvegarde pour éviter de polluer l'interface
        } finally {
          setAutoSaving(false);
        }
      };
      
      let timeout;
      const later = () => {
        clearTimeout(timeout);
        save();
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, 2000);
    },
    [isValid, formChanged, setAutoSaving, setLastSavedTime, setFormChanged]
  );

  // Observer les changements pour déclencher l'auto-sauvegarde
  const formValues = watch();
  
  useEffect(() => {
    if (isDirty && isValid && !isLoading) {
      debouncedAutoSave(formValues);
    }
  }, [formValues, isDirty, isValid, isLoading, debouncedAutoSave]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await savePersonalInfo(data);
      
      // Mettre à jour le cache
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY_TIMESTAMP, now);
      setLastSavedTime(now);
      
      setFormChanged(false);
      toast.success('Informations personnelles sauvegardées avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde', {
        description: error.message || 'Une erreur est survenue lors de la sauvegarde des informations',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ py: 5, textAlign: 'center' }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Chargement de vos informations personnelles...
        </Typography>
      </Box>
    );
  }

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Box noValidate autoComplete="off">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {/* Section Photo de profil - Simplifiée */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Photo de profil
              </Typography>
              
              {/* Remplacer Field.Upload par un input standard */}
              <Box 
                sx={{ 
                  p: 5, 
                  borderRadius: 1, 
                  border: '1px dashed',
                  borderColor: 'divider',
                  textAlign: 'center'
                }}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Pour tester sans Field.Upload personnalisé
                </Typography>
              </Box>
              
              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  mx: 'auto',
                  display: 'block',
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                Format accepté : .jpeg, .jpg, .png, .webp
                <br /> Taille maximale : {fData(2000000)}
              </Typography>
            </Box>
          
            {/* Section Informations de base */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Informations de base
              </Typography>
              <Box sx={{ pt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    {/* Remplacer Field.TextField par Field.Text */}
                    <Field.Text
                      name="firstName"
                      label="Prénom"
                      fullWidth
                      required
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {/* Remplacer Field.TextField par Field.Text */}
                    <Field.Text
                      name="lastName"
                      label="Nom"
                      fullWidth
                      required
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>
            
            {/* Section Titre professionnel */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Titre professionnel
              </Typography>
              <Field.Text
                name="professionalTitle"
                label="Titre professionnel"
                placeholder="Ex: Développeur Full-Stack React / Node.js"
                fullWidth
                required
                aria-required="true"
                aria-describedby="title-help"
                error={!!errors.professionalTitle}
                helperText={errors.professionalTitle?.message}
              />
              <Typography id="title-help" variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                Votre titre principal qui sera mis en évidence sur votre CV
              </Typography>
            </Box>
            
            {/* Section Résumé professionnel */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Résumé professionnel
              </Typography>
              <Field.Text
                name="summary"
                label="Description"
                placeholder="Présentez-vous en quelques phrases..."
                fullWidth
                multiline
                rows={4}
                inputProps={{ maxLength: 500 }}
                aria-describedby="summary-counter"
                error={!!errors.summary}
                helperText={errors.summary?.message}
              />
              <Typography 
                id="summary-counter" 
                variant="caption" 
                component="div" 
                sx={{ 
                  mt: 1, 
                  textAlign: 'right', 
                  color: watch('summary')?.length >= 400 ? 'warning.main' : 'text.secondary' 
                }}
              >
                {watch('summary')?.length || 0}/500 caractères
              </Typography>
            </Box>
            
            {/* Section Coordonnées */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Coordonnées
              </Typography>
              <Box sx={{ pt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field.Text
                      name="email"
                      label="Email"
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="eva:email-outline" width={24} />
                          </InputAdornment>
                        ),
                      }}
                      aria-required="true"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field.Text
                      name="phone"
                      label="Téléphone"
                      fullWidth
                      aria-describedby="phone-hint"
                      error={!!errors.phone}
                      helperText={errors.phone?.message || (
                        <Typography id="phone-hint" variant="caption" sx={{ color: 'text.secondary' }}>
                          Format international préféré: +33 6 XX XX XX XX
                        </Typography>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field.Text
                      name="linkedin"
                      label="LinkedIn"
                      fullWidth
                      placeholder="https://linkedin.com/in/votre-profil"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="eva:linkedin-outline" width={24} />
                          </InputAdornment>
                        ),
                      }}
                      aria-describedby="linkedin-hint"
                      error={!!errors.linkedin}
                      helperText={errors.linkedin?.message || (
                        <Typography id="linkedin-hint" variant="caption" sx={{ color: 'text.secondary' }}>
                          Doit être une URL LinkedIn valide (linkedin.com/in/...)
                        </Typography>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field.Text
                      name="website"
                      label="Site Web"
                      fullWidth
                      placeholder="https://votre-site.com"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="eva:globe-outline" width={24} />
                          </InputAdornment>
                        ),
                      }}
                      error={!!errors.website}
                      helperText={errors.website?.message}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field.Text
                      name="address"
                      label="Adresse"
                      fullWidth
                      placeholder="Ville, Pays (optionnel)"
                      aria-describedby="address-hint"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="eva:pin-outline" width={24} />
                          </InputAdornment>
                        ),
                      }}
                      error={!!errors.address}
                      helperText={errors.address?.message || (
                        <Typography id="address-hint" variant="caption" sx={{ color: 'text.secondary' }}>
                          Pour la confidentialité, indiquez seulement la ville et le pays
                        </Typography>
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Grid>
        
          <Grid item xs={12}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <LoadingButton 
                type="submit"
                variant="contained"
                loading={isSubmitting}
                disabled={!isDirty || !isValid}
                startIcon={<Iconify icon="solar:disk-bold" />}
                aria-label="Sauvegarder les modifications"
              >
                Sauvegarder
              </LoadingButton>
            
              {lastSavedTime && (
                <Typography variant="caption" sx={{ color: 'text.secondary', ml: 2 }}>
                  Dernière sauvegarde à {new Date(lastSavedTime).toLocaleTimeString()}
                </Typography>
              )}
            
              {autoSaving && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  <Iconify icon="line-md:loading-loop" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                  Sauvegarde en cours...
                </Typography>
              )}
            </Stack>
          
            {/* Afficher les erreurs de validation transversale */}
            {Object.keys(errors).length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="error">
                  <AlertTitle>Veuillez corriger les erreurs suivantes:</AlertTitle>
                  <ul>
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field}>{error.message}</li>
                    ))}
                  </ul>
                </Alert>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </Form>
  );
} 
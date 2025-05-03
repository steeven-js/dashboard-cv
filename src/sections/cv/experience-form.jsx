import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSensor, DndContext, useSensors, PointerSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import AlertTitle from '@mui/material/AlertTitle';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';

import { getExperiences, saveExperience, deleteExperience, updateExperiencesOrder } from 'src/services/cv-service';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { ConfirmDialog } from 'src/components/custom-dialog';

import ExperienceItem from './experience-item';
import SkillsSelector from './skills-selector';
import AchievementInput from './achievement-input';

// ----------------------------------------------------------------------

const ExperienceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Le titre du poste est requis'),
  company: z.string().min(1, "Le nom de l'entreprise est requis"),
  location: z.string().optional(),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().optional(),
  description: z.string().optional(),
  technologies: z.array(z.string()).optional().default([]),
  achievements: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  visibility: z.boolean().default(true),
  current: z.boolean().default(false),
});

// ----------------------------------------------------------------------

export default function ExperienceForm() {
  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingExperience, setEditingExperience] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [achievements, setAchievements] = useState([]);

  const methods = useForm({
    resolver: zodResolver(ExperienceSchema),
    defaultValues: {
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
      technologies: [],
      achievements: [],
      tags: [],
      visibility: true,
      current: false,
    },
  });

  const { reset, handleSubmit, setValue, watch } = methods;

  // Surveiller la valeur du champ "current" pour gérer la date de fin
  const isCurrentPosition = watch('current');

  // Configurer le sensor pour le drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  // Charger les expériences au chargement du composant
  useEffect(() => {
    const loadExperiences = async () => {
      try {
        setIsLoading(true);
        const data = await getExperiences();
        
        // Tri chronologique par date de début (la plus récente en premier)
        const sortedData = [...data].sort((a, b) => {
          // Si l'une des expériences est en cours, elle doit apparaître en premier
          if (a.current && !b.current) return -1;
          if (!a.current && b.current) return 1;
          
          // Sinon, on trie par date de début (décroissant)
          return new Date(b.startDate) - new Date(a.startDate);
        });
        
        setExperiences(sortedData);
      } catch (error) {
        console.error('Erreur lors du chargement des expériences:', error);
        toast.error('Erreur lors du chargement des données', {
          description: 'Impossible de récupérer vos expériences professionnelles',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadExperiences();
  }, []);

  // Mettre à jour les réalisations lorsque achievements change dans le formulaire
  useEffect(() => {
    if (editingExperience) {
      setAchievements(editingExperience.achievements || []);
    } else {
      setAchievements([]);
    }
  }, [editingExperience]);

  // Mettre à jour les technologies lorsque technologies change dans le formulaire
  useEffect(() => {
    if (editingExperience) {
      setSelectedSkills(editingExperience.technologies || []);
    } else {
      setSelectedSkills([]);
    }
  }, [editingExperience]);

  // Mettre à jour les champs du formulaire lorsque isCurrentPosition change
  useEffect(() => {
    if (isCurrentPosition) {
      setValue('endDate', '');
    }
  }, [isCurrentPosition, setValue]);

  // Ouvrir la modale d'édition
  const handleEditExperience = (experience) => {
    setEditingExperience(experience);
    reset({
      id: experience.id,
      title: experience.title,
      company: experience.company,
      location: experience.location || '',
      startDate: experience.startDate,
      endDate: experience.endDate || '',
      description: experience.description || '',
      technologies: experience.technologies || [],
      achievements: experience.achievements || [],
      tags: experience.tags || [],
      visibility: experience.visibility,
      current: experience.current || false,
    });
    setSelectedSkills(experience.technologies || []);
    setAchievements(experience.achievements || []);
    setModalOpen(true);
  };

  // Ouvrir la modale d'ajout
  const handleAddExperience = () => {
    setEditingExperience(null);
    reset({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
      technologies: [],
      achievements: [],
      tags: [],
      visibility: true,
      current: false,
    });
    setSelectedSkills([]);
    setAchievements([]);
    setModalOpen(true);
  };

  // Fermer la modale
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Confirmer la suppression
  const handleDeleteConfirm = (experienceId) => {
    setExperienceToDelete(experienceId);
    setDeleteConfirmOpen(true);
  };

  // Exécuter la suppression
  const handleDeleteExperience = async () => {
    try {
      await deleteExperience(experienceToDelete);
      setExperiences(experiences.filter(exp => exp.id !== experienceToDelete));
      toast.success('Expérience supprimée', {
        description: "L'expérience a été supprimée avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression', {
        description: 'Impossible de supprimer cette expérience',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setExperienceToDelete(null);
    }
  };

  // Gérer les changements dans les compétences sélectionnées
  const handleSkillsChange = (skills) => {
    setSelectedSkills(skills);
    setValue('technologies', skills);
  };

  // Gérer les changements dans les réalisations
  const handleAchievementsChange = (achievementItems) => {
    setAchievements(achievementItems);
    setValue('achievements', achievementItems);
  };

  // Sauvegarder une expérience (nouvelle ou modifiée)
  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      
      // Ajouter/mettre à jour les technologies et réalisations
      const experienceData = {
        ...data,
        technologies: selectedSkills,
        achievements,
      };
      
      // Si c'est un poste actuel, on s'assure que endDate est vide
      if (data.current) {
        experienceData.endDate = '';
      }

      // Sauvegarder l'expérience
      await saveExperience(experienceData);
      
      // Rafraîchir la liste des expériences
      const updatedExperiences = await getExperiences();
      
      // Tri chronologique
      const sortedData = [...updatedExperiences].sort((a, b) => {
        // Si l'une des expériences est en cours, elle doit apparaître en premier
        if (a.current && !b.current) return -1;
        if (!a.current && b.current) return 1;
        
        // Sinon, on trie par date de début (décroissant)
        return new Date(b.startDate) - new Date(a.startDate);
      });
      
      setExperiences(sortedData);
      
      // Fermer la modale
      setModalOpen(false);
      
      // Afficher un message de succès
      toast.success(
        editingExperience ? 'Expérience mise à jour' : 'Expérience ajoutée',
        {
          description: editingExperience
            ? "L'expérience a été mise à jour avec succès"
            : "L'expérience a été ajoutée avec succès",
        }
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde', {
        description: "Impossible de sauvegarder l'expérience",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Gérer le réordonnancement par drag and drop
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setIsSavingOrder(true);

    try {
      const oldIndex = experiences.findIndex((exp) => exp.id === active.id);
      const newIndex = experiences.findIndex((exp) => exp.id === over.id);
      
      const reorderedExperiences = arrayMove(experiences, oldIndex, newIndex);
      setExperiences(reorderedExperiences);
      
      // Mise à jour de l'ordre dans la base de données
      await updateExperiencesOrder(reorderedExperiences.map((exp, index) => ({
        id: exp.id,
        order: index,
      })));
      
      toast.success('Ordre mis à jour', {
        description: 'Nouvel ordre des expériences enregistré',
      });
    } catch (error) {
      console.error('Erreur lors de la réorganisation:', error);
      toast.error('Erreur lors de la mise à jour de l\'ordre', {
        description: 'Impossible de sauvegarder le nouvel ordre',
      });
    } finally {
      setIsSavingOrder(false);
    }
  };

  return (
    <>
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center" 
          sx={{ mb: 3 }}
        >
          <Typography variant="h6">
            Vos expériences professionnelles
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={handleAddExperience}
          >
            Ajouter une expérience
          </Button>
        </Stack>

        {isSavingOrder && (
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
              Mise à jour de l&apos;ordre...
            </Typography>
          </Box>
        )}

        {isLoading && (
          <LinearProgress 
            sx={{ 
              height: 6, 
              borderRadius: 1, 
              mb: 3,
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
              }
            }} 
          />
        )}

        {!isLoading && experiences.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Aucune expérience professionnelle</AlertTitle>
            Ajoutez vos expériences professionnelles pour compléter votre profil et générer un CV adapté.
          </Alert>
        ) : (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext 
              items={experiences.map(exp => exp.id || `exp-${exp.index}`)} 
              strategy={verticalListSortingStrategy}
            >
              {experiences.map((experience, index) => (
                <ExperienceItem
                  key={experience.id || index}
                  experience={experience}
                  index={index}
                  onEdit={handleEditExperience}
                  onDelete={handleDeleteConfirm}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </Card>

      {/* Modale d'ajout/édition d'expérience */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { width: '100%', maxWidth: 700 }
        }}
      >
        <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingExperience ? "Modifier l'expérience" : 'Ajouter une nouvelle expérience'}
          </DialogTitle>
          <DialogContent sx={{ px: 4 }}>
            <Box sx={{ mt: 3, mb: 2 }}>
              <Grid container spacing={3}>
                {/* Titre du poste */}
                <Grid item xs={12} sm={6}>
                  <Field.Text
                    name="title"
                    label="Titre du poste"
                    placeholder="Ex: Développeur Full-Stack"
                    sx={{ '& .MuiInputBase-root': { minHeight: 56 } }}
                  />
                </Grid>

                {/* Entreprise */}
                <Grid item xs={12} sm={6}>
                  <Field.Text
                    name="company"
                    label="Entreprise"
                    placeholder="Ex: Acme Inc."
                    sx={{ '& .MuiInputBase-root': { minHeight: 56 } }}
                  />
                </Grid>

                {/* Localisation */}
                <Grid item xs={12} sm={6}>
                  <Field.Text
                    name="location"
                    label="Localisation"
                    placeholder="Ex: Paris, France"
                    sx={{ '& .MuiInputBase-root': { minHeight: 56 } }}
                  />
                </Grid>

                {/* Poste actuel */}
                <Grid item xs={12} sm={6}>
                  <Field.Switch
                    name="current"
                    label="Poste actuel"
                    helperText="Cochez si vous occupez toujours ce poste"
                  />
                </Grid>

                {/* Date de début */}
                <Grid item xs={12} sm={6}>
                  <Field.DatePicker
                    name="startDate"
                    label="Date de début"
                    slotProps={{
                      textField: {
                        helperText: "Date de début de l'expérience"
                      }
                    }}
                  />
                </Grid>

                {/* Date de fin (conditionnelle basée sur "current") */}
                <Grid item xs={12} sm={6}>
                  <Field.DatePicker
                    name="endDate"
                    label="Date de fin"
                    disabled={isCurrentPosition}
                    slotProps={{
                      textField: {
                        helperText: isCurrentPosition ? "Non applicable (poste actuel)" : "Date de fin de l'expérience"
                      }
                    }}
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <Field.Editor
                    name="description"
                    label="Description du poste"
                    helperText="Décrivez vos responsabilités et missions principales"
                    minHeight={200}
                  />
                </Grid>

                {/* Compétences techniques */}
                <Grid item xs={12}>
                  <SkillsSelector 
                    label="Technologies utilisées"
                    helperText="Sélectionnez les technologies utilisées dans ce poste"
                    value={selectedSkills}
                    onChange={handleSkillsChange}
                  />
                </Grid>

                {/* Réalisations */}
                <Grid item xs={12}>
                  <AchievementInput
                    label="Réalisations mesurables"
                    helperText="Ajoutez les réalisations et impacts chiffrés de ce poste"
                    value={achievements}
                    onChange={handleAchievementsChange}
                  />
                </Grid>

                {/* Tags */}
                <Grid item xs={12}>
                  <Field.Custom
                    name="tags"
                    label="Tags associés"
                    helperText="Ajoutez des tags pour faciliter le matching avec les offres d'emploi"
                    component={SkillsSelector}
                    inputSx={{
                      '& .MuiInputBase-root': {
                        minHeight: 56,
                        fontSize: '1rem',
                        width: '100%'
                      },
                      width: '100%'
                    }}
                  />
                </Grid>

                {/* Visibilité */}
                <Grid item xs={12}>
                  <Field.Switch
                    name="visibility"
                    label="Expérience visible sur le CV"
                    helperText="Désactivez pour masquer cette expérience lorsqu'elle n'est pas pertinente"
                    labelSx={{ fontSize: '1rem' }}
                    slotProps={{
                      switch: {
                        color: 'primary',
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 4, pb: 4, pt: 2 }}>
            <Button
              onClick={handleCloseModal}
              variant="outlined"
              size="large"
              sx={{ minWidth: 120 }}
            >
              Annuler
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSaving}
              sx={{ ml: 2, minWidth: 120, fontSize: '0.95rem', height: 48 }}
            >
              {editingExperience ? 'Mettre à jour' : 'Ajouter'}
            </LoadingButton>
          </DialogActions>
        </Form>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirmer la suppression"
        content={
          <Typography variant="body1">
            Êtes-vous sûr de vouloir supprimer cette expérience professionnelle ? Cette action est irréversible.
          </Typography>
        }
        action={
          <Button
            onClick={handleDeleteExperience}
            color="error"
            variant="contained"
            sx={{ minWidth: 100 }}
          >
            Supprimer
          </Button>
        }
      />
    </>
  );
} 
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
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import AlertTitle from '@mui/material/AlertTitle';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { getTechnicalSkills, saveTechnicalSkill, deleteTechnicalSkill, updateTechnicalSkillsOrder } from 'src/services/cv-service';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import SkillItem from './skill-item';
import SkillTagInput from './skill-tag-input';

// ----------------------------------------------------------------------

const SKILL_CATEGORIES = [
  { value: 'Front-end', label: 'Front-end' },
  { value: 'Back-end', label: 'Back-end' },
  { value: 'Mobile', label: 'Mobile' },
  { value: 'DevOps', label: 'DevOps' },
  { value: 'Database', label: 'Base de données' },
  { value: 'Design', label: 'Design' },
  { value: 'Tools', label: 'Outils' },
  { value: 'Other', label: 'Autre' },
];

const SKILL_SUGGESTIONS = [
  // Front-end
  'React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'HTML', 'CSS', 'JavaScript', 'TypeScript',
  'Redux', 'Webpack', 'Vite', 'jQuery', 'Bootstrap', 'Tailwind CSS', 'Material UI', 'Sass',
  // Back-end
  'Node.js', 'Express.js', 'PHP', 'Laravel', 'Ruby on Rails', 'Django', 'Flask', 'ASP.NET',
  'Spring Boot', 'Java', 'Python', 'Go', 'Rust', 'C#', 'C++', 'GraphQL', 'REST',
  // Mobile
  'React Native', 'Flutter', 'Swift', 'Kotlin', 'Ionic', 'Expo', 'Android SDK', 'iOS SDK',
  // Databases
  'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Firebase', 'Redis', 'Elasticsearch', 'Supabase',
  // DevOps
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'Jenkins', 'GitHub Actions', 'Terraform',
  'Ansible', 'Nginx', 'Prometheus', 'Grafana', 'Linux', 'Bash',
];

const SkillSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Le nom de la compétence est requis'),
  category: z.string().min(1, 'La catégorie est requise'),
  level: z.number().int().min(1).max(5),
  yearsExperience: z.number().min(0, 'Doit être positif'),
  tags: z.array(z.string()).optional().default([]),
  visibility: z.boolean().default(true),
});

// ----------------------------------------------------------------------

export default function TechnicalSkillsForm() {
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSkill, setEditingSkill] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const methods = useForm({
    resolver: zodResolver(SkillSchema),
    defaultValues: {
      name: '',
      category: '',
      level: 3,
      yearsExperience: 1,
      tags: [],
      visibility: true,
    },
  });

  const { reset, handleSubmit } = methods;

  // Configurer le sensor pour le drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  // Charger les compétences au chargement du composant
  useEffect(() => {
    const loadSkills = async () => {
      try {
        setIsLoading(true);
        const data = await getTechnicalSkills();
        setSkills(data);
      } catch (error) {
        console.error('Erreur lors du chargement des compétences:', error);
        toast.error('Erreur lors du chargement des données', {
          description: 'Impossible de récupérer vos compétences techniques',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSkills();
  }, []);

  // Ouvrir la modale d'édition
  const handleEditSkill = (skill) => {
    setEditingSkill(skill);
    reset({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      level: skill.level,
      yearsExperience: skill.yearsExperience,
      tags: skill.tags || [],
      visibility: skill.visibility,
    });
    setModalOpen(true);
  };

  // Ouvrir la modale d'ajout
  const handleAddSkill = () => {
    setEditingSkill(null);
    reset({
      name: '',
      category: '',
      level: 3,
      yearsExperience: 1,
      tags: [],
      visibility: true,
    });
    setModalOpen(true);
  };

  // Fermer la modale
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Confirmer la suppression
  const handleDeleteConfirm = (skillId) => {
    setSkillToDelete(skillId);
    setDeleteConfirmOpen(true);
  };

  // Exécuter la suppression
  const handleDeleteSkill = async () => {
    try {
      await deleteTechnicalSkill(skillToDelete);
      setSkills(skills.filter(skill => skill.id !== skillToDelete));
      toast.success('Compétence supprimée', {
        description: 'La compétence a été supprimée avec succès',
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression', {
        description: 'Impossible de supprimer cette compétence',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setSkillToDelete(null);
    }
  };

  // Sauvegarder une compétence (nouvelle ou modifiée)
  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      await saveTechnicalSkill(data);

      // Mettre à jour la liste locale
      if (editingSkill) {
        setSkills(skills.map(skill => (skill.id === data.id ? { ...data } : skill)));
      } else {
        const newSkill = { ...data };
        setSkills([...skills, newSkill]);
      }

      toast.success(editingSkill ? 'Compétence mise à jour' : 'Compétence ajoutée', {
        description: editingSkill
          ? 'La compétence a été mise à jour avec succès'
          : 'La nouvelle compétence a été ajoutée avec succès',
      });

      setModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde', {
        description: 'Impossible de sauvegarder cette compétence',
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
      // Trouver les indices
      const oldIndex = skills.findIndex(skill => skill.id === active.id || `skill-${skill.index}` === active.id);
      const newIndex = skills.findIndex(skill => skill.id === over.id || `skill-${skill.index}` === over.id);

      // Réordonner localement
      const newSkills = arrayMove(skills, oldIndex, newIndex);
      setSkills(newSkills);

      // Sauvegarder le nouvel ordre dans Supabase
      await updateTechnicalSkillsOrder(newSkills);

      toast.success('Ordre des compétences mis à jour', {
        description: 'Le nouvel ordre a été sauvegardé avec succès',
      });
    } catch (error) {
      console.error('Erreur lors du réordonnancement:', error);
      toast.error('Erreur lors de la mise à jour de l\'ordre', {
        description: 'Impossible de sauvegarder le nouvel ordre',
      });
    } finally {
      setIsSavingOrder(false);
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
            Chargement de vos compétences...
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ p: 4, mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
          <Typography variant="h6">
            Compétences Techniques
          </Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={handleAddSkill}
          >
            Ajouter une compétence
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

        {skills.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Aucune compétence technique</AlertTitle>
            Ajoutez vos compétences techniques pour compléter votre profil et générer un CV adapté.
          </Alert>
        ) : (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={skills.map(skill => skill.id || `skill-${skill.index}`)} strategy={verticalListSortingStrategy}>
              {skills.map((skill, index) => (
                <SkillItem
                  key={skill.id || index}
                  skill={skill}
                  index={index}
                  onEdit={handleEditSkill}
                  onDelete={handleDeleteConfirm}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </Card>

      {/* Modale d'ajout/édition de compétence */}
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
            {editingSkill ? 'Modifier la compétence' : 'Ajouter une nouvelle compétence'}
          </DialogTitle>
          <DialogContent sx={{ px: 4 }}>
            <Box sx={{ mt: 3, mb: 2 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} lg={8}>
                  <Field.Autocomplete
                    name="name"
                    label="Nom de la compétence"
                    placeholder="Ex: React, JavaScript, Docker..."
                    options={SKILL_SUGGESTIONS}
                    freeSolo
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        minHeight: 56,
                        fontSize: '1rem'
                      },
                      width: '100%',
                      minWidth: '300px' // Largeur minimale garantie
                    }}
                  />
                </Grid>

                <Grid item xs={12} lg={4} md={6}>
                  <Field.Select
                    name="category"
                    label="Catégorie"
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        minHeight: 56,
                        fontSize: '1rem'
                      },
                      width: '100%',
                      minWidth: '300px' // Largeur minimale garantie
                    }}
                  >
                    {SKILL_CATEGORIES.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.label}
                      </MenuItem>
                    ))}
                  </Field.Select>
                </Grid>

                <Grid item xs={12} lg={4} md={6}>
                  <Field.NumberInput
                    name="yearsExperience"
                    label="Années d'exp."
                    helperText="Années d'expérience"
                    sx={{
                      '& .MuiInputBase-root': {
                        minHeight: 56,
                        fontSize: '1rem',
                        width: '100%' // Assure que l'input prend toute la largeur disponible
                      },
                      width: '100%' // Assure que le composant entier prend toute la largeur
                    }}
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        max: 50,
                        step: 0.5,
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                    Niveau de maîtrise
                  </Typography>
                  <Field.Rating
                    name="level"
                    helperText="De 1 (débutant) à 5 (expert)"
                    max={5}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Field.Custom
                    name="tags"
                    label="Tags associés"
                    helperText="Ajoutez des tags pour faciliter le matching avec les offres d'emploi"
                    component={SkillTagInput}
                    inputSx={{
                      '& .MuiInputBase-root': {
                        minHeight: 56,
                        fontSize: '1rem',
                        width: '100%' // Assure que l'input prend toute la largeur disponible
                      },
                      width: '100%' // Assure que le composant entier prend toute la largeur
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Field.Switch
                    name="visibility"
                    label="Compétence visible sur le CV"
                    helperText="Désactivez pour masquer cette compétence lorsqu'elle n'est pas pertinente"
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
              {editingSkill ? 'Mettre à jour' : 'Ajouter'}
            </LoadingButton>
          </DialogActions>
        </Form>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ fontSize: '1.2rem', fontWeight: 600, pb: 1 }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2 }}>
          <DialogContentText sx={{ fontSize: '1rem' }}>
            Êtes-vous sûr de vouloir supprimer cette compétence ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            variant="outlined"
            size="large"
            sx={{ minWidth: 100 }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDeleteSkill}
            color="error"
            variant="contained"
            sx={{ ml: 2, minWidth: 100 }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 
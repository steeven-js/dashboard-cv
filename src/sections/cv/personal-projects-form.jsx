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
import DialogContentText from '@mui/material/DialogContentText';

import { 
  getPersonalProjects, 
  savePersonalProject, 
  deletePersonalProject, 
  uploadProjectScreenshot,
  deleteProjectScreenshot,
  updatePersonalProjectsOrder
} from 'src/services/cv-service';

import { Upload } from 'src/components/upload';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import ProjectItem from './project-item';
import SkillTagInput from './skill-tag-input';
import SkillsSelector from './skills-selector';

// ----------------------------------------------------------------------

const ProjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Le nom du projet est requis'),
  role: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().nullable().optional(),
  isOngoing: z.boolean().default(false),
  description: z.string().optional(),
  technologies: z.array(z.string()).optional().default([]),
  url: z.string().url('URL invalide').nullable().optional().or(z.literal('')),
  tags: z.array(z.string()).optional().default([]),
  visibility: z.boolean().default(true),
  screenshots: z.array(
    z.object({
      id: z.string(),
      url: z.string(),
      name: z.string(),
      path: z.string()
    })
  ).optional().default([]),
});

// ----------------------------------------------------------------------

export default function PersonalProjectsForm() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const methods = useForm({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      name: '',
      role: '',
      startDate: new Date(),
      endDate: null,
      isOngoing: false,
      description: '',
      technologies: [],
      url: '',
      tags: [],
      visibility: true,
      screenshots: [],
    },
  });

  const { reset, handleSubmit, watch, setValue } = methods;
  
  // Configurer le sensor pour le drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  // Charger les projets au chargement du composant
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        const data = await getPersonalProjects();
        
        // S'assurer que les données sont valides
        if (!data || !Array.isArray(data)) {
          console.error('Données de projets invalides:', data);
          setProjects([]);
          return;
        }
        
        // Filtrer les projets invalides
        const validProjects = data.filter(project => project && project.id);
        setProjects(validProjects);
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        toast.error('Erreur lors du chargement des données', {
          description: 'Impossible de récupérer vos projets personnels',
        });
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Ouvrir la modale d'édition
  const handleEditProject = (project) => {
    if (!project || !project.id) {
      console.error('Tentative de modification d\'un projet invalide:', project);
      return;
    }
    
    setEditingProject(project);
    reset({
      id: project.id,
      name: project.name || '',
      role: project.role || '',
      startDate: project.startDate || new Date(),
      endDate: project.isOngoing ? null : (project.endDate || null),
      isOngoing: project.isOngoing || false,
      description: project.description || '',
      technologies: project.technologies || [],
      url: project.url || '',
      tags: project.tags || [],
      visibility: typeof project.visibility === 'boolean' ? project.visibility : true,
      screenshots: project.screenshots || [],
    });
    setModalOpen(true);
  };

  // Ouvrir la modale d'ajout
  const handleAddProject = () => {
    setEditingProject(null);
    reset({
      name: '',
      role: '',
      startDate: new Date(),
      endDate: null,
      isOngoing: false,
      description: '',
      technologies: [],
      url: '',
      tags: [],
      visibility: true,
      screenshots: [],
    });
    setModalOpen(true);
  };

  // Fermer la modale
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Confirmer la suppression
  const handleDeleteConfirm = (projectId) => {
    if (!projectId) {
      console.error('Tentative de suppression d\'un projet sans ID');
      return;
    }
    setProjectToDelete(projectId);
    setDeleteConfirmOpen(true);
  };

  // Exécuter la suppression
  const handleDeleteProject = async () => {
    if (!projectToDelete) {
      setDeleteConfirmOpen(false);
      return;
    }
    
    try {
      // Trouver le projet pour accéder aux captures d'écran
      const projectToDeleteData = projects.find(project => project && project.id === projectToDelete);
      
      // Supprimer les captures d'écran du storage
      if (projectToDeleteData && projectToDeleteData.screenshots) {
        await Promise.all(
          projectToDeleteData.screenshots.map(screenshot => 
            deleteProjectScreenshot(screenshot.path)
          )
        );
      }
      
      // Supprimer le projet
      await deletePersonalProject(projectToDelete);
      setProjects(projects.filter(project => project.id !== projectToDelete));
      
      toast.success('Projet supprimé', {
        description: 'Le projet a été supprimé avec succès',
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression', {
        description: 'Impossible de supprimer ce projet',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
    }
  };

  // Gérer l'upload des captures d'écran
  const handleDropScreenshot = async (acceptedFiles) => {
    try {
      const uploaded = await Promise.all(
        acceptedFiles.map(file => uploadProjectScreenshot(file))
      );
      
      const currentScreenshots = watch('screenshots') || [];
      setValue('screenshots', [...currentScreenshots, ...uploaded]);
      
      toast.success('Capture(s) d\'écran ajoutée(s)', {
        description: `${acceptedFiles.length} fichier(s) importé(s) avec succès`,
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error('Erreur lors de l\'upload', {
        description: 'Impossible d\'ajouter certaines captures d\'écran',
      });
    }
  };

  // Supprimer une capture d'écran
  const handleRemoveScreenshot = async (screenshotToRemove) => {
    try {
      await deleteProjectScreenshot(screenshotToRemove.path);
      
      const currentScreenshots = watch('screenshots') || [];
      setValue(
        'screenshots', 
        currentScreenshots.filter(s => s.id !== screenshotToRemove.id)
      );
      
      toast.success('Capture d\'écran supprimée', {
        description: 'La capture d\'écran a été supprimée avec succès',
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la capture:', error);
      toast.error('Erreur lors de la suppression', {
        description: 'Impossible de supprimer cette capture d\'écran',
      });
    }
  };

  // Sauvegarder un projet (nouveau ou modifié)
  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      
      // Ajuster les dates selon isOngoing
      const projectData = {
        ...data,
        endDate: data.isOngoing ? null : data.endDate,
      };
      
      // Sauvegarder le projet
      const savedProject = await savePersonalProject(projectData);

      // Mettre à jour la liste locale
      if (editingProject) {
        setProjects(projects.map(project => (project.id === data.id ? { ...projectData, id: data.id } : project)));
      } else {
        setProjects([...projects, { ...savedProject }]);
      }

      toast.success(editingProject ? 'Projet mis à jour' : 'Projet ajouté', {
        description: editingProject
          ? 'Le projet a été mis à jour avec succès'
          : 'Le nouveau projet a été ajouté avec succès',
      });

      setModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde', {
        description: 'Impossible de sauvegarder ce projet',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Gérer le réordonnancement par drag and drop
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!active || !over || !active.id || !over.id || active.id === over.id) {
      return;
    }

    setIsSavingOrder(true);

    try {
      // Trouver les indices
      const oldIndex = projects.findIndex(project => project && project.id && (project.id === active.id || `project-${project.index}` === active.id));
      const newIndex = projects.findIndex(project => project && project.id && (project.id === over.id || `project-${project.index}` === over.id));

      // Vérifier que les indices sont valides
      if (oldIndex === -1 || newIndex === -1) {
        console.error('Indices invalides lors du réordonnancement:', { oldIndex, newIndex });
        return;
      }

      // Réordonner localement
      const newProjects = arrayMove(projects, oldIndex, newIndex);
      setProjects(newProjects);

      // Sauvegarder le nouvel ordre
      await updatePersonalProjectsOrder(newProjects);

      toast.success('Ordre des projets mis à jour', {
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

  const canDeleteProject = (projectId) => 
    // Implémenter ici une logique si nécessaire
     true
  ;

  return (
    <>
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h6">Vos Projets Personnels</Typography>
          
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleAddProject}
          >
            Ajouter un projet
          </Button>
        </Stack>

        {isLoading && <LinearProgress sx={{ mb: 2 }} />}

        {!isLoading && projects.length === 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Aucun projet</AlertTitle>
            Vous n&apos;avez pas encore ajouté de projets personnels. Cliquez sur &quot;Ajouter un projet&quot; pour commencer.
          </Alert>
        )}

        {!isLoading && projects.length > 0 && (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={projects.filter(p => p && p.id).map(p => p.id)} strategy={verticalListSortingStrategy}>
              <Stack spacing={2}>
                {projects.filter(project => project && project.id).map((project) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    onEdit={() => handleEditProject(project)}
                    onDelete={() => handleDeleteConfirm(project.id)}
                    canDelete={canDeleteProject(project.id)}
                  />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        )}

        {isSavingOrder && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress />
          </Box>
        )}
      </Card>

      {/* Formulaire de modification/ajout */}
      <Dialog 
        open={modalOpen} 
        onClose={handleCloseModal} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          component: 'div'
        }}
      >
        <DialogTitle>
          {editingProject ? 'Modifier le projet' : 'Ajouter un nouveau projet'}
        </DialogTitle>
        
        <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <AlertTitle>Création simplifiée</AlertTitle>
                  Seul le nom du projet est obligatoire. Vous pourrez compléter les autres informations ultérieurement.
                </Alert>
              </Grid>
              
              {/* Nom du projet */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
                  Nom du projet
                </Typography>
                <Field.Text 
                  name="name"
                  label="Nom du projet"
                  placeholder="Ex: Application mobile de gestion de tâches"
                  fullWidth
                  required
                />
              </Grid>

              {/* Rôle dans le projet */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
                  Rôle dans le projet
                </Typography>
                <Field.Text 
                  name="role"
                  label="Votre rôle dans le projet"
                  placeholder="Ex: Développeur Full-Stack"
                  fullWidth
                />
              </Grid>

              {/* Date de début */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
                  Date de début
                </Typography>
                <Field.DatePicker
                  name="startDate"
                  label="Date de début"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: "Date de démarrage du projet"
                    }
                  }}
                />
              </Grid>
              
              {/* Date de fin */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
                  Date de fin
                </Typography>
                <Field.DatePicker
                  name="endDate"
                  label="Date de fin"
                  disabled={watch('isOngoing')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: watch('isOngoing') ? "Non applicable (projet en cours)" : "Date de fin du projet"
                    }
                  }}
                />
              </Grid>
              
              {/* Switch "En cours" */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
                  Statut
                </Typography>
                <Field.Switch
                  name="isOngoing"
                  label="Projet en cours"
                  sx={{ mt: 1 }}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
                  Description du projet
                </Typography>
                <Field.Text 
                  name="description"
                  label="Description du projet"
                  placeholder="Décrivez brièvement ce projet, ses objectifs et vos réalisations"
                  fullWidth
                  multiline
                  rows={4}
                />
              </Grid>

              {/* Lien du projet */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
                  URL du projet
                </Typography>
                <Field.Text 
                  name="url"
                  label="URL du projet"
                  placeholder="https://github.com/username/project-name"
                  fullWidth
                  helperText="Lien vers le dépôt GitHub, le site web, ou une démo du projet"
                />
              </Grid>

              {/* Technologies utilisées */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
                  Technologies utilisées
                </Typography>
                <Field.Custom
                  name="technologies"
                  label="Technologies utilisées"
                  component={SkillsSelector}
                  helperText="Sélectionnez les technologies principales utilisées dans ce projet"
                />
              </Grid>

              {/* Tags */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
                  Tags (mots-clés)
                </Typography>
                <Field.Custom
                  name="tags"
                  label="Tags (mots-clés)"
                  component={SkillTagInput}
                  helperText="Ajoutez des mots-clés pour améliorer la correspondance avec les offres d'emploi"
                />
              </Grid>

              {/* Section captures d'écran */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
                  Captures d&apos;écran
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Ajoutez des images pour illustrer votre projet (maximum 5 captures d&apos;écran)
                </Typography>
                
                <Upload
                  multiple
                  thumbnail
                  files={watch('screenshots')?.map(file => ({
                    preview: file.url,
                    ...file,
                  }))}
                  onDrop={handleDropScreenshot}
                  onRemove={handleRemoveScreenshot}
                  helperText={
                    watch('screenshots')?.length > 0 
                      ? `${watch('screenshots').length} image(s) ajoutée(s)` 
                      : "Format recommandé: JPG, PNG ou GIF. Taille max: 5MB"
                  }
                />
              </Grid>

              {/* Options de visibilité */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
                  Visibilité
                </Typography>
                <Card sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Field.Switch
                      name="visibility"
                      label="Afficher ce projet dans mon CV"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Désactivez cette option pour masquer temporairement ce projet de votre CV sans le supprimer
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleCloseModal} color="inherit">
              Annuler
            </Button>
            
            <LoadingButton type="submit" variant="contained" loading={isSaving}>
              {editingProject ? 'Mettre à jour' : 'Ajouter'}
            </LoadingButton>
          </DialogActions>
        </Form>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmer la suppression
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
            Annuler
          </Button>
          
          <Button onClick={handleDeleteProject} color="error" variant="contained" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 
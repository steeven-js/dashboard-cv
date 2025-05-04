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
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import AlertTitle from '@mui/material/AlertTitle';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';

import { getEducation, saveEducation, deleteEducation, updateEducationOrder } from 'src/services/cv-service';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { ConfirmDialog } from 'src/components/custom-dialog';

import EducationItem from './education-item';
import CertificationSection from './certification-section';

// ----------------------------------------------------------------------

const EducationSchema = z.object({
  id: z.string().optional(),
  degree: z.string().min(1, 'L\'intitulé du diplôme est requis'),
  institution: z.string().min(1, 'Le nom de l\'établissement est requis'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().optional(),
  description: z.string().optional(),
  certifications: z.array(z.string()).optional().default([]),
  visibility: z.boolean().default(true),
  current: z.boolean().default(false),
});

// ----------------------------------------------------------------------

export default function EducationForm() {
  const [educationList, setEducationList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEducation, setEditingEducation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [educationToDelete, setEducationToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [certifications, setCertifications] = useState([]);

  const methods = useForm({
    resolver: zodResolver(EducationSchema),
    defaultValues: {
      degree: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
      certifications: [],
      visibility: true,
      current: false,
    },
  });

  const { reset, handleSubmit, setValue, watch } = methods;

  // Surveiller la valeur du champ "current" pour gérer la date de fin
  const isCurrentEducation = watch('current');

  // Configurer le sensor pour le drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  // Charger les formations au chargement du composant
  useEffect(() => {
    const loadEducationData = async () => {
      try {
        setIsLoading(true);
        const data = await getEducation();
        
        // Tri chronologique par date de début (la plus récente en premier)
        const sortedData = [...data].sort((a, b) => {
          // Si l'une des formations est en cours, elle doit apparaître en premier
          if (a.current && !b.current) return -1;
          if (!a.current && b.current) return 1;
          
          // Sinon, on trie par date de début (décroissant)
          return new Date(b.startDate) - new Date(a.startDate);
        });
        
        setEducationList(sortedData);
      } catch (error) {
        console.error('Erreur lors du chargement des formations:', error);
        toast.error('Erreur lors du chargement des données', {
          description: 'Impossible de récupérer vos formations et diplômes',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadEducationData();
  }, []);

  // Mettre à jour les certifications lorsque l'objet d'édition change
  useEffect(() => {
    if (editingEducation) {
      setCertifications(editingEducation.certifications || []);
    } else {
      setCertifications([]);
    }
  }, [editingEducation]);

  // Mettre à jour les champs du formulaire lorsque isCurrentEducation change
  useEffect(() => {
    if (isCurrentEducation) {
      setValue('endDate', '');
    }
  }, [isCurrentEducation, setValue]);

  // Ouvrir la modale d'édition
  const handleEditEducation = (education) => {
    setEditingEducation(education);
    reset({
      id: education.id,
      degree: education.degree,
      institution: education.institution,
      location: education.location || '',
      startDate: education.startDate,
      endDate: education.endDate || '',
      description: education.description || '',
      certifications: education.certifications || [],
      visibility: education.visibility,
      current: education.current || false,
    });
    setCertifications(education.certifications || []);
    setModalOpen(true);
  };

  // Ouvrir la modale d'ajout
  const handleAddEducation = () => {
    setEditingEducation(null);
    reset({
      degree: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
      certifications: [],
      visibility: true,
      current: false,
    });
    setCertifications([]);
    setModalOpen(true);
  };

  // Fermer la modale
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Confirmer la suppression
  const handleDeleteConfirm = (educationId) => {
    setEducationToDelete(educationId);
    setDeleteConfirmOpen(true);
  };

  // Exécuter la suppression
  const handleDeleteEducation = async () => {
    try {
      await deleteEducation(educationToDelete);
      setEducationList(educationList.filter(edu => edu.id !== educationToDelete));
      toast.success('Formation supprimée', {
        description: "La formation a été supprimée avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression', {
        description: 'Impossible de supprimer cette formation',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setEducationToDelete(null);
    }
  };

  // Gérer les changements dans les certifications
  const handleCertificationsChange = (updatedCertifications) => {
    setCertifications(updatedCertifications);
    setValue('certifications', updatedCertifications);
  };

  // Sauvegarder une formation (nouvelle ou modifiée)
  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      
      // Ajouter/mettre à jour les certifications
      const educationData = {
        ...data,
        certifications,
      };
      
      // Si c'est une formation en cours, on s'assure que endDate est vide
      if (data.current) {
        educationData.endDate = '';
      }
      
      // Sauvegarder dans Supabase
      const result = await saveEducation(educationData);
      
      if (editingEducation) {
        // Mise à jour d'une formation existante
        setEducationList(
          educationList.map((edu) => 
            edu.id === data.id ? { ...educationData, id: data.id } : edu
          )
        );
        
        toast.success('Formation mise à jour', {
          description: "Les informations ont été mises à jour avec succès",
        });
      } else {
        // Ajout d'une nouvelle formation
        const newEducation = {
          ...educationData,
          id: result.id,
        };
        
        setEducationList([newEducation, ...educationList]);
        
        toast.success('Formation ajoutée', {
          description: "La nouvelle formation a été ajoutée avec succès",
        });
      }
      
      // Fermer la modale
      setModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde', {
        description: 'Impossible de sauvegarder les informations',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Gérer le drag and drop pour réordonner les formations
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    // Vérifier que active et over existent et ont des IDs valides
    if (!active || !over || !active.id || !over.id) {
      console.warn('Données de drag and drop invalides:', { active, over });
      return;
    }
    
    if (active.id !== over.id) {
      setEducationList((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        // Vérifier que les index sont valides
        if (oldIndex === -1 || newIndex === -1) {
          console.warn('Index invalides lors du drag and drop:', { oldIndex, newIndex, active, over });
          return items; // Retourner l'état actuel sans modifications
        }
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Mettre à jour l'ordre dans Supabase
        const updateOrder = async () => {
          try {
            setIsSavingOrder(true);
            await updateEducationOrder(newOrder);
          } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'ordre:', error);
            toast.error('Erreur lors de la réorganisation', {
              description: 'L\'ordre affiché peut ne pas être sauvegardé',
            });
          } finally {
            setIsSavingOrder(false);
          }
        };
        
        updateOrder();
        
        return newOrder;
      });
    }
  };

  if (isLoading) {
    return (
      <Card sx={{ p: 3, mb: 3 }}>
        <Box sx={{ width: '100%', py: 5 }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Chargement de vos formations et diplômes...
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h6">Formations et Diplômes</Typography>
          
          <Button
            color="primary"
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleAddEducation}
          >
            Ajouter
          </Button>
        </Stack>

        {educationList.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Aucune formation</AlertTitle>
            Vous n&apos;avez pas encore ajouté de formations ou diplômes. Cliquez sur &quot;Ajouter&quot; pour commencer.
          </Alert>
        ) : (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={educationList.map((edu) => edu.id)} strategy={verticalListSortingStrategy}>
              {educationList.map((education, index) => (
                <EducationItem
                  key={education.id}
                  education={education}
                  index={index}
                  onEdit={handleEditEducation}
                  onDelete={handleDeleteConfirm}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}

        {isSavingOrder && (
          <Box sx={{ width: '100%', mt: 1 }}>
            <LinearProgress color="primary" />
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
              Mise à jour de l&apos;ordre...
            </Typography>
          </Box>
        )}
      </Card>

      {/* Modale de formulaire d'édition/ajout */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingEducation ? 'Modifier une formation' : 'Ajouter une formation'}
        </DialogTitle>
        
        <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={6}>
                <Field.Text
                  name="degree"
                  label="Intitulé du diplôme"
                  placeholder="Ex: Master en Informatique"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Field.Text
                  name="institution"
                  label="Établissement"
                  placeholder="Ex: Université de Paris"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Field.CountrySelect
                  name="location"
                  label="Localisation"
                  placeholder="Sélectionnez un pays"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Field.Switch
                  name="current"
                  label="Formation en cours"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Field.DatePicker
                  name="startDate"
                  label="Date de début"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Field.DatePicker
                  name="endDate"
                  label="Date de fin"
                  disabled={isCurrentEducation}
                  helperText={isCurrentEducation ? "La date de fin n'est pas applicable pour une formation en cours" : ""}
                />
              </Grid>

              <Grid item xs={12}>
                <Field.Editor
                  name="description"
                  label="Description"
                  placeholder="Décrivez votre formation, les matières principales, les projets réalisés, etc."
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ my: 1 }}>
                  <Divider>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Informations optionnelles
                    </Typography>
                  </Divider>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <CertificationSection
                  certifications={certifications}
                  onChange={handleCertificationsChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Field.Switch
                  name="visibility"
                  label="Visible sur le CV"
                  helperText="Si désactivé, cette formation n'apparaîtra pas sur votre CV"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseModal} color="inherit">
              Annuler
            </Button>
            
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSaving}
            >
              {editingEducation ? 'Mettre à jour' : 'Ajouter'}
            </LoadingButton>
          </DialogActions>
        </Form>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Supprimer la formation"
        content="Êtes-vous sûr de vouloir supprimer cette formation ? Cette action ne peut pas être annulée."
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteEducation}
          >
            Supprimer
          </Button>
        }
      />
    </>
  );
} 
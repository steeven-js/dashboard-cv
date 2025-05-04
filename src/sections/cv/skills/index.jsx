import { m } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useSensor, DndContext, useSensors, PointerSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import AlertTitle from '@mui/material/AlertTitle';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { varFade } from 'src/components/animate/variants';

import SkillDialog from './skill-dialog';
import { useSkills } from '../hooks/use-skills';
import SkillsFilterBar from './skills-filter-bar';
import SkillSortableItem from '../skill-sortable-item';
import SkillsEmptyContent from './skills-empty-content';
import { SkillsProvider } from '../context/skills-context';
import SkillStatisticsWidget from './skill-statistics-widget';

// ----------------------------------------------------------------------

/**
 * Composant principal de gestion des compétences techniques
 * Encapsulé dans un fournisseur de contexte pour l'état des compétences
 */
export default function SkillsManager() {
  return (
    <SkillsProvider>
      <SkillsContent />
    </SkillsProvider>
  );
}

// ----------------------------------------------------------------------

/**
 * Contenu principal de la gestion des compétences
 * Utilisant le contexte des compétences via useSkills
 */
function SkillsContent() {
  const {
    skills,
    loading,
    error,
    totalSkills,
    categoryCounts,
    averageSkillLevel,
    
    createSkill,
    editSkill,
    deleteSkill,
    findSkillById,
    reorderSkillsList,
  } = useSkills();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterText, setFilterText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Configuration pour glisser-déposer
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );
  
  // Filtrer les compétences selon les critères
  useEffect(() => {
    let filtered = [...skills];
    
    // Filtrer par catégorie
    if (filterCategory) {
      filtered = filtered.filter(skill => skill.category === filterCategory);
    }
    
    // Filtrer par texte
    if (filterText) {
      const searchLower = filterText.toLowerCase();
      filtered = filtered.filter(skill => 
        skill.name.toLowerCase().includes(searchLower) || 
        (skill.tags && skill.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }
    
    setFilteredSkills(filtered);
  }, [skills, filterCategory, filterText]);
  
  // Ouverture du dialogue pour ajouter une compétence
  const handleOpenAddDialog = useCallback(() => {
    setCurrentSkill(null);
    setOpenDialog(true);
  }, []);
  
  // Ouverture du dialogue pour éditer une compétence
  const handleOpenEditDialog = useCallback((skillId) => {
    const skill = findSkillById(skillId);
    if (skill) {
      setCurrentSkill(skill);
      setOpenDialog(true);
    }
  }, [findSkillById]);
  
  // Fermeture du dialogue
  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setCurrentSkill(null);
  }, []);
  
  // Soumission du formulaire de compétence
  const handleSubmitSkill = useCallback(async (formData) => {
    try {
      if (formData.id) {
        await editSkill(formData);
      } else {
        await createSkill(formData);
      }
      
      handleCloseDialog();
      return true;
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      return false;
    }
  }, [createSkill, editSkill, handleCloseDialog]);
  
  // Demande de confirmation de suppression
  const handleDeleteConfirm = useCallback((skillId) => {
    setConfirmDelete(skillId);
  }, []);
  
  // Annulation de la suppression
  const handleCancelDelete = useCallback(() => {
    setConfirmDelete(null);
  }, []);
  
  // Suppression effective
  const handleDeleteSkill = useCallback(async () => {
    if (!confirmDelete) return;
    
    try {
      await deleteSkill(confirmDelete);
      setConfirmDelete(null);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  }, [confirmDelete, deleteSkill]);
  
  // Gestion du glisser-déposer pour réorganiser
  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = filteredSkills.findIndex((item) => item.id === active.id);
      const newIndex = filteredSkills.findIndex((item) => item.id === over.id);
      
      // Réorganiser localement
      const newSkills = arrayMove(filteredSkills, oldIndex, newIndex);
      setFilteredSkills(newSkills);
      
      // Appliquer à l'état global
      const allNewSkills = [...skills];
      const oldGlobalIndex = allNewSkills.findIndex((item) => item.id === active.id);
      const newGlobalIndex = allNewSkills.findIndex((item) => item.id === over.id);
      
      const reorderedSkills = arrayMove(allNewSkills, oldGlobalIndex, newGlobalIndex);
      
      // Enregistrer le nouvel ordre
      try {
        await reorderSkillsList(reorderedSkills);
      } catch (err) {
        console.error('Erreur lors de la réorganisation:', err);
      }
    }
  }, [filteredSkills, skills, reorderSkillsList]);
  
  // Gestion du changement de filtres
  const handleFilterChange = useCallback((category, text) => {
    setFilterCategory(category);
    setFilterText(text);
  }, []);

  // Rendu du chargement
  if (loading && !skills.length) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 5, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Chargement des compétences...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Rendu en cas d'erreur
  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Erreur</AlertTitle>
          Une erreur est survenue lors du chargement des compétences: {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <m.div variants={varFade('inUp')}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
          <Typography variant="h4">Gestion des compétences techniques</Typography>
          
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleOpenAddDialog}
          >
            Ajouter une compétence
          </Button>
        </Stack>
      </m.div>
      
      {/* Statistiques */}
      <m.div variants={varFade('inUp')}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <SkillStatisticsWidget
              icon="carbon:skill-level"
              title="Niveau moyen"
              value={`${averageSkillLevel}/5`}
              description="Niveau moyen sur l'ensemble des compétences"
              color="primary"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <SkillStatisticsWidget
              icon="carbon:skill-level-advanced"
              title="Total compétences"
              value={totalSkills}
              description="Nombre de compétences techniques"
              color="info"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <SkillStatisticsWidget
              icon="fluent:tab-desktop-multiple-20-regular"
              title="Catégorie principale"
              value={Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Aucune'}
              description="Catégorie ayant le plus de compétences"
              color="success"
            />
          </Grid>
        </Grid>
      </m.div>
      
      {/* Filtres */}
      <m.div variants={varFade('inUp')}>
        <SkillsFilterBar onFilterChange={handleFilterChange} />
      </m.div>
      
      {/* Liste des compétences */}
      {filteredSkills.length > 0 ? (
        <m.div variants={varFade('inUp')}>
          <Box sx={{ mb: 2 }}>
            <Alert severity="info">
              <AlertTitle>Tri par glisser-déposer</AlertTitle>
              Faites glisser les compétences pour les réorganiser selon leur importance
            </Alert>
          </Box>
          
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredSkills.map(skill => skill.id)} strategy={verticalListSortingStrategy}>
              <Stack spacing={2}>
                {filteredSkills.map((skill) => (
                  <SkillSortableItem
                    key={skill.id}
                    skill={skill}
                    onEdit={handleOpenEditDialog}
                    onDelete={handleDeleteConfirm}
                  />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        </m.div>
      ) : (
        <m.div variants={varFade('inUp')}>
          <SkillsEmptyContent onAdd={handleOpenAddDialog} />
        </m.div>
      )}
      
      {/* Dialogue d'ajout/édition */}
      <SkillDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitSkill}
        skill={currentSkill}
      />
      
      {/* Dialogue de confirmation de suppression */}
      {confirmDelete && (
        <Alert 
          severity="warning"
          sx={{ mt: 2, mb: 2 }}
          action={
            <Stack direction="row" spacing={1}>
              <Button color="inherit" size="small" onClick={handleCancelDelete}>
                Annuler
              </Button>
              <Button color="error" size="small" onClick={handleDeleteSkill} variant="contained">
                Supprimer
              </Button>
            </Stack>
          }
        >
          <AlertTitle>Confirmer la suppression</AlertTitle>
          Êtes-vous sûr de vouloir supprimer cette compétence ? Cette action est irréversible.
        </Alert>
      )}
    </Container>
  );
} 
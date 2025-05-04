import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import AlertTitle from '@mui/material/AlertTitle';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import SkillList from './skill-list';
import SkillDialog from './skill-dialog';
import SkillsEmptyContent from './skills-empty-content';
import SkillStatisticsWidget from './skill-statistics-widget';

// ----------------------------------------------------------------------

/**
 * Page principale pour la gestion des compétences techniques
 */
export default function TechnicalSkills() {
  // Simuler des données de compétences pour démonstration
  const [skills, setSkills] = useState(MOCK_SKILLS);
  const [loading] = useState(false);
  const [error] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Ouverture du dialogue pour ajouter une compétence
  const handleOpenAddDialog = useCallback(() => {
    setSelectedSkill(null);
    setOpenDialog(true);
  }, []);
  
  // Ouverture du dialogue pour éditer une compétence
  const handleOpenEditDialog = useCallback((skillId) => {
    const skill = skills.find((s) => s.id === skillId);
    if (skill) {
      setSelectedSkill(skill);
      setOpenDialog(true);
    }
  }, [skills]);
  
  // Fermeture du dialogue
  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setSelectedSkill(null);
  }, []);
  
  // Soumission du formulaire d'ajout/édition
  const handleSubmitSkill = useCallback((formData) => {
    try {
      if (formData.id) {
        // Mettre à jour une compétence existante
        setSkills(prevSkills => 
          prevSkills.map(skill => 
            skill.id === formData.id ? { ...skill, ...formData } : skill
          )
        );
      } else {
        // Ajouter une nouvelle compétence
        const newSkill = {
          ...formData,
          id: `skill-${Date.now()}`, // Générer un ID temporaire
          createdAt: new Date().toISOString(),
        };
        setSkills(prevSkills => [...prevSkills, newSkill]);
      }
      return true;
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      return false;
    }
  }, []);
  
  // Demande de confirmation de suppression
  const handleDeleteConfirm = useCallback((skillId) => {
    setConfirmDelete(skillId);
  }, []);
  
  // Annulation de la suppression
  const handleCancelDelete = useCallback(() => {
    setConfirmDelete(null);
  }, []);
  
  // Suppression effective
  const handleDeleteSkill = useCallback((skillId) => {
    setSkills((prevSkills) => prevSkills.filter((skill) => skill.id !== skillId));
    setConfirmDelete(null);
  }, []);
  
  if (loading) {
    return (
      <DashboardContent maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Chargement des compétences...
          </Typography>
        </Box>
      </DashboardContent>
    );
  }
  
  if (error) {
    return (
      <DashboardContent maxWidth="xl">
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Erreur</AlertTitle>
          Une erreur est survenue lors du chargement des compétences: {error}
        </Alert>
      </DashboardContent>
    );
  }
  
  return (
    <DashboardContent maxWidth="xl">
      <Container maxWidth={false}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
          <Typography variant="h4">Compétences Techniques</Typography>
          
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleOpenAddDialog}
          >
            Ajouter une compétence
          </Button>
        </Stack>
        
        {skills.length > 0 ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <SkillList 
                skills={skills}
                onEdit={handleOpenEditDialog}
                onDelete={handleDeleteConfirm}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <SkillStatisticsWidget skills={skills} />
            </Grid>
          </Grid>
        ) : (
          <SkillsEmptyContent onAdd={handleOpenAddDialog} />
        )}
        
        {/* Dialogue d'ajout/édition */}
        <SkillDialog 
          open={openDialog}
          onClose={handleCloseDialog}
          onSubmit={handleSubmitSkill}
          skill={selectedSkill}
        />
        
        {/* Confirmation de suppression */}
        {confirmDelete && (
          <Alert 
            severity="warning"
            sx={{ mt: 4, mb: 2 }}
            action={
              <Stack direction="row" spacing={1}>
                <Button color="inherit" size="small" onClick={handleCancelDelete}>
                  Annuler
                </Button>
                <Button 
                  color="error" 
                  size="small" 
                  onClick={() => handleDeleteSkill(confirmDelete)}
                  variant="contained"
                >
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
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

// Données simulées pour démonstration
const MOCK_SKILLS = [
  {
    id: '1',
    name: 'React',
    category: 'Front-end',
    level: 5,
    yearsExperience: 3,
    tags: ['JavaScript', 'UI', 'Framework'],
    visibility: true,
    createdAt: '2023-06-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Node.js',
    category: 'Back-end',
    level: 4,
    yearsExperience: 2.5,
    tags: ['JavaScript', 'Server', 'API'],
    visibility: true,
    createdAt: '2023-05-20T10:00:00Z',
  },
  {
    id: '3',
    name: 'TypeScript',
    category: 'Front-end',
    level: 4,
    yearsExperience: 2,
    tags: ['JavaScript', 'Typing', 'Linting'],
    visibility: true,
    createdAt: '2023-07-10T10:00:00Z',
  },
  {
    id: '4',
    name: 'MongoDB',
    category: 'Database',
    level: 3,
    yearsExperience: 1.5,
    tags: ['NoSQL', 'Database', 'JSON'],
    visibility: true,
    createdAt: '2023-04-05T10:00:00Z',
  },
  {
    id: '5',
    name: 'GraphQL',
    category: 'Back-end',
    level: 3,
    yearsExperience: 1,
    tags: ['API', 'Query Language'],
    visibility: false,
    createdAt: '2023-08-01T10:00:00Z',
  },
  {
    id: '6',
    name: 'Docker',
    category: 'DevOps',
    level: 3,
    yearsExperience: 1,
    tags: ['Containers', 'Deployment'],
    visibility: true,
    createdAt: '2023-03-15T10:00:00Z',
  },
  {
    id: '7',
    name: 'Material UI',
    category: 'Front-end',
    level: 4,
    yearsExperience: 2,
    tags: ['UI', 'Components', 'React'],
    visibility: true,
    createdAt: '2023-05-01T10:00:00Z',
  },
  {
    id: '8',
    name: 'Git',
    category: 'Tools',
    level: 5,
    yearsExperience: 4,
    tags: ['Version Control'],
    visibility: true,
    createdAt: '2022-12-10T10:00:00Z',
  },
  {
    id: '9',
    name: 'AWS',
    category: 'DevOps',
    level: 2,
    yearsExperience: 0.5,
    tags: ['Cloud', 'Infrastructure'],
    visibility: false,
    createdAt: '2023-09-05T10:00:00Z',
  },
  {
    id: '10',
    name: 'PostgreSQL',
    category: 'Database',
    level: 4,
    yearsExperience: 2,
    tags: ['SQL', 'Relational'],
    visibility: true,
    createdAt: '2023-02-20T10:00:00Z',
  },
  {
    id: '11',
    name: 'Redux',
    category: 'Front-end',
    level: 4,
    yearsExperience: 2,
    tags: ['State Management', 'React'],
    visibility: true,
    createdAt: '2023-04-15T10:00:00Z',
  },
  {
    id: '12',
    name: 'Figma',
    category: 'Design',
    level: 3,
    yearsExperience: 1,
    tags: ['UI/UX', 'Design Tools'],
    visibility: true,
    createdAt: '2023-07-25T10:00:00Z',
  },
]; 
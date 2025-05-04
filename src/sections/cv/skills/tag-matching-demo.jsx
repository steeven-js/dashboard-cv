import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import AlertTitle from '@mui/material/AlertTitle';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress from '@mui/material/LinearProgress';

import { analyzePopularTags, calculateTagMatching } from 'src/data/skill-model';

import { Iconify } from 'src/components/iconify';

import { SkillTagSystem } from '.';

// Données de démonstration pour les compétences
const DEMO_SKILLS = [
  {
    id: '1',
    name: 'React',
    category: 'Front-end',
    level: 4,
    yearsExperience: 3,
    tags: ['JavaScript', 'UI', 'Frontend', 'SPA', 'Composants']
  },
  {
    id: '2',
    name: 'Node.js',
    category: 'Back-end',
    level: 3,
    yearsExperience: 2,
    tags: ['JavaScript', 'API', 'Backend', 'Serveur', 'Express']
  },
  {
    id: '3',
    name: 'TypeScript',
    category: 'Front-end',
    level: 4,
    yearsExperience: 2,
    tags: ['JavaScript', 'Type Safety', 'Frontend', 'Backend', 'Statique']
  },
  {
    id: '4',
    name: 'PostgreSQL',
    category: 'Database',
    level: 3,
    yearsExperience: 2.5,
    tags: ['SQL', 'RDBMS', 'Database', 'Relations', 'Requêtes']
  },
  {
    id: '5',
    name: 'Docker',
    category: 'DevOps',
    level: 3,
    yearsExperience: 1.5,
    tags: ['Container', 'DevOps', 'Deployment', 'CI/CD', 'Infrastructure']
  },
];

// Données de démonstration pour une offre d'emploi
const DEMO_JOB_OFFER = {
  title: "Développeur Full Stack React/Node.js",
  requiredSkills: ['React', 'Node.js', 'JavaScript', 'Express', 'MongoDB', 'RESTful API'],
  tags: ['Frontend', 'Backend', 'SPA', 'Agile', 'Type Safety', 'UI/UX', 'Git']
};

/**
 * Démonstration du système de tags et de l'analyse de correspondance
 */
export default function TagMatchingDemo() {
  const [selectedTags, setSelectedTags] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [recentSearches, setRecentSearches] = useState(['Frontend', 'API', 'SQL', 'Container']);
  const [matchingResult, setMatchingResult] = useState(null);
  
  // Analyser les tags populaires au chargement du composant
  useEffect(() => {
    const tags = analyzePopularTags(DEMO_SKILLS);
    setPopularTags(tags);
  }, []);
  
  // Gérer la sélection d'un tag
  const handleTagSelect = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Gérer la création d'un nouveau tag
  const handleTagCreate = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Gérer la recherche par tag
  const handleTagSearch = (tag) => {
    if (!recentSearches.includes(tag)) {
      setRecentSearches([tag, ...recentSearches.slice(0, 4)]);
    }
    
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Analyser la correspondance avec l'offre d'emploi
  const analyzeMatchingWithJobOffer = () => {
    // Créer un "profil utilisateur" basé sur les compétences de démo et les tags sélectionnés
    const userProfile = [...DEMO_SKILLS];
    
    // Ajouter une compétence virtuelle avec les tags sélectionnés
    if (selectedTags.length > 0) {
      userProfile.push({
        name: 'Compétences personnalisées',
        tags: selectedTags
      });
    }
    
    // Calculer la correspondance
    const result = calculateTagMatching(DEMO_JOB_OFFER, userProfile);
    setMatchingResult(result);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Système de tags pour les compétences
      </Typography>
      
      <Grid container spacing={3}>
        {/* Système de tags */}
        <Grid item xs={12} md={7}>
          <SkillTagSystem
            popularTags={popularTags}
            searchedTags={recentSearches}
            onTagSelect={handleTagSelect}
            onTagCreate={handleTagCreate}
            onTagSearch={handleTagSearch}
            selectedTags={selectedTags}
            sx={{ height: '100%' }}
          />
        </Grid>
        
        {/* Panneau de correspondance avec l&apos;offre */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Correspondance avec l&apos;offre d&apos;emploi
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {DEMO_JOB_OFFER.title}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                Compétences requises:
              </Typography>
              
              <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mb: 2 }}>
                {DEMO_JOB_OFFER.requiredSkills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    size="small"
                    variant="soft"
                    color="primary"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Stack>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                Tags de l&apos;offre:
              </Typography>
              
              <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mb: 3 }}>
                {DEMO_JOB_OFFER.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="outlined"
                    color="secondary"
                    sx={{ mr: 0.5, mb: 0.5 }}
                    onClick={() => handleTagSearch(tag)}
                  />
                ))}
              </Stack>
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={analyzeMatchingWithJobOffer}
                startIcon={<Iconify icon="solar:search-linear" />}
                sx={{ mb: 3 }}
              >
                Analyser la correspondance
              </Button>
              
              {/* Résultat de la correspondance */}
              {matchingResult && (
                <Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Résultat de l&apos;analyse
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Score de correspondance:
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={matchingResult.score}
                          color={
                            matchingResult.score > 75 ? 'success' : 
                            matchingResult.score > 50 ? 'info' : 
                            matchingResult.score > 30 ? 'warning' : 'error'
                          }
                          sx={{ height: 10, borderRadius: 1 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {matchingResult.score}%
                      </Typography>
                    </Box>
                    
                    {matchingResult.score > 75 ? (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <AlertTitle>Excellent match!</AlertTitle>
                        Votre profil correspond très bien à cette offre.
                      </Alert>
                    ) : matchingResult.score > 50 ? (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <AlertTitle>Bon match</AlertTitle>
                        Votre profil correspond bien à cette offre, mais pourrait être amélioré.
                      </Alert>
                    ) : matchingResult.score > 30 ? (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        <AlertTitle>Match moyen</AlertTitle>
                        Votre profil correspond partiellement à cette offre. Envisagez d&apos;ajouter des compétences.
                      </Alert>
                    ) : (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        <AlertTitle>Match faible</AlertTitle>
                        Votre profil ne correspond pas bien à cette offre.
                      </Alert>
                    )}
                  </Box>
                  
                  <Grid container spacing={2}>
                    {/* Tags correspondants */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" gutterBottom>
                        Compétences correspondantes ({matchingResult.matches.length}):
                      </Typography>
                      <List dense disablePadding>
                        {matchingResult.matches.map((tag, index) => (
                          <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                            <Iconify 
                              icon="solar:check-circle-bold" 
                              sx={{ color: 'success.main', mr: 1, width: 20, height: 20 }} 
                            />
                            <ListItemText primary={tag} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                    
                    {/* Tags manquants */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" gutterBottom>
                        Compétences manquantes ({matchingResult.missing.length}):
                      </Typography>
                      <List dense disablePadding>
                        {matchingResult.missing.map((tag, index) => (
                          <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                            <Iconify 
                              icon="solar:close-circle-bold" 
                              sx={{ color: 'error.main', mr: 1, width: 20, height: 20 }} 
                            />
                            <ListItemText 
                              primary={tag} 
                              primaryTypographyProps={{
                                sx: { textDecoration: 'line-through', opacity: 0.7 }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
} 
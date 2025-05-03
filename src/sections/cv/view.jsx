import { useState } from 'react';

import {
  Box,
  Tab,
  Card,
  Tabs,
  Grid,
  Chip,
  Stack,
  Paper,
  Button,
  Divider,
  Container,
  TextField,
  Typography,
  IconButton,
  LinearProgress
} from '@mui/material';

import { cvService } from 'src/services/cv';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

export function CVView() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [newInteret, setNewInteret] = useState('');
  const [formData, setFormData] = useState({
    informationsPersonnelles: {
      nom: '',
      prenom: '',
      titre: '',
      description: '',
      contact: {
        siteWeb: '',
        email: '',
        linkedin: '',
        telephone: ''
      }
    },
    competencesTechniques: {
      frontEnd: {
        titre: 'Front-End (UI/UX & Web Apps)',
        technologies: [],
        competences: []
      },
      mobile: {
        titre: 'Mobile (Apps iOS & Android)',
        technologies: [],
        competences: []
      },
      backEnd: {
        titre: 'Back-End & API (Scalabilité & Sécurité)',
        technologies: [],
        competences: []
      },
      basesDeDonnees: {
        titre: 'Bases de Données',
        technologies: [],
        competences: []
      },
      devOps: {
        titre: 'DevOps & Sécurité',
        technologies: [],
        competences: []
      }
    },
    experiencesEtProjets: [],
    formations: [],
    centresDInteret: []
  });

  // États pour les inputs temporaires dans chaque catégorie
  const [techInputs, setTechInputs] = useState({
    frontEnd: '',
    mobile: '',
    backEnd: '',
    basesDeDonnees: '',
    devOps: ''
  });
  
  const [compInputs, setCompInputs] = useState({
    frontEnd: '',
    mobile: '',
    backEnd: '',
    basesDeDonnees: '',
    devOps: ''
  });

  // États pour les expériences temporaires
  const [expTechInputs, setExpTechInputs] = useState({});
  const [expRealisationInputs, setExpRealisationInputs] = useState({});

  // Gestion des changements de formulaire
  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Gestion des changements de contact
  const handleContactChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      informationsPersonnelles: {
        ...prev.informationsPersonnelles,
        contact: {
          ...prev.informationsPersonnelles.contact,
          [field]: value
        }
      }
    }));
  };

  // Gestion des compétences techniques
  const handleTechChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      competencesTechniques: {
        ...prev.competencesTechniques,
        [category]: {
          ...prev.competencesTechniques[category],
          [field]: value
        }
      }
    }));
  };

  // Ajouter une technologie
  const addTechnology = (category, tech) => {
    if (tech && !formData.competencesTechniques[category].technologies.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        competencesTechniques: {
          ...prev.competencesTechniques,
          [category]: {
            ...prev.competencesTechniques[category],
            technologies: [...prev.competencesTechniques[category].technologies, tech]
          }
        }
      }));
      setTechInputs(prev => ({
        ...prev,
        [category]: ''
      }));
    }
  };

  // Supprimer une technologie
  const removeTechnology = (category, tech) => {
    setFormData(prev => ({
      ...prev,
      competencesTechniques: {
        ...prev.competencesTechniques,
        [category]: {
          ...prev.competencesTechniques[category],
          technologies: prev.competencesTechniques[category].technologies.filter(t => t !== tech)
        }
      }
    }));
  };

  // Ajouter une compétence
  const addCompetence = (category, competence) => {
    if (competence && !formData.competencesTechniques[category].competences.includes(competence)) {
      setFormData(prev => ({
        ...prev,
        competencesTechniques: {
          ...prev.competencesTechniques,
          [category]: {
            ...prev.competencesTechniques[category],
            competences: [...prev.competencesTechniques[category].competences, competence]
          }
        }
      }));
      setCompInputs(prev => ({
        ...prev,
        [category]: ''
      }));
    }
  };

  // Supprimer une compétence
  const removeCompetence = (category, competence) => {
    setFormData(prev => ({
      ...prev,
      competencesTechniques: {
        ...prev.competencesTechniques,
        [category]: {
          ...prev.competencesTechniques[category],
          competences: prev.competencesTechniques[category].competences.filter(c => c !== competence)
        }
      }
    }));
  };

  // Ajouter une expérience
  const addExperience = () => {
    const newExp = {
      poste: '',
      entreprise: '',
      site: '',
      technologies: [],
      description: '',
      realisations: []
    };
    
    const newExpId = Date.now().toString();
    
    setFormData(prev => ({
      ...prev,
      experiencesEtProjets: [...prev.experiencesEtProjets, newExp]
    }));
    
    setExpTechInputs(prev => ({
      ...prev,
      [newExpId]: ''
    }));
    
    setExpRealisationInputs(prev => ({
      ...prev,
      [newExpId]: ''
    }));
  };

  // Mettre à jour une expérience
  const updateExperience = (index, field, value) => {
    const newExperiences = [...formData.experiencesEtProjets];
    newExperiences[index] = {
      ...newExperiences[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      experiencesEtProjets: newExperiences
    }));
  };

  // Supprimer une expérience
  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experiencesEtProjets: prev.experiencesEtProjets.filter((_, i) => i !== index)
    }));
  };

  // Ajouter une technologie à une expérience
  const addExpTechnology = (expIndex, tech) => {
    if (tech) {
      const newExperiences = [...formData.experiencesEtProjets];
      if (!newExperiences[expIndex].technologies.includes(tech)) {
        newExperiences[expIndex].technologies = [...newExperiences[expIndex].technologies, tech];
        setFormData(prev => ({
          ...prev,
          experiencesEtProjets: newExperiences
        }));
        
        setExpTechInputs(prev => ({
          ...prev,
          [expIndex]: ''
        }));
      }
    }
  };

  // Supprimer une technologie d'une expérience
  const removeExpTechnology = (expIndex, tech) => {
    const newExperiences = [...formData.experiencesEtProjets];
    newExperiences[expIndex].technologies = newExperiences[expIndex].technologies.filter(t => t !== tech);
    setFormData(prev => ({
      ...prev,
      experiencesEtProjets: newExperiences
    }));
  };

  // Ajouter une réalisation à une expérience
  const addRealisation = (expIndex, realisation) => {
    if (realisation) {
      const newExperiences = [...formData.experiencesEtProjets];
      if (!newExperiences[expIndex].realisations.includes(realisation)) {
        newExperiences[expIndex].realisations = [...newExperiences[expIndex].realisations, realisation];
        setFormData(prev => ({
          ...prev,
          experiencesEtProjets: newExperiences
        }));
        
        setExpRealisationInputs(prev => ({
          ...prev,
          [expIndex]: ''
        }));
      }
    }
  };

  // Supprimer une réalisation d'une expérience
  const removeRealisation = (expIndex, realisationIndex) => {
    const newExperiences = [...formData.experiencesEtProjets];
    newExperiences[expIndex].realisations = newExperiences[expIndex].realisations.filter((_, i) => i !== realisationIndex);
    setFormData(prev => ({
      ...prev,
      experiencesEtProjets: newExperiences
    }));
  };

  // Ajouter une formation
  const addFormation = () => {
    setFormData(prev => ({
      ...prev,
      formations: [
        ...prev.formations,
        {
          diplome: '',
          etablissement: '',
          lieu: ''
        }
      ]
    }));
  };

  // Mettre à jour une formation
  const updateFormation = (index, field, value) => {
    const newFormations = [...formData.formations];
    newFormations[index] = {
      ...newFormations[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      formations: newFormations
    }));
  };

  // Supprimer une formation
  const removeFormation = (index) => {
    setFormData(prev => ({
      ...prev,
      formations: prev.formations.filter((_, i) => i !== index)
    }));
  };

  // Ajouter un centre d'intérêt
  const addInteret = (interet) => {
    if (interet && !formData.centresDInteret.includes(interet)) {
      setFormData(prev => ({
        ...prev,
        centresDInteret: [...prev.centresDInteret, interet]
      }));
      setNewInteret('');
    }
  };

  // Supprimer un centre d'intérêt
  const removeInteret = (index) => {
    setFormData(prev => ({
      ...prev,
      centresDInteret: prev.centresDInteret.filter((_, i) => i !== index)
    }));
  };

  // Enregistrer le CV via le service
  const saveCV = async () => {
    try {
      setLoading(true);
      
      // On s'assure que l'objet formData est correctement structuré
      const cvData = {
        data: formData
      };
      
      // Appel au service
      const data = await cvService.createCV(cvData);
      
      toast.success('CV enregistré avec succès!');
      
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du CV:', error);
      
      // Afficher un message d'erreur plus précis
      const errorMessage = error.message || 'Impossible d\'enregistrer le CV';
      toast.error(`Erreur: ${errorMessage}`);
      
      // Si l'erreur est liée à la table manquante, donner des instructions
      if (errorMessage.includes('table "cvs" n\'existe pas')) {
        toast.error('Vous devez créer la table "cvs" dans votre base de données Supabase avec les colonnes: id, user_id, content, created_at');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Créer votre CV
      </Typography>

      <Card>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            px: 2,
            bgcolor: 'background.neutral',
          }}
        >
          <Tab label="Informations personnelles" />
          <Tab label="Compétences techniques" />
          <Tab label="Expériences & Projets" />
          <Tab label="Formations & Intérêts" />
        </Tabs>

        <Divider />

        {loading && <LinearProgress />}

        <Stack spacing={3} sx={{ p: 3 }}>
          {/* Informations personnelles */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid lg={6} md={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  value={formData.informationsPersonnelles.nom}
                  onChange={(e) => handleChange('informationsPersonnelles', 'nom', e.target.value)}
                />
              </Grid>
              <Grid lg={6} md={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  value={formData.informationsPersonnelles.prenom}
                  onChange={(e) => handleChange('informationsPersonnelles', 'prenom', e.target.value)}
                />
              </Grid>
              <Grid lg={12}>
                <TextField
                  fullWidth
                  label="Titre"
                  value={formData.informationsPersonnelles.titre}
                  onChange={(e) => handleChange('informationsPersonnelles', 'titre', e.target.value)}
                  placeholder="Ex: Développeur Full-Stack React & Laravel"
                />
              </Grid>
              <Grid lg={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.informationsPersonnelles.description}
                  onChange={(e) => handleChange('informationsPersonnelles', 'description', e.target.value)}
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid lg={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>Contact</Typography>
              </Grid>
              <Grid lg={6} md={6}>
                <TextField
                  fullWidth
                  label="Site Web"
                  value={formData.informationsPersonnelles.contact.siteWeb}
                  onChange={(e) => handleContactChange('siteWeb', e.target.value)}
                />
              </Grid>
              <Grid lg={6} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.informationsPersonnelles.contact.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                />
              </Grid>
              <Grid lg={6} md={6}>
                <TextField
                  fullWidth
                  label="LinkedIn"
                  value={formData.informationsPersonnelles.contact.linkedin}
                  onChange={(e) => handleContactChange('linkedin', e.target.value)}
                />
              </Grid>
              <Grid lg={6} md={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  value={formData.informationsPersonnelles.contact.telephone}
                  onChange={(e) => handleContactChange('telephone', e.target.value)}
                />
              </Grid>
            </Grid>
          )}

          {/* Compétences techniques */}
          {activeTab === 1 && (
            <Stack spacing={4}>
              {Object.keys(formData.competencesTechniques).map((category) => (
                <Paper key={category} elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {formData.competencesTechniques[category].titre}
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Technologies</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                        {formData.competencesTechniques[category].technologies.map((tech) => (
                          <Chip
                            key={tech}
                            label={tech}
                            onDelete={() => removeTechnology(category, tech)}
                            sx={{ m: 0.5 }}
                          />
                        ))}
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <TextField
                          label="Ajouter une technologie"
                          size="small"
                          value={techInputs[category]}
                          onChange={(e) => setTechInputs({...techInputs, [category]: e.target.value})}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addTechnology(category, techInputs[category]);
                              e.preventDefault();
                            }
                          }}
                        />
                        <Button
                          variant="contained"
                          startIcon={<Iconify icon="eva:plus-fill" />}
                          onClick={() => {
                            addTechnology(category, techInputs[category]);
                          }}
                        >
                          Ajouter
                        </Button>
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Compétences</Typography>
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        {formData.competencesTechniques[category].competences.map((competence, index) => (
                          <Chip
                            key={index}
                            label={competence}
                            onDelete={() => removeCompetence(category, competence)}
                            sx={{ maxWidth: '100%' }}
                          />
                        ))}
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <TextField
                          label="Ajouter une compétence"
                          size="small"
                          fullWidth
                          value={compInputs[category]}
                          onChange={(e) => setCompInputs({...compInputs, [category]: e.target.value})}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addCompetence(category, compInputs[category]);
                              e.preventDefault();
                            }
                          }}
                        />
                        <Button
                          variant="contained"
                          startIcon={<Iconify icon="eva:plus-fill" />}
                          onClick={() => {
                            addCompetence(category, compInputs[category]);
                          }}
                        >
                          Ajouter
                        </Button>
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}

          {/* Expériences & Projets */}
          {activeTab === 2 && (
            <Stack spacing={3}>
              {formData.experiencesEtProjets.map((experience, index) => (
                <Paper key={index} elevation={2} sx={{ p: 3, position: 'relative' }}>
                  <IconButton
                    sx={{ position: 'absolute', top: 10, right: 10 }}
                    onClick={() => removeExperience(index)}
                  >
                    <Iconify icon="eva:trash-2-outline" />
                  </IconButton>
                  
                  <Grid container spacing={3}>
                    <Grid lg={6} md={6}>
                      <TextField
                        fullWidth
                        label="Poste"
                        value={experience.poste}
                        onChange={(e) => updateExperience(index, 'poste', e.target.value)}
                      />
                    </Grid>
                    <Grid lg={6} md={6}>
                      <TextField
                        fullWidth
                        label="Entreprise"
                        value={experience.entreprise}
                        onChange={(e) => updateExperience(index, 'entreprise', e.target.value)}
                      />
                    </Grid>
                    <Grid lg={12}>
                      <TextField
                        fullWidth
                        label="Site"
                        value={experience.site}
                        onChange={(e) => updateExperience(index, 'site', e.target.value)}
                      />
                    </Grid>
                    <Grid lg={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={experience.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        multiline
                        rows={2}
                      />
                    </Grid>
                    
                    <Grid lg={12}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Technologies</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                        {experience.technologies.map((tech) => (
                          <Chip
                            key={tech}
                            label={tech}
                            onDelete={() => removeExpTechnology(index, tech)}
                            sx={{ m: 0.5 }}
                          />
                        ))}
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <TextField
                          label="Ajouter une technologie"
                          size="small"
                          value={expTechInputs[index] || ''}
                          onChange={(e) => setExpTechInputs({...expTechInputs, [index]: e.target.value})}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addExpTechnology(index, expTechInputs[index]);
                              e.preventDefault();
                            }
                          }}
                        />
                        <Button
                          variant="contained"
                          startIcon={<Iconify icon="eva:plus-fill" />}
                          onClick={() => {
                            addExpTechnology(index, expTechInputs[index]);
                          }}
                        >
                          Ajouter
                        </Button>
                      </Stack>
                    </Grid>
                    
                    <Grid lg={12}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Réalisations</Typography>
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        {experience.realisations.map((realisation, realisationIndex) => (
                          <Box 
                            key={realisationIndex} 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              bgcolor: 'background.neutral',
                              borderRadius: 1,
                              p: 1
                            }}
                          >
                            <Typography variant="body2" sx={{ flex: 1 }}>{realisation}</Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => removeRealisation(index, realisationIndex)}
                            >
                              <Iconify icon="eva:trash-2-outline" fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <TextField
                          label="Ajouter une réalisation"
                          size="small"
                          fullWidth
                          value={expRealisationInputs[index] || ''}
                          onChange={(e) => setExpRealisationInputs({...expRealisationInputs, [index]: e.target.value})}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addRealisation(index, expRealisationInputs[index]);
                              e.preventDefault();
                            }
                          }}
                        />
                        <Button
                          variant="contained"
                          startIcon={<Iconify icon="eva:plus-fill" />}
                          onClick={() => {
                            addRealisation(index, expRealisationInputs[index]);
                          }}
                        >
                          Ajouter
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              
              <Button 
                variant="outlined" 
                startIcon={<Iconify icon="eva:plus-fill" />} 
                onClick={addExperience}
              >
                Ajouter une expérience
              </Button>
            </Stack>
          )}

          {/* Formations & Intérêts */}
          {activeTab === 3 && (
            <Stack spacing={4}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Formations</Typography>
                
                <Stack spacing={3}>
                  {formData.formations.map((formation, index) => (
                    <Paper key={index} elevation={2} sx={{ p: 3, position: 'relative' }}>
                      <IconButton
                        sx={{ position: 'absolute', top: 10, right: 10 }}
                        onClick={() => removeFormation(index)}
                      >
                        <Iconify icon="eva:trash-2-outline" />
                      </IconButton>
                      
                      <Grid container spacing={3}>
                        <Grid lg={12}>
                          <TextField
                            fullWidth
                            label="Diplôme"
                            value={formation.diplome}
                            onChange={(e) => updateFormation(index, 'diplome', e.target.value)}
                          />
                        </Grid>
                        <Grid lg={6} md={6}>
                          <TextField
                            fullWidth
                            label="Établissement"
                            value={formation.etablissement}
                            onChange={(e) => updateFormation(index, 'etablissement', e.target.value)}
                          />
                        </Grid>
                        <Grid lg={6} md={6}>
                          <TextField
                            fullWidth
                            label="Lieu"
                            value={formation.lieu}
                            onChange={(e) => updateFormation(index, 'lieu', e.target.value)}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                  
                  <Button 
                    variant="outlined" 
                    startIcon={<Iconify icon="eva:plus-fill" />} 
                    onClick={addFormation}
                  >
                    Ajouter une formation
                  </Button>
                </Stack>
              </Box>
              
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Centres d'intérêt</Typography>
                
                <Stack spacing={3}>
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      {formData.centresDInteret.map((interet, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            bgcolor: 'background.neutral',
                            borderRadius: 1,
                            p: 1
                          }}
                        >
                          <Typography variant="body2" sx={{ flex: 1 }}>{interet}</Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => removeInteret(index)}
                          >
                            <Iconify icon="eva:trash-2-outline" fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                    
                    <Stack direction="row" spacing={1}>
                      <TextField
                        label="Ajouter un centre d'intérêt"
                        size="small"
                        fullWidth
                        value={newInteret}
                        onChange={(e) => setNewInteret(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addInteret(newInteret);
                            e.preventDefault();
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        startIcon={<Iconify icon="eva:plus-fill" />}
                        onClick={() => {
                          addInteret(newInteret);
                        }}
                      >
                        Ajouter
                      </Button>
                    </Stack>
                  </Paper>
                </Stack>
              </Box>
            </Stack>
          )}
        </Stack>

        <Divider />

        <Stack 
          direction="row" 
          spacing={2} 
          justifyContent="flex-end"
          sx={{ p: 3 }}
        >
          <Button variant="outlined">Annuler</Button>
          <Button 
            variant="contained" 
            onClick={saveCV}
            disabled={loading}
          >
            Enregistrer
          </Button>
        </Stack>
      </Card>
    </Container>
  );
} 
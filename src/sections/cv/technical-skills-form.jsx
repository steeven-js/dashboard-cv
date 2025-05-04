import * as z from 'zod';
import { m } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { memo, useMemo, useState, useEffect, useCallback } from 'react';
import { useSensor, DndContext, useSensors, PointerSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import InputAdornment from '@mui/material/InputAdornment';
import DialogContentText from '@mui/material/DialogContentText';

import { getTechnicalSkills, saveTechnicalSkill, deleteTechnicalSkill, updateTechnicalSkillsOrder } from 'src/services/cv-service';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { varFade } from 'src/components/animate/variants';
import { CustomPopover } from 'src/components/custom-popover';

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

// Classification des compétences par catégorie pour les suggestions intelligentes
const CATEGORIZED_SKILLS = {
  'Front-end': [
    'React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'HTML', 'CSS', 'JavaScript', 'TypeScript',
    'Redux', 'Webpack', 'Vite', 'jQuery', 'Bootstrap', 'Tailwind CSS', 'Material UI', 'Sass',
    'Emotion', 'Styled Components', 'React Router', 'SWR', 'React Query', 'MobX', 'Remix'
  ],
  'Back-end': [
    'Node.js', 'Express.js', 'PHP', 'Laravel', 'Ruby on Rails', 'Django', 'Flask', 'ASP.NET',
    'Spring Boot', 'Java', 'Python', 'Go', 'Rust', 'C#', 'C++', 'GraphQL', 'REST', 'NestJS',
    'FastAPI', 'Strapi', 'Symfony', 'Hapi.js', 'Koa.js', 'Apollo Server'
  ],
  'Mobile': [
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'Ionic', 'Expo', 'Android SDK', 'iOS SDK',
    'SwiftUI', 'Xamarin', 'Cordova', 'Capacitor', 'Jetpack Compose', 'Mobile First Design'
  ],
  'Database': [
    'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Firebase', 'Redis', 'Elasticsearch', 'Supabase',
    'MariaDB', 'Oracle', 'SQL Server', 'DynamoDB', 'Cassandra', 'Neo4j', 'CouchDB', 'Firestore'
  ],
  'DevOps': [
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'Jenkins', 'GitHub Actions', 'Terraform',
    'Ansible', 'Nginx', 'Prometheus', 'Grafana', 'Linux', 'Bash', 'CI/CD', 'GitLab CI',
    'CircleCI', 'Travis CI', 'Pulumi', 'ArgoCD', 'Heroku', 'Netlify', 'Vercel'
  ],
  'Design': [
    'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'InVision', 'UX Research',
    'UI Design', 'Wireframing', 'Prototyping', 'User Testing', 'Accessibility', 'Design Systems'
  ],
  'Tools': [
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'JIRA', 'Confluence', 'Notion', 'Trello',
    'Slack', 'VS Code', 'IntelliJ IDEA', 'WebStorm', 'Postman', 'Insomnia', 'npm', 'yarn', 'pnpm'
  ],
  'Other': [
    'Agile', 'Scrum', 'Kanban', 'SEO', 'Analytics', 'Documentation', 'Testing', 'Jest',
    'Cypress', 'Selenium', 'WebdriverIO', 'Mocha', 'Chai', 'Sinon', 'TDD', 'BDD'
  ]
};

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

// Composant optimisé pour le titre de section
const SectionTitle = memo(({ title, subtitle }) => (
  <Box>
    <m.div variants={varFade('inUp')}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </m.div>
  </Box>
));

// Composant optimisé pour les actions
const ActionButtons = memo(({ onAdd, disableActions }) => (
  <Box>
    <m.div variants={varFade('inDown')}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box />
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={onAdd}
          disabled={disableActions}
          aria-label="Ajouter une nouvelle compétence"
        >
          Ajouter une compétence
        </Button>
      </Stack>
    </m.div>
  </Box>
));

// Composant optimisé pour la liste vide
const EmptySkillsList = memo(() => (
  <Box>
    <m.div variants={varFade('inUp')}>
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Aucune compétence technique</AlertTitle>
        Vous n&apos;avez pas encore ajouté de compétences techniques. Cliquez sur le bouton &quot;Ajouter une compétence&quot; pour commencer.
      </Alert>
    </m.div>
  </Box>
));

// Composant optimisé pour les messages d'ordre
const SortableInstructions = memo(() => (
  <Box>
    <m.div variants={varFade('inUp')}>
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Triez vos compétences</AlertTitle>
        Faites glisser les compétences pour les réorganiser selon leur importance. Les compétences en haut de la liste seront mises en avant sur votre CV.
      </Alert>
    </m.div>
  </Box>
));

// Composant optimisé pour les tooltips d'aide
const HelpTooltip = memo(({ content, placement = "top-right" }) => {
  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  return (
    <>
      <Tooltip title="Aide">
        <IconButton 
          onClick={handleOpen}
          size="small" 
          color="primary"
          aria-label="Afficher de l'aide"
          sx={{ ml: 0.5 }}
        >
          <Iconify icon="eva:info-outline" width={20} height={20} />
        </IconButton>
      </Tooltip>

      <CustomPopover
        open={open}
        onClose={handleClose}
        anchorEl={open}
        slotProps={{
          arrow: {
            placement,
          },
          paper: {
            sx: { maxWidth: 320 }
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Aide contextuelle</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {content}
          </Typography>
        </Box>
      </CustomPopover>
    </>
  );
});

// Composant optimisé pour le sélecteur de catégorie
const CategorySelect = memo(({ value, onChange }) => (
    <Field.Select
      name="category"
      label="Catégorie"
      fullWidth
      required
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <HelpTooltip content="Regroupez vos compétences par catégorie pour une meilleure organisation de votre CV." />
          </InputAdornment>
        ),
      }}
    >
      {SKILL_CATEGORIES.map((category) => (
        <MenuItem key={category.value} value={category.value}>
          {category.label}
        </MenuItem>
      ))}
    </Field.Select>
  ));

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
  const [suggestedSkills, setSuggestedSkills] = useState(SKILL_SUGGESTIONS);

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

  const { reset, handleSubmit, watch } = methods;
  
  // Observer la catégorie pour filtrer les suggestions intelligentes
  const selectedCategory = watch('category');
  
  // Fonction optimisée pour générer des suggestions basées sur les compétences déjà saisies
  const getIntelligentSuggestions = useCallback((currentCategory) => {
    // Compétences déjà ajoutées dans cette catégorie
    const existingSkillsInCategory = skills
      .filter(skill => skill.category === currentCategory)
      .map(skill => skill.name.toLowerCase());
      
    // Filtrer les suggestions pour exclure les compétences déjà ajoutées
    const filteredSuggestions = currentCategory && CATEGORIZED_SKILLS[currentCategory]
      ? CATEGORIZED_SKILLS[currentCategory].filter(
          suggestion => !existingSkillsInCategory.includes(suggestion.toLowerCase())
        )
      : SKILL_SUGGESTIONS.filter(
          suggestion => !skills.some(skill => skill.name.toLowerCase() === suggestion.toLowerCase())
        );
        
    return filteredSuggestions;
  }, [skills]);

  // Mettre à jour les suggestions en fonction de la catégorie sélectionnée
  useEffect(() => {
    if (selectedCategory) {
      setSuggestedSkills(getIntelligentSuggestions(selectedCategory));
    } else {
      setSuggestedSkills(SKILL_SUGGESTIONS);
    }
  }, [selectedCategory, getIntelligentSuggestions]);

  // Configurer le sensor pour le drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  // Mémoriser les IDs de compétences pour SortableContext
  const skillIds = useMemo(() => skills.map((skill) => skill.id), [skills]);

  // Charger les compétences au chargement du composant
  useEffect(() => {
    const loadSkills = async () => {
      try {
        setIsLoading(true);
        const data = await getTechnicalSkills();
        
        // Tenter de récupérer les données du localStorage si l'API échoue
        if (!data || data.length === 0) {
          const cachedSkills = localStorage.getItem('cv_technical_skills');
          if (cachedSkills) {
            setSkills(JSON.parse(cachedSkills));
          }
        } else {
          setSkills(data);
          // Mettre en cache les données récupérées
          localStorage.setItem('cv_technical_skills', JSON.stringify(data));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des compétences:', error);
        
        // Récupérer depuis le cache en cas d'erreur
        const cachedSkills = localStorage.getItem('cv_technical_skills');
        if (cachedSkills) {
          setSkills(JSON.parse(cachedSkills));
          toast.info('Données chargées depuis le cache local', {
            description: 'Connexion au serveur impossible, utilisation des données en cache',
          });
        } else {
          toast.error('Erreur lors du chargement des données', {
            description: 'Impossible de récupérer vos compétences techniques',
          });
        }
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

  // Annuler la suppression
  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setSkillToDelete(null);
  };

  // Effectuer la suppression
  const handleDeleteSkill = async () => {
    if (!skillToDelete) return;

    try {
      // Supprimer la compétence
      await deleteTechnicalSkill(skillToDelete);
      
      // Mettre à jour l'état local
      const updatedSkills = skills.filter((skill) => skill.id !== skillToDelete);
      setSkills(updatedSkills);
      
      // Mettre à jour le cache local
      localStorage.setItem('cv_technical_skills', JSON.stringify(updatedSkills));
      
      toast.success('Compétence supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression', {
        description: 'Impossible de supprimer cette compétence',
      });
    } finally {
      // Fermer la boîte de dialogue
      setDeleteConfirmOpen(false);
      setSkillToDelete(null);
    }
  };

  // Soumettre le formulaire
  const onSubmit = async (data) => {
    setIsSaving(true);
    
    try {
      // Sauvegarder dans Supabase
      const savedSkill = await saveTechnicalSkill(data);
      
      let updatedSkills;
      
      if (editingSkill) {
        // Mise à jour d'une compétence existante
        updatedSkills = skills.map((skill) => (skill.id === savedSkill.id ? savedSkill : skill));
      } else {
        // Ajout d'une nouvelle compétence
        updatedSkills = [...skills, savedSkill];
      }
      
      // Mettre à jour l'état local
      setSkills(updatedSkills);
      
      // Mettre à jour le cache local
      localStorage.setItem('cv_technical_skills', JSON.stringify(updatedSkills));
      
      // Fermer la modale
      setModalOpen(false);
      
      // Afficher un message de succès
      toast.success(
        editingSkill ? 'Compétence mise à jour avec succès' : 'Nouvelle compétence ajoutée',
        {
          description: `La compétence "${data.name}" a été ${
            editingSkill ? 'mise à jour' : 'ajoutée'
          } avec succès.`,
        }
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde', {
        description: 'Impossible de sauvegarder cette compétence',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Gérer le changement d'ordre des compétences
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    // Mettre à jour l'ordre dans l'état local
    const oldIndex = skills.findIndex((skill) => skill.id === active.id);
    const newIndex = skills.findIndex((skill) => skill.id === over.id);
    
    const newOrder = arrayMove(skills, oldIndex, newIndex);
    
    // Mettre à jour l'état local immédiatement pour une UI réactive
    setSkills(newOrder);
    
    // Mettre à jour le cache local
    localStorage.setItem('cv_technical_skills', JSON.stringify(newOrder));
    
    // Synchroniser avec le serveur
    try {
      setIsSavingOrder(true);
      await updateTechnicalSkillsOrder(newOrder.map((skill) => skill.id));
      toast.success('Ordre des compétences mis à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'ordre:', error);
      toast.error('Erreur lors de la mise à jour de l\'ordre');
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Afficher un chargement
  if (isLoading) {
    return (
      <Card sx={{ p: 3 }}>
        <Box sx={{ width: '100%', py: 5 }} role="progressbar" aria-label="Chargement des compétences techniques">
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
            Chargement de vos compétences techniques...
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Box>
      <m.div variants={varFade('in')}>
        <Box sx={{ width: '100%' }}>
          <DndContext 
            sensors={sensors} 
            onDragEnd={handleDragEnd}
            accessibility={{
              announcements: {
                onDragStart: ({ active }) => `Déplacement de la compétence ${active.id} commencé`,
                onDragOver: ({ active, over }) => over 
                  ? `Compétence ${active.id} déplacée au-dessus de ${over.id}` 
                  : `Compétence ${active.id} en cours de déplacement`,
                onDragEnd: ({ active, over }) => over 
                  ? `Compétence ${active.id} déposée sur ${over.id}` 
                  : `Déplacement de la compétence ${active.id} annulé`,
              }
            }}
          >
            <SectionTitle 
              title="Compétences Techniques" 
              subtitle="Ajoutez et organisez vos compétences techniques. Faites glisser pour réorganiser selon leur importance." 
            />
            
            <ActionButtons 
              onAdd={handleAddSkill} 
              disableActions={isLoading || isSaving || isSavingOrder} 
            />
            
            {skills.length > 0 && <SortableInstructions />}
            
            {skills.length === 0 && !isLoading && <EmptySkillsList />}
            
            {isLoading ? (
              <Box sx={{ py: 3 }}>
                <LinearProgress aria-label="Chargement des compétences" />
                <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                  Chargement de vos compétences...
                </Typography>
              </Box>
            ) : (
              <SortableContext items={skillIds} strategy={verticalListSortingStrategy}>
                <Stack spacing={2}>
                  {skills.map((skill) => (
                    <SkillItem
                      key={skill.id}
                      skill={skill}
                      onEdit={() => handleEditSkill(skill)}
                      onDelete={() => handleDeleteConfirm(skill.id)}
                      disableActions={isSavingOrder}
                    />
                  ))}
                </Stack>
              </SortableContext>
            )}
            
            {/* Modal d'édition/ajout de compétence */}
            <Dialog
              open={modalOpen}
              onClose={handleCloseModal}
              fullWidth
              maxWidth="sm"
              aria-labelledby="skill-dialog-title"
            >
              <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle id="skill-dialog-title">
                  {editingSkill ? 'Modifier la compétence' : 'Ajouter une nouvelle compétence'}
                </DialogTitle>
                
                <DialogContent dividers>
                  <Stack spacing={3} sx={{ pt: 1 }}>
                    <Field.TextField
                      name="name"
                      label="Nom de la compétence"
                      required
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <HelpTooltip content="Nom de la technologie ou compétence (ex: React, Node.js, SQL, Design UI/UX)" />
                          </InputAdornment>
                        ),
                      }}
                      aria-describedby="skill-name-help"
                    />
                    <Typography id="skill-name-help" variant="caption" sx={{ mt: -2, color: 'text.secondary' }}>
                      Suggestions: {suggestedSkills.slice(0, 5).join(', ')}
                    </Typography>
                    
                    <CategorySelect />
                    
                    <Field.Slider
                      name="level"
                      label="Niveau de maîtrise"
                      marks={[
                        { value: 1, label: 'Débutant' },
                        { value: 2, label: 'Notions' },
                        { value: 3, label: 'Intermédiaire' },
                        { value: 4, label: 'Avancé' },
                        { value: 5, label: 'Expert' },
                      ]}
                      min={1}
                      max={5}
                      step={1}
                      aria-describedby="skill-level-help"
                    />
                    <Typography id="skill-level-help" variant="caption" sx={{ mt: -2, color: 'text.secondary' }}>
                      Évaluez votre niveau de maîtrise de cette compétence de manière réaliste
                    </Typography>
                    
                    <Field.NumberInput
                      name="yearsExperience"
                      label="Années d'expérience"
                      helperText="Nombre d'années d'utilisation de cette compétence"
                      min={0}
                      max={30}
                      step={0.5}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <HelpTooltip content="Indiquez depuis combien d'années vous utilisez cette compétence (incluant projets personnels et professionnels)" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <SkillTagInput
                      name="tags"
                      label="Tags associés"
                      helperText="Ajoutez des mots-clés liés à cette compétence pour faciliter le matching avec les offres"
                    />
                    
                    <Field.Switch
                      name="visibility"
                      label="Afficher sur le CV"
                      helperText="Décochez si vous souhaitez masquer cette compétence sur certains CV"
                      sx={{ mt: 2 }}
                    />
                  </Stack>
                </DialogContent>
                
                <DialogActions>
                  <Button 
                    onClick={handleCloseModal} 
                    color="inherit"
                  >
                    Annuler
                  </Button>
                  <LoadingButton 
                    type="submit" 
                    variant="contained" 
                    loading={isSaving}
                  >
                    {editingSkill ? 'Mettre à jour' : 'Ajouter'}
                  </LoadingButton>
                </DialogActions>
              </Form>
            </Dialog>
            
            {/* Dialog de confirmation de suppression */}
            <Dialog
              open={deleteConfirmOpen}
              onClose={handleCancelDelete}
              aria-labelledby="confirm-delete-dialog-title"
              aria-describedby="confirm-delete-dialog-description"
            >
              <DialogTitle id="confirm-delete-dialog-title">
                Confirmer la suppression
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="confirm-delete-dialog-description">
                  Êtes-vous sûr de vouloir supprimer cette compétence ? Cette action est irréversible.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCancelDelete} color="inherit">
                  Annuler
                </Button>
                <LoadingButton 
                  onClick={handleDeleteSkill} 
                  color="error"
                  loading={isSaving}
                >
                  Supprimer
                </LoadingButton>
              </DialogActions>
            </Dialog>
          </DndContext>
        </Box>
      </m.div>
    </Box>
  );
} 
import * as z from 'zod';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormHelperText from '@mui/material/FormHelperText';
import DialogContentText from '@mui/material/DialogContentText';

import { Form, RHFSwitch, RHFSelect, RHFSlider, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

// ----------------------------------------------------------------------

// Catégories de compétences disponibles
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

// Suggestions de compétences par catégorie
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

// Liste de toutes les suggestions de tags (fusion de toutes les catégories)
const ALL_TAG_SUGGESTIONS = Object.values(CATEGORIZED_SKILLS).flat();

// ----------------------------------------------------------------------

// Schéma de validation Zod
const SkillSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Le nom de la compétence est requis').max(50, 'Maximum 50 caractères'),
  category: z.string().min(1, 'La catégorie est requise'),
  level: z.number().min(1).max(5),
  yearsExperience: z.number().min(0, 'La valeur doit être positive').max(50),
  tags: z.array(z.string()).default([]),
  visibility: z.boolean().default(true),
});

// Valeurs par défaut pour une nouvelle compétence
const defaultValues = {
  name: '',
  category: '',
  level: 3,
  yearsExperience: 1,
  tags: [],
  visibility: true,
};

/**
 * Composant de dialogue pour ajouter ou modifier une compétence technique
 */
export default function SkillDialog({ skill, open, onClose, onSubmit }) {
  const isEdit = !!skill;
  
  // Configuration du formulaire avec React Hook Form et Zod
  const methods = useForm({
    resolver: zodResolver(SkillSchema),
    defaultValues,
  });
  
  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = methods;
  
  // Récupérer la catégorie actuelle pour les suggestions de tags
  const currentCategory = watch('category');
  
  // Réinitialiser le formulaire lorsque le dialogue s'ouvre ou la compétence change
  useEffect(() => {
    if (open) {
      if (skill) {
        // Édition d'une compétence existante
        reset({
          id: skill.id,
          name: skill.name || '',
          category: skill.category || '',
          level: skill.level || 3,
          yearsExperience: skill.yearsExperience || 1,
          tags: skill.tags || [],
          visibility: skill.visibility !== undefined ? skill.visibility : true,
        });
      } else {
        // Création d'une nouvelle compétence
        reset(defaultValues);
      }
    }
  }, [open, skill, reset]);
  
  // Gérer la soumission du formulaire
  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };
  
  // Obtenir les suggestions de tags en fonction de la catégorie sélectionnée
  const getTagSuggestions = () => {
    if (!currentCategory) return ALL_TAG_SUGGESTIONS;
    return CATEGORIZED_SKILLS[currentCategory] || [];
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        {isEdit ? 'Modifier la compétence' : 'Ajouter une compétence'}
      </DialogTitle>
      
      <Form methods={methods} onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent sx={{ pb: 0, mt: 1 }}>
          <DialogContentText sx={{ mb: 3 }}>
            {isEdit 
              ? 'Modifiez les informations ci-dessous pour mettre à jour cette compétence.'
              : 'Remplissez les informations ci-dessous pour ajouter une nouvelle compétence.'}
          </DialogContentText>
          
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
            }}
          >
            <RHFTextField name="name" label="Nom de la compétence" />
            
            <RHFSelect name="category" label="Catégorie">
              <MenuItem value="" disabled>Sélectionnez une catégorie</MenuItem>
              {SKILL_CATEGORIES.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </RHFSelect>
            
            <Box>
              <RHFSlider
                name="level"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={5}
                sx={{
                  '& .MuiSlider-markLabel': { fontSize: 13 },
                }}
              />
              
              <Box sx={{ mt: -2, display: 'flex', justifyContent: 'space-between' }}>
                <FormHelperText sx={{ textAlign: 'left' }}>Débutant</FormHelperText>
                <FormHelperText sx={{ textAlign: 'center' }}>Niveau de maîtrise</FormHelperText>
                <FormHelperText sx={{ textAlign: 'right' }}>Expert</FormHelperText>
              </Box>
            </Box>
            
            <RHFTextField
              name="yearsExperience"
              label="Années d'expérience"
              type="number"
              InputProps={{ inputProps: { min: 0, step: 0.5 } }}
            />
            
            <RHFAutocomplete
              name="tags"
              label="Tags associés"
              multiple
              freeSolo
              options={getTagSuggestions()}
              ChipProps={{ size: 'small' }}
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={option}
                    size="small"
                    variant="soft"
                    color="primary"
                  />
                ))
              }
            />
            
            <RHFSwitch
              name="visibility"
              label="Afficher cette compétence sur le CV"
              labelPlacement="start"
              sx={{
                mt: 1,
                mx: 0,
                width: 1,
                justifyContent: 'space-between',
              }}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, pt: 3 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
          >
            Annuler
          </Button>
          
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            disabled={!isDirty}
          >
            {isEdit ? 'Mettre à jour' : 'Ajouter'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

SkillDialog.propTypes = {
  skill: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
}; 
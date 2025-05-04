import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';

import { supabase } from 'src/lib/supabase';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';

import EducationForm from './education-form';
import ExperienceForm from './experience-form';
import PersonalInfoForm from './personal-info-form';
import TechnicalSkillsForm from './technical-skills-form';
import PersonalProjectsForm from './personal-projects-form';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'personal-info', label: 'Informations personnelles', component: PersonalInfoForm },
  { value: 'technical-skills', label: 'Compétences techniques', component: TechnicalSkillsForm },
  { value: 'professional-experience', label: 'Expériences professionnelles', component: ExperienceForm },
  { value: 'personal-projects', label: 'Projets personnels', component: PersonalProjectsForm },
  { value: 'education', label: 'Formations et diplômes', component: EducationForm },
];

// ----------------------------------------------------------------------

export default function CVBuilder() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  
  const [currentTab, setCurrentTab] = useState('personal-info');
  const [progress, setProgress] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [savingTimeout, setSavingTimeout] = useState(null);
  
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    // Extraire l'onglet de l'URL si présent
    const tabFromPath = pathname.split('/').pop();
    const validTab = TABS.find((tab) => tab.value === tabFromPath);
    
    if (validTab) {
      setCurrentTab(validTab.value);
    }
    
    // Calculer la progression initiale
    calculateProgress();
  }, [pathname]);

  const calculateProgress = async () => {
    try {
      const { data: personalInfo } = await supabase.from('personal_info').select('*').single();
      const { data: skills } = await supabase.from('technical_skills').select('*');
      const { data: experiences } = await supabase.from('experiences').select('*');
      const { data: projects } = await supabase.from('personal_projects').select('*');
      const { data: education } = await supabase.from('education').select('*');
      
      const sections = [
        !!personalInfo && Object.keys(personalInfo).length > 3,
        skills && skills.length > 0,
        experiences && experiences.length > 0,
        projects && projects.length > 0,
        education && education.length > 0,
      ];
      
      const completedSections = sections.filter(Boolean).length;
      setProgress((completedSections / sections.length) * 100);
      
    } catch (error) {
      console.error('Erreur lors du calcul de la progression:', error);
    }
  };

  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
    router.push(paths.dashboard[camelCase(newValue)]);
  };

  const handleTabNavigation = (direction) => {
    const currentIndex = TABS.findIndex((tab) => tab.value === currentTab);
    
    if (direction === 'next' && currentIndex < TABS.length - 1) {
      const nextTab = TABS[currentIndex + 1].value;
      setCurrentTab(nextTab);
      router.push(paths.dashboard[camelCase(nextTab)]);
    } else if (direction === 'prev' && currentIndex > 0) {
      const prevTab = TABS[currentIndex - 1].value;
      setCurrentTab(prevTab);
      router.push(paths.dashboard[camelCase(prevTab)]);
    }
  };

  const handleSaveData = (data, section) => {
    // Mettre à jour les données du formulaire
    setFormData((prev) => ({
      ...prev,
      [section]: data,
    }));
    
    // Annuler le timeout précédent s'il existe
    if (savingTimeout) {
      clearTimeout(savingTimeout);
    }
    
    // Configurer un nouveau timeout pour la sauvegarde automatique
    const newTimeout = setTimeout(() => {
      toast.success('Vos données ont été automatiquement sauvegardées');
      calculateProgress();
    }, 3000);
    
    setSavingTimeout(newTimeout);
  };

  const handleExportJSON = () => {
    try {
      const jsonData = JSON.stringify(formData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cv-data.json';
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('Les données ont été exportées au format JSON');
    } catch (error) {
      toast.error('Erreur lors de l\'exportation: ' + error.message);
    }
  };

  const togglePreview = () => {
    setPreviewOpen(!previewOpen);
  };

  const renderTabs = () => (
    <CustomTabs
      value={currentTab}
      onChange={handleChangeTab}
      sx={{
        mb: 3,
        '& .MuiTabs-flexContainer': {
          justifyContent: mdUp ? 'center' : 'flex-start',
        },
      }}
    >
      {TABS.map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </CustomTabs>
  );

  const renderTabContent = () => {
    const CurrentTabComponent = TABS.find((tab) => tab.value === currentTab)?.component;
    
    if (!CurrentTabComponent) return null;
    
    return (
      <CurrentTabComponent 
        onSaveData={(data) => handleSaveData(data, currentTab)}
      />
    );
  };

  const renderPreview = () => (
    <Drawer
      anchor="right"
      open={previewOpen}
      onClose={togglePreview}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 480 } },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Prévisualisation du CV
        </Typography>
        
        {/* Contenu de prévisualisation à implémenter */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          La prévisualisation du CV sera implémentée dans une prochaine étape.
        </Typography>
        
        <Button
          fullWidth
          color="primary"
          variant="contained"
          onClick={togglePreview}
          startIcon={<Iconify icon="eva:close-fill" />}
        >
          Fermer
        </Button>
      </Box>
    </Drawer>
  );

  // Fonction utilitaire pour convertir kebab-case en camelCase pour accéder à paths.dashboard
  const camelCase = (str) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

  return (
    <Container maxWidth="lg">
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Créez votre CV
        </Typography>
        
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ 
              flexGrow: 1, 
              height: 8,
              borderRadius: 1,
            }}
          />
          <Typography variant="body2" sx={{ minWidth: 40 }}>
            {`${Math.round(progress)}%`}
          </Typography>
        </Stack>
        
        {renderTabs()}
        
        {renderTabContent()}
        
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              color="inherit"
              variant="outlined"
              onClick={() => handleTabNavigation('prev')}
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              disabled={currentTab === TABS[0].value}
            >
              Précédent
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              color="primary"
              variant="contained"
              onClick={togglePreview}
              startIcon={<Iconify icon="eva:eye-fill" />}
            >
              Prévisualiser
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              color="primary"
              variant="contained"
              onClick={() => handleTabNavigation('next')}
              endIcon={<Iconify icon="eva:arrow-forward-fill" />}
              disabled={currentTab === TABS[TABS.length - 1].value}
            >
              Suivant
            </Button>
          </Grid>

          {currentTab === TABS[TABS.length - 1].value && (
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                fullWidth
                color="success"
                variant="contained"
                onClick={handleExportJSON}
                startIcon={<Iconify icon="eva:download-fill" />}
              >
                Exporter en JSON
              </Button>
            </Grid>
          )}
        </Grid>
      </Card>

      {renderPreview()}
    </Container>
  );
} 
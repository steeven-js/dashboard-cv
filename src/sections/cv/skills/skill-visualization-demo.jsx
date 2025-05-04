import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';

import SkillBarChart from './skill-bar-chart';
import SkillRadarChart from './skill-radar-chart';
import SkillLevelIndicator from './skill-level-indicator';
import SkillComparisonCard from './skill-comparison-card';

// ----------------------------------------------------------------------

// Données de démonstration
const DEMO_SKILLS = [
  { id: '1', name: 'React', level: 4, category: 'Front-end', yearsExperience: 3, tags: ['frontend', 'javascript'] },
  { id: '2', name: 'Node.js', level: 3, category: 'Back-end', yearsExperience: 2, tags: ['backend', 'javascript'] },
  { id: '3', name: 'TypeScript', level: 3, category: 'Front-end', yearsExperience: 2, tags: ['frontend', 'backend', 'language'] },
  { id: '4', name: 'MongoDB', level: 2, category: 'Database', yearsExperience: 1, tags: ['database', 'nosql'] },
  { id: '5', name: 'Docker', level: 2, category: 'DevOps', yearsExperience: 1, tags: ['deployment', 'containerization'] },
  { id: '6', name: 'GraphQL', level: 3, category: 'Back-end', yearsExperience: 2, tags: ['api', 'backend'] },
  { id: '7', name: 'Material UI', level: 4, category: 'Front-end', yearsExperience: 3, tags: ['frontend', 'ui'] },
];

const DEMO_REQUIRED_SKILLS = [
  { name: 'React', level: 4 },
  { name: 'Node.js', level: 4 },
  { name: 'TypeScript', level: 3 },
  { name: 'MongoDB', level: 3 },
  { name: 'Docker', level: 3 },
  { name: 'GraphQL', level: 2 },
  { name: 'Material UI', level: 3 },
];

// ----------------------------------------------------------------------

export default function SkillVisualizationDemo() {
  const theme = useTheme();
  const [displayMode, setDisplayMode] = useState('stars');
  const [currentTab, setCurrentTab] = useState('individual');

  const handleChangeDisplayMode = (event, newMode) => {
    setDisplayMode(newMode);
  };

  const handleChangeTab = (event, newTab) => {
    setCurrentTab(newTab);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Visualisation des Niveaux de Compétence
      </Typography>

      <CustomTabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{ mb: 5 }}
        tabs={[
          { value: 'individual', label: 'Indicateurs Individuels', icon: <Iconify icon="mdi:chart-bar" width={20} /> },
          { value: 'comparison', label: 'Comparaison', icon: <Iconify icon="mdi:compare" width={20} /> },
          { value: 'charts', label: 'Graphiques', icon: <Iconify icon="mdi:chart-areaspline" width={20} /> },
        ]}
      />

      {currentTab === 'individual' && (
        <Card>
          <CardHeader title="Modes d'affichage des niveaux" />

          <Box sx={{ px: 3, pb: 3 }}>
            <Tabs
              value={displayMode}
              onChange={handleChangeDisplayMode}
              sx={{ mb: 4 }}
            >
              <Tab value="stars" label="Étoiles" />
              <Tab value="bar" label="Barre" />
              <Tab value="text" label="Texte" />
              <Tab value="numeric" label="Numérique" />
            </Tabs>

            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5].map((level) => (
                <Grid item xs={12} sm={6} md={4} key={level}>
                  <Paper
                    sx={{
                      p: 3,
                      boxShadow: theme.customShadows.z4,
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    <Typography variant="subtitle1">
                      Niveau {level}
                    </Typography>
                    
                    <SkillLevelIndicator
                      level={level}
                      displayMode={displayMode}
                      tooltips
                      animated
                      sx={{ my: 1 }}
                    />
                    
                    <SkillLevelIndicator
                      level={level}
                      requiredLevel={level < 5 ? level + 1 : level}
                      displayMode={displayMode}
                      tooltips
                      animated
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Card>
      )}

      {currentTab === 'comparison' && (
        <Grid container spacing={3}>
          {DEMO_SKILLS.map((skill) => {
            const requiredSkill = DEMO_REQUIRED_SKILLS.find((req) => req.name === skill.name);
            if (!requiredSkill) return null;
            
            return (
              <Grid item xs={12} sm={6} md={4} key={skill.id}>
                <SkillComparisonCard 
                  skill={skill} 
                  requiredSkill={requiredSkill}
                  showDetails
                />
              </Grid>
            );
          })}
        </Grid>
      )}

      {currentTab === 'charts' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <SkillRadarChart
              skills={DEMO_SKILLS}
              requiredSkills={DEMO_REQUIRED_SKILLS}
              title="Radar des compétences"
              subheader="Comparaison du niveau actuel et requis"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <SkillBarChart
              skills={DEMO_SKILLS}
              requiredSkills={DEMO_REQUIRED_SKILLS}
              title="Niveaux par catégorie"
              subheader="Moyenne des niveaux par catégorie de compétence"
            />
          </Grid>
        </Grid>
      )}
    </Container>
  );
} 
import { useMemo } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * Widget de statistiques pour les compétences techniques
 */
export default function SkillStatisticsWidget({ skills = [] }) {
  const stats = useMemo(() => {
    if (!skills.length) {
      return {
        totalCount: 0,
        visibleCount: 0,
        categoryCounts: {},
        avgLevel: 0,
        topCategories: [],
      };
    }

    // Calculer les statistiques
    const visibleCount = skills.filter((skill) => skill.visibility).length;
    
    // Compter les compétences par catégorie
    const categoryCounts = skills.reduce((acc, skill) => {
      const category = skill.category || 'Non classé';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    // Calculer le niveau moyen
    const totalLevel = skills.reduce((sum, skill) => sum + (skill.level || 0), 0);
    const avgLevel = skills.length ? +(totalLevel / skills.length).toFixed(1) : 0;
    
    // Déterminer les catégories principales (top 3)
    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));
    
    return {
      totalCount: skills.length,
      visibleCount,
      categoryCounts,
      avgLevel,
      topCategories,
    };
  }, [skills]);
  
  // Si aucune compétence, afficher un état vide
  if (!stats.totalCount) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ textAlign: 'center', py: 3 }}>
          Aucune statistique disponible
        </Typography>
      </Card>
    );
  }
  
  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Statistiques des compétences
      </Typography>
      
      <Stack spacing={3}>
        <Stack 
          direction="row" 
          justifyContent="space-around" 
          divider={<Divider orientation="vertical" flexItem />}
        >
          <Stack alignItems="center" spacing={1}>
            <Typography variant="h4">{stats.totalCount}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Compétences
            </Typography>
          </Stack>
          
          <Stack alignItems="center" spacing={1}>
            <Typography variant="h4">{stats.visibleCount}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Visibles
            </Typography>
          </Stack>
          
          <Stack alignItems="center" spacing={1} position="relative">
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={stats.avgLevel * 20} // Convertir le niveau (1-5) en pourcentage (0-100)
                size={56}
                thickness={4}
                sx={{
                  color: (theme) => theme.palette.primary.main,
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h6" component="div">
                  {stats.avgLevel}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Niveau moyen
            </Typography>
          </Stack>
        </Stack>
        
        {stats.topCategories.length > 0 && (
          <>
            <Divider />
            
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Principales catégories
              </Typography>
              
              <Stack spacing={1.5}>
                {stats.topCategories.map((category) => (
                  <Stack 
                    key={category.name}
                    direction="row" 
                    alignItems="center" 
                    spacing={1}
                  >
                    <Iconify
                      icon="carbon:category"
                      width={20}
                      sx={{ color: 'text.secondary' }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2">{category.name}</Typography>
                    </Box>
                    <Typography variant="subtitle2">{category.count}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </>
        )}
      </Stack>
    </Card>
  );
}

SkillStatisticsWidget.propTypes = {
  skills: PropTypes.array,
}; 
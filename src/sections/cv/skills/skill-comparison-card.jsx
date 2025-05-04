import React from 'react';
import { m } from 'framer-motion';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import SkillLevelIndicator from './skill-level-indicator';

// ----------------------------------------------------------------------

// Création des composants motion avec forwardRef pour les rendre compatibles avec MUI 7
const MotionDiv = React.forwardRef((props, ref) => {
  const { children, ...others } = props;
  return <div ref={ref} {...others}>{children}</div>;
});

MotionDiv.propTypes = {
  children: PropTypes.node,
};

const MotionCard = React.forwardRef((props, ref) => {
  const { children, ...others } = props;
  return <Card ref={ref} {...others}>{children}</Card>;
});

MotionCard.propTypes = {
  children: PropTypes.node,
};

// ----------------------------------------------------------------------

export default function SkillComparisonCard({ skill, requiredSkill, showDetails = true, sx }) {
  const theme = useTheme();

  // Calcul du pourcentage de correspondance
  const matchPercentage = Math.min(Math.round((skill.level / requiredSkill.level) * 100), 100);
  const isMatching = skill.level >= requiredSkill.level;

  // Animation variants pour le match percentage
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, delay: 0.2 }
    }
  };

  const getStatusColor = () => {
    if (matchPercentage >= 100) return 'success';
    if (matchPercentage >= 75) return 'warning';
    return 'error';
  };

  const getStatusText = () => {
    if (matchPercentage >= 100) return 'Compétence acquise';
    if (matchPercentage >= 75) return 'Niveau proche';
    if (matchPercentage >= 50) return 'À développer';
    return 'Écart important';
  };

  return (
    <m.div
      component={Card}
      whileHover={{ y: -5 }}
      sx={{ 
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: (t) => t.customShadows.z8,
        '&:hover': {
          boxShadow: (t) => t.customShadows.z16,
        },
        ...sx
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" noWrap>
            {skill.name}
          </Typography>
          
          <Label color={getStatusColor()}>
            {isMatching ? (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="eva:checkmark-circle-fill" width={16} />
                <Box component="span">Acquis</Box>
              </Stack>
            ) : (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="eva:alert-triangle-fill" width={16} />
                <Box component="span">{`${requiredSkill.level - skill.level} niveau(x)`}</Box>
              </Stack>
            )}
          </Label>
        </Stack>
        
        <Stack spacing={1}>
          <Typography variant="subtitle2">
            Niveau actuel vs requis
          </Typography>
          
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ flex: 1 }}>
              <SkillLevelIndicator 
                level={skill.level}
                requiredLevel={requiredSkill.level}
                displayMode="bar"
                animated={false}
                width="100%"
              />
            </Box>
            
            <m.div
              initial="hidden"
              animate="visible"
              variants={textVariants}
            >
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 'bold',
                  color: theme.palette[getStatusColor()].main
                }}
              >
                {matchPercentage}%
              </Typography>
            </m.div>
          </Stack>
        </Stack>
        
        {showDetails && (
          <>
            <Divider />
            
            <Stack spacing={1}>
              <Typography variant="subtitle2">
                Détails
              </Typography>
              
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Votre niveau:
                </Typography>
                <SkillLevelIndicator 
                  level={skill.level}
                  displayMode="text"
                  tooltips={false}
                  animated={false}
                />
              </Stack>
              
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Niveau requis:
                </Typography>
                <SkillLevelIndicator 
                  level={requiredSkill.level}
                  displayMode="text"
                  tooltips={false}
                  animated={false}
                />
              </Stack>
              
              {skill.yearsExperience !== undefined && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Expérience:
                  </Typography>
                  <Typography variant="body2">
                    {skill.yearsExperience} {skill.yearsExperience > 1 ? 'années' : 'année'}
                  </Typography>
                </Stack>
              )}
              
              <Typography variant="caption" sx={{ color: theme.palette[getStatusColor()].main, mt: 1 }}>
                {getStatusText()}
              </Typography>
            </Stack>
          </>
        )}
      </Stack>
    </m.div>
  );
}

SkillComparisonCard.propTypes = {
  skill: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    level: PropTypes.number,
    yearsExperience: PropTypes.number,
  }).isRequired,
  requiredSkill: PropTypes.shape({
    name: PropTypes.string,
    level: PropTypes.number,
  }).isRequired,
  showDetails: PropTypes.bool,
  sx: PropTypes.object,
}; 
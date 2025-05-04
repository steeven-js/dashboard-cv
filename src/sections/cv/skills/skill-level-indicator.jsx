import { m } from 'framer-motion';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

const DISPLAY_MODES = [
  { value: 'stars', label: 'Étoiles', icon: 'mdi:star' },
  { value: 'bar', label: 'Barre', icon: 'mdi:chart-bar' },
  { value: 'text', label: 'Texte', icon: 'mdi:text' },
  { value: 'numeric', label: 'Numérique', icon: 'mdi:numeric' },
];

const SKILL_LEVELS = [
  { value: 1, label: 'Débutant', color: 'warning', description: 'Connaissances de base, apprentissage en cours' },
  { value: 2, label: 'Élémentaire', color: 'info', description: 'Capable de réaliser des tâches simples avec assistance' },
  { value: 3, label: 'Intermédiaire', color: 'primary', description: 'Autonome sur des tâches courantes' },
  { value: 4, label: 'Avancé', color: 'success', description: 'Maîtrise complète, capable de résoudre des problèmes complexes' },
  { value: 5, label: 'Expert', color: 'error', description: 'Expert reconnu, capable de former et d\'innover' },
];

// Créer un élément Box avec motion pour l'animation
const MotionBox = React.forwardRef((props, ref) => {
  const { children, ...others } = props;
  return <Box ref={ref} {...others}>{children}</Box>;
});

// Ajouter les PropTypes
MotionBox.propTypes = {
  children: PropTypes.node,
};

// ----------------------------------------------------------------------

export default function SkillLevelIndicator({
  level,
  compact = false,
  requiredLevel = null,
  displayMode = 'stars',
  onChange,
  readOnly = true,
  maxLevel = 5,
  tooltips = true,
  animated = true,
  width = 'auto',
  sx,
  ...other
}) {
  const theme = useTheme();
  const [mode, setMode] = useState(displayMode);
  const [openPopover, setOpenPopover] = useState(null);

  // Trouver le niveau et ses infos
  const skillLevel = SKILL_LEVELS.find((item) => item.value === level) || SKILL_LEVELS[0];

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleChangeMode = (newMode) => {
    setMode(newMode);
    handleClosePopover();
  };

  const renderChangeDisplayMode = (
    <IconButton 
      size="small"
      color="default"
      onClick={handleOpenPopover}
      sx={{ ml: 1, ...(compact && { p: 0 }) }}
    >
      <Iconify icon={DISPLAY_MODES.find((item) => item.value === mode)?.icon || 'mdi:eye'} width={16} />
    </IconButton>
  );

  // Animation variants avec framer-motion
  const variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4 }
    }
  };

  // Rendu selon le mode d'affichage
  const renderContent = () => {
    // Déclarations des variables avant le switch pour éviter les erreurs no-case-declarations
    const progress = (level / maxLevel) * 100;
    const requiredProgress = requiredLevel ? (requiredLevel / maxLevel) * 100 : null;
    
    switch (mode) {
      case 'stars':
        return (
          <Rating 
            value={level} 
            max={maxLevel}
            readOnly={readOnly}
            onChange={(_, newValue) => onChange?.(newValue)}
            precision={1}
          />
        );

      case 'bar':        
        return (
          <Box sx={{ position: 'relative', width: '100%', mt: 0.5, mb: 0.5 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress}
              sx={{ 
                height: 8, 
                borderRadius: 1,
                backgroundColor: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  borderRadius: 1,
                  backgroundColor: theme.palette[skillLevel.color].main,
                }
              }}
            />
            
            {requiredLevel && (
              <Box 
                sx={{
                  position: 'absolute',
                  top: -8,
                  left: `${requiredProgress}%`,
                  transform: 'translateX(-50%)',
                  width: 2,
                  height: 24,
                  backgroundColor: theme.palette.error.main,
                  zIndex: 1,
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: -4,
                    left: -4,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.error.main,
                  }
                }}
              />
            )}
          </Box>
        );

      case 'text':
        return (
          <Label 
            color={skillLevel.color}
            variant="soft"
            sx={{ 
              px: 2, 
              py: 0.5, 
              ...(requiredLevel && requiredLevel > level && {
                border: `1px dashed ${theme.palette.error.main}`,
              }) 
            }}
          >
            {skillLevel.label}
          </Label>
        );

      case 'numeric':
        return (
          <Typography 
            variant="h5"
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette[skillLevel.color].main,
              ...(requiredLevel && requiredLevel > level && {
                color: theme.palette.error.main,
              })
            }}
          >
            {level}/{maxLevel}
          </Typography>
        );

      default:
        return null;
    }
  };

  // Rendu du contenu avec animation conditionnelle
  const indicatorContent = renderContent();
  
  const renderIndicator = () => {
    if (!animated) {
      return indicatorContent;
    }
    return (
      <m.div
        initial="hidden"
        animate="visible"
        variants={variants}
      >
        {indicatorContent}
      </m.div>
    );
  };

  // Wrapper pour ajouter le tooltip si nécessaire
  const tooltip = (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{skillLevel.label} ({level}/{maxLevel})</Typography>
      <Typography variant="caption">{skillLevel.description}</Typography>
      {requiredLevel && requiredLevel > level && (
        <Typography variant="caption" sx={{ color: 'error.main' }}>
          Niveau requis: {requiredLevel}/{maxLevel}
        </Typography>
      )}
    </Stack>
  );

  const indicator = tooltips ? (
    <Tooltip 
      title={tooltip}
      arrow
      placement="top"
    >
      <Box sx={{ display: 'inline-block' }}>{renderIndicator()}</Box>
    </Tooltip>
  ) : renderIndicator();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width,
        ...sx,
      }}
      {...other}
    >
      {indicator}
      
      {!readOnly && renderChangeDisplayMode}
      
      <CustomPopover
        open={openPopover}
        onClose={handleClosePopover}
        sx={{ width: 180 }}
      >
        {DISPLAY_MODES.map((item) => (
          <MenuItem 
            key={item.value}
            selected={mode === item.value}
            onClick={() => handleChangeMode(item.value)}
          >
            <Iconify icon={item.icon} width={20} sx={{ mr: 1 }} />
            {item.label}
          </MenuItem>
        ))}
      </CustomPopover>
    </Box>
  );
}

SkillLevelIndicator.propTypes = {
  level: PropTypes.number.isRequired,
  compact: PropTypes.bool,
  requiredLevel: PropTypes.number,
  displayMode: PropTypes.oneOf(['stars', 'bar', 'text', 'numeric']),
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  maxLevel: PropTypes.number,
  tooltips: PropTypes.bool,
  animated: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sx: PropTypes.object,
}; 
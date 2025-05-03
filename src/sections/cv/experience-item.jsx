import dayjs from 'dayjs';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { useDraggable } from '@dnd-kit/core';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

export default function ExperienceItem({
  experience,
  index,
  onEdit,
  onDelete,
  dragHandleProps,
}) {
  const theme = useTheme();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: experience.id || `exp-${index}`,
  });

  const dragStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 10,
        boxShadow: theme.customShadows.z16,
      }
    : {};

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEditClick = () => {
    onEdit(experience);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    onDelete(experience.id);
    handleMenuClose();
  };

  // Formatter les dates
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dayjs(dateString).format('MMM YYYY');
  };

  // Durée de l'expérience
  const getDuration = (startDate, endDate, current) => {
    if (!startDate) return '';
    
    const start = dayjs(startDate);
    const end = current ? dayjs() : (endDate ? dayjs(endDate) : null);
    
    if (!end) return '';
    
    const years = end.diff(start, 'year');
    const months = end.diff(start, 'month') % 12;
    
    if (years === 0) {
      return `${months} mois`;
    } 
    
    if (months === 0) {
      return `${years} ${years > 1 ? 'ans' : 'an'}`;
    }
    
    return `${years} ${years > 1 ? 'ans' : 'an'} ${months} mois`;
  };

  return (
    <Card
      ref={setNodeRef}
      sx={{
        p: 2.5,
        mb: 2,
        position: 'relative',
        ...dragStyle,
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={2}>
        {/* Drag handle */}
        <Box
          {...attributes}
          {...listeners}
          {...dragHandleProps}
          sx={{
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            color: 'text.disabled',
            mt: 0.5,
          }}
        >
          <Iconify icon="solar:hamburger-menu-line-duotone" width={20} />
        </Box>

        {/* Contenu principal */}
        <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1} justifyContent="space-between">
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
              <Typography variant="subtitle1">{experience.title}</Typography>
              
              {experience.current && (
                <Label color="success" sx={{ ml: 1 }}>
                  Actuel
                </Label>
              )}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5}>
              {/* Indicateur de visibilité */}
              <Iconify
                icon={experience.visibility ? 'solar:eye-bold' : 'solar:eye-closed-line-duotone'}
                sx={{
                  color: experience.visibility ? 'primary.main' : 'text.disabled',
                }}
              />

              {/* Menu d'actions */}
              <IconButton onClick={handleMenuOpen} size="small">
                <Iconify icon="solar:menu-dots-bold" />
              </IconButton>
            </Stack>
          </Stack>

          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            alignItems={{ xs: 'flex-start', md: 'center' }} 
            spacing={{ xs: 0.5, md: 2 }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
              {experience.company}
            </Typography>

            {experience.location && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="solar:map-point-line-duotone" width={16} sx={{ color: 'text.disabled' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {experience.location}
                </Typography>
              </Stack>
            )}

            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify icon="solar:calendar-date-line-duotone" width={16} sx={{ color: 'text.disabled' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {formatDate(experience.startDate)} - {experience.current ? 'Présent' : formatDate(experience.endDate)}
                {' '}
                <Typography component="span" variant="caption" sx={{ color: 'text.disabled' }}>
                  ({getDuration(experience.startDate, experience.endDate, experience.current)})
                </Typography>
              </Typography>
            </Stack>
          </Stack>

          {experience.description && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary', 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxHeight: '3em',
                mt: 0.5
              }}
              dangerouslySetInnerHTML={{ __html: experience.description }}
            />
          )}

          {/* Technologies */}
          {experience.technologies?.length > 0 && (
            <Stack direction="row" flexWrap="wrap" spacing={0.5} sx={{ mt: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.disabled', mr: 1, mt: 0.5 }}>
                Technologies:
              </Typography>
              {experience.technologies.slice(0, 5).map((tech, techIndex) => (
                <Chip
                  key={techIndex}
                  label={tech}
                  size="small"
                  variant="soft"
                  color="primary"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
              {experience.technologies.length > 5 && (
                <Chip
                  label={`+${experience.technologies.length - 5}`}
                  size="small"
                  variant="soft"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              )}
            </Stack>
          )}

          {/* Réalisations */}
          {experience.achievements?.length > 0 && (
            <Stack direction="row" flexWrap="wrap" spacing={0.5} sx={{ mt: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'text.disabled', mr: 1, mt: 0.5 }}>
                Réalisations:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {experience.achievements.slice(0, 2).map((achievement, i) => (
                  <Typography key={i} variant="caption" sx={{ 
                    color: 'text.secondary', 
                    display: 'flex',
                    alignItems: 'center',
                    mr: 2,
                    mb: 0.5
                  }}>
                    <Box component="span" sx={{ 
                      width: 4, 
                      height: 4, 
                      borderRadius: '50%', 
                      bgcolor: 'primary.main',
                      mr: 1
                    }} />
                    {achievement}
                  </Typography>
                ))}
                {experience.achievements.length > 2 && (
                  <Typography variant="caption" sx={{ color: 'text.disabled', mb: 0.5 }}>
                    + {experience.achievements.length - 2} autre(s)
                  </Typography>
                )}
              </Box>
            </Stack>
          )}
        </Stack>
      </Stack>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon>
            <Iconify icon="solar:pen-bold" />
          </ListItemIcon>
          <ListItemText primary="Modifier" />
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </ListItemIcon>
          <ListItemText primary="Supprimer" />
        </MenuItem>
      </Menu>
    </Card>
  );
}

ExperienceItem.propTypes = {
  experience: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string.isRequired,
    company: PropTypes.string.isRequired,
    location: PropTypes.string,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string,
    description: PropTypes.string,
    technologies: PropTypes.arrayOf(PropTypes.string),
    achievements: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string),
    visibility: PropTypes.bool,
    current: PropTypes.bool,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  dragHandleProps: PropTypes.object,
}; 
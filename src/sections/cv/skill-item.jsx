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

export default function SkillItem({
  skill,
  index,
  onEdit,
  onDelete,
  dragHandleProps,
}) {
  const theme = useTheme();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: skill.id || `skill-${index}`,
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
    onEdit(skill);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    onDelete(skill.id);
    handleMenuClose();
  };

  // Couleurs en fonction du niveau (1-5)
  const getLevelColor = (level) => {
    const colors = ['error', 'warning', 'info', 'success', 'primary'];
    return colors[level - 1] || 'default';
  };

  // Rendre les étoiles basées sur le niveau
  const renderLevel = (level) => (
    <Stack direction="row" spacing={0.5}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Iconify
          key={star}
          icon={star <= level ? 'solar:star-bold' : 'solar:star-outline'}
          sx={{
            color: star <= level ? 'warning.main' : 'divider',
            width: 18,
            height: 18,
          }}
        />
      ))}
    </Stack>
  );

  return (
    <Card
      ref={setNodeRef}
      sx={{
        p: 2,
        mb: 2,
        position: 'relative',
        ...dragStyle,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
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
          }}
        >
          <Iconify icon="solar:hamburger-menu-line-duotone" width={20} />
        </Box>

        {/* Contenu principal */}
        <Stack spacing={1} sx={{ flexGrow: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle1">{skill.name}</Typography>
            <Label color={getLevelColor(skill.level)}>{skill.category}</Label>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={2}>
            {renderLevel(skill.level)}
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {skill.yearsExperience} {skill.yearsExperience > 1 ? 'ans' : 'an'} d&apos;expérience
            </Typography>
          </Stack>

          {skill.tags?.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Stack direction="row" flexWrap="wrap" spacing={0.5}>
                {skill.tags.map((tag, tagIndex) => (
                  <Chip
                    key={tagIndex}
                    label={tag}
                    size="small"
                    variant="soft"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>

        {/* Indicateur de visibilité */}
        <Box>
          <Iconify
            icon={skill.visibility ? 'solar:eye-bold' : 'solar:eye-closed-line-duotone'}
            sx={{
              color: skill.visibility ? 'primary.main' : 'text.disabled',
              mr: 1,
            }}
          />
        </Box>

        {/* Menu d'actions */}
        <IconButton onClick={handleMenuOpen} size="small">
          <Iconify icon="solar:menu-dots-bold" />
        </IconButton>
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

SkillItem.propTypes = {
  skill: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    level: PropTypes.number.isRequired,
    yearsExperience: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string),
    visibility: PropTypes.bool,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  dragHandleProps: PropTypes.object,
}; 
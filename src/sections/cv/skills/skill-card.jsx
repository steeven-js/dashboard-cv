import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

/**
 * Composant pour afficher une compétence technique sous forme de carte
 */
export default function SkillCard({ skill, onEdit, onDelete, withActions = true }) {
  const {
    id,
    name,
    level,
    category,
    tags = [],
    yearsExperience,
    visibility,
  } = skill;

  const [openPopover, setOpenPopover] = useState(null);

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(id);
    }
    handleClosePopover();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
    handleClosePopover();
  };

  // Obtenir une couleur pour la catégorie
  const getCategoryColor = () => {
    const categoryColors = {
      'Front-end': 'primary',
      'Back-end': 'info',
      'Mobile': 'warning',
      'Database': 'success',
      'DevOps': 'error',
      'Design': 'secondary',
      'Tools': 'default',
      'Other': 'default',
    };

    return categoryColors[category] || 'default';
  };

  return (
    <Card 
      sx={{ 
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        ...(visibility === false && {
          bgcolor: (theme) => alpha(theme.palette.action.disabledBackground, 0.4),
        }),
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Typography variant="h6" noWrap>
            {name}
          </Typography>
          
          {withActions && (
            <IconButton size="small" color="default" onClick={handleOpenPopover}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Label color={getCategoryColor()}>{category}</Label>
          
          {!visibility && (
            <Tooltip title="Cette compétence est masquée sur le CV">
              <Label color="default" variant="soft">
                <Iconify icon="mdi:eye-off" width={16} height={16} sx={{ mr: 0.5 }} />
                Masquée
              </Label>
            </Tooltip>
          )}
        </Stack>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Niveau de maîtrise
          </Typography>
          <Rating value={level} max={5} readOnly precision={1} />
        </Box>
        
        {yearsExperience > 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {yearsExperience} {yearsExperience > 1 ? 'années' : 'année'} d&apos;expérience
          </Typography>
        )}
      </Stack>
      
      {tags.length > 0 && (
        <Box sx={{ pt: 2 }}>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {tags.slice(0, 3).map((tag) => (
              <Chip 
                key={tag}
                label={tag}
                size="small"
                variant="soft"
                sx={{ borderRadius: 1 }}
              />
            ))}
            
            {tags.length > 3 && (
              <Tooltip 
                title={tags.slice(3).join(', ')}
                placement="top"
              >
                <Chip 
                  label={`+${tags.length - 3}`}
                  size="small"
                  variant="soft"
                  sx={{ borderRadius: 1 }}
                />
              </Tooltip>
            )}
          </Stack>
        </Box>
      )}
      
      <CustomPopover
        open={openPopover}
        onClose={handleClosePopover}
        sx={{ width: 160 }}
      >
        <MenuItem onClick={handleEdit}>
          <Iconify icon="eva:edit-fill" />
          Modifier
        </MenuItem>
        
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Iconify icon="eva:trash-2-outline" />
          Supprimer
        </MenuItem>
      </CustomPopover>
    </Card>
  );
}

SkillCard.propTypes = {
  skill: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    level: PropTypes.number,
    category: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    yearsExperience: PropTypes.number,
    visibility: PropTypes.bool,
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  withActions: PropTypes.bool,
}; 
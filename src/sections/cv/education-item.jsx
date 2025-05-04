import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useDraggable } from '@dnd-kit/core';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

EducationItem.propTypes = {
  education: PropTypes.object.isRequired,
  index: PropTypes.number,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  dragHandleProps: PropTypes.object,
};

export default function EducationItem({ education, index, onEdit, onDelete, dragHandleProps }) {
  const theme = useTheme();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: education.id || `edu-${index}`,
  });

  const dragStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 10,
        boxShadow: theme.customShadows.z16,
      }
    : {};

  // Formatter les dates
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dayjs(dateString).format('MMM YYYY');
  };

  // Obtenir la durée des études
  const getDuration = (startDate, endDate, current) => {
    if (!startDate) return '';
    
    const start = dayjs(startDate);
    const end = current ? dayjs() : (endDate ? dayjs(endDate) : null);
    
    if (!end) return '';
    
    const years = end.diff(start, 'year');
    const months = end.diff(start, 'month') % 12;
    
    let result = '';
    
    if (years > 0) {
      result += `${years} ${years > 1 ? 'ans' : 'an'}`;
    }
    
    if (months > 0) {
      if (result) result += ' ';
      result += `${months} mois`;
    }
    
    return result;
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
          <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle1">{education.degree}</Typography>
              
              {education.current && (
                <Label color="success" sx={{ ml: 1 }}>
                  En cours
                </Label>
              )}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5}>
              {/* Indicateur de visibilité */}
              <Iconify
                icon={education.visibility ? 'solar:eye-bold' : 'solar:eye-closed-line-duotone'}
                sx={{
                  color: education.visibility ? 'primary.main' : 'text.disabled',
                }}
              />

              {/* Actions */}
              <Stack direction="row" spacing={1}>
                <IconButton 
                  size="small" 
                  color="primary" 
                  onClick={() => onEdit(education)}
                >
                  <Iconify icon="solar:pen-bold" />
                </IconButton>
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={() => onDelete(education.id)}
                >
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Stack>
            </Stack>
          </Stack>

          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            alignItems={{ xs: 'flex-start', md: 'center' }} 
            spacing={{ xs: 0.5, md: 2 }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
              {education.institution}
            </Typography>

            {education.location && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="solar:map-point-line-duotone" width={16} sx={{ color: 'text.disabled' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {education.location}
                </Typography>
              </Stack>
            )}

            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify icon="solar:calendar-date-line-duotone" width={16} sx={{ color: 'text.disabled' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {formatDate(education.startDate)} - {education.current ? 'Présent' : formatDate(education.endDate)}
                {' '}
                <Typography component="span" variant="caption" sx={{ color: 'text.disabled' }}>
                  ({getDuration(education.startDate, education.endDate, education.current)})
                </Typography>
              </Typography>
            </Stack>
          </Stack>

          {education.description && (
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
              dangerouslySetInnerHTML={{ __html: education.description }}
            />
          )}

          {/* Certifications */}
          {education.certifications && education.certifications.length > 0 && (
            <Stack direction="row" flexWrap="wrap" spacing={0.5} sx={{ mt: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.disabled', mr: 1, mt: 0.5 }}>
                Certifications:
              </Typography>
              {education.certifications.map((cert, certIndex) => (
                <Chip
                  key={certIndex}
                  label={cert}
                  size="small"
                  variant="soft"
                  color="info"
                  sx={{ m: 0.5 }}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Card>
  );
} 
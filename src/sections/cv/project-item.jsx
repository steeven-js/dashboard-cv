import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { fr } from 'date-fns/locale';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function ProjectItem({ project, onEdit, onDelete, canDelete = true }) {
  const {
    id,
    name,
    role,
    startDate,
    endDate,
    isOngoing,
    description,
    technologies,
    url,
    tags,
    visibility,
    screenshots,
  } = project;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
    position: 'relative',
  };

  const formattedStartDate = startDate 
    ? format(new Date(startDate), 'MMMM yyyy', { locale: fr }) 
    : '';
    
  const formattedEndDate = isOngoing 
    ? 'Présent' 
    : endDate 
      ? format(new Date(endDate), 'MMMM yyyy', { locale: fr }) 
      : '';

  const period = `${formattedStartDate} - ${formattedEndDate}`;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        p: 3,
        borderRadius: 2,
        cursor: 'grab',
        position: 'relative',
        transition: (theme) => theme.transitions.create('all'),
        '&:hover': {
          bgcolor: (theme) => alpha(theme.palette.primary.lighter, 0.08),
        },
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={2}>
        <Box 
          {...attributes} 
          {...listeners}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: 'text.disabled',
            cursor: 'grab', 
            px: 1,
            pt: 1,
          }}
        >
          <Iconify icon="eva:move-fill" width={20} />
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle1">{name}</Typography>

              {!visibility && (
                <Tooltip title="Ce projet est masqué et n'apparaîtra pas dans votre CV">
                  <Iconify icon="solar:eye-closed-linear" sx={{ color: 'text.disabled' }} />
                </Tooltip>
              )}
            </Stack>

            <Stack direction="row" spacing={1}>
              <Tooltip title="Modifier">
                <IconButton 
                  size="small" 
                  color="info" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Iconify icon="solar:pen-bold" />
                </IconButton>
              </Tooltip>

              {canDelete && (
                <Tooltip title="Supprimer">
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1, mb: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {role}
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {period}
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            {description}
          </Typography>

          {url && (
            <Link
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: 'inline-flex', alignItems: 'center', mb: 2 }}
              color="primary"
            >
              <Iconify icon="eva:link-2-fill" sx={{ mr: 0.5 }} />
              Voir le projet
            </Link>
          )}

          {technologies && technologies.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" component="div" sx={{ mb: 1, color: 'text.secondary' }}>
                Technologies utilisées:
              </Typography>
              <Stack direction="row" flexWrap="wrap" spacing={1}>
                {technologies.map((tech) => (
                  <Chip
                    key={tech}
                    label={tech}
                    size="small"
                    variant="soft"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {tags && tags.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" component="div" sx={{ mb: 1, color: 'text.secondary' }}>
                Tags:
              </Typography>
              <Stack direction="row" flexWrap="wrap" spacing={1}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {screenshots && screenshots.length > 0 && (
            <Box sx={{ mb: 1, mt: 2 }}>
              <Typography variant="caption" component="div" sx={{ mb: 1, color: 'text.secondary' }}>
                Captures d&apos;écran:
              </Typography>
              <Grid container spacing={1}>
                {screenshots.map((screenshot) => (
                  <Grid item xs={6} sm={4} md={3} key={screenshot.id}>
                    <Box
                      sx={{
                        borderRadius: 1,
                        overflow: 'hidden',
                        position: 'relative',
                        transition: (theme) => theme.transitions.create('transform'),
                        '&:hover': {
                          transform: 'scale(1.02)',
                        },
                      }}
                    >
                      <Image
                        alt={screenshot.name}
                        src={screenshot.url}
                        ratio="16/9"
                        sx={{ borderRadius: 1 }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </Stack>
    </Card>
  );
}

ProjectItem.propTypes = {
  project: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  canDelete: PropTypes.bool,
}; 
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * Widget statistique pour la section des compétences techniques
 * Affiche une statistique avec titre, valeur, description et icône
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} props.title - Titre de la statistique
 * @param {string|number} props.value - Valeur à afficher
 * @param {string} props.description - Description de la statistique
 * @param {string} props.icon - Nom de l'icône Iconify
 * @param {string} props.color - Couleur thématique (primary, info, success, warning, error)
 */
export default function SkillStatisticsWidget({ title, value, description, icon, color = 'primary' }) {
  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              {title}
            </Typography>
            
            <Typography variant="h3">
              {value}
            </Typography>
          </Stack>
          
          <Box
            sx={{
              p: 1.5,
              borderRadius: '50%',
              bgcolor: `${color}.lighter`,
              color: `${color}.main`,
            }}
          >
            <Iconify icon={icon} width={24} height={24} />
          </Box>
        </Stack>
        
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {description}
        </Typography>
      </Stack>
    </Card>
  );
}

SkillStatisticsWidget.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['primary', 'secondary', 'info', 'success', 'warning', 'error']),
}; 
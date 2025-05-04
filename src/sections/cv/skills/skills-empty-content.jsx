import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * Composant affiché lorsqu'aucune compétence n'existe
 */
export default function SkillsEmptyContent({ onAdd }) {
  return (
    <Paper
      sx={{
        textAlign: 'center',
        p: 5,
        borderStyle: 'dashed',
        borderColor: 'divider',
        bgcolor: 'background.neutral',
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Box
          component="img"
          alt="État vide"
          src="/assets/illustrations/illustration_empty_content.svg"
          sx={{ height: 160, mx: 'auto' }}
        />
      </Box>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Aucune compétence technique
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Vous n&apos;avez pas encore ajouté de compétences techniques à votre CV.
        <br />Commencez par ajouter vos compétences pour les faire apparaître ici.
      </Typography>

      <Button
        color="primary"
        variant="contained"
        startIcon={<Iconify icon="eva:plus-fill" />}
        onClick={onAdd}
      >
        Ajouter une compétence
      </Button>
    </Paper>
  );
}

SkillsEmptyContent.propTypes = {
  onAdd: PropTypes.func,
}; 
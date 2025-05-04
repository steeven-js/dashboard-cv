import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * Contenu vide pour la section des compétences techniques
 * Affiché lorsqu'aucune compétence n'est disponible
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Function} props.onAdd - Fonction appelée pour ajouter une compétence
 */
export default function SkillsEmptyContent({ onAdd }) {
  return (
    <Card
      sx={{
        p: 5,
        mb: 3,
        textAlign: 'center',
        borderStyle: 'dashed',
        borderColor: 'divider',
        bgcolor: 'background.neutral',
      }}
    >
      <Stack spacing={3} alignItems="center" justifyContent="center">
        <Box
          component="img"
          alt="empty content"
          src="/public/assets/illustrations/characters/character-study.webp"
          sx={{ height: 160, mb: 3 }}
        />

        <Typography variant="h6" gutterBottom>
          Aucune compétence technique
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Vous n&apos;avez encore ajouté aucune compétence technique à votre profil.
          <br />
          Les compétences techniques sont essentielles pour mettre en valeur votre expertise
          <br />
          et améliorer la correspondance avec les offres d&apos;emploi.
        </Typography>

        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={onAdd}
          size="large"
          sx={{ px: 3, py: 1 }}
        >
          Ajouter ma première compétence
        </Button>
      </Stack>
    </Card>
  );
}

SkillsEmptyContent.propTypes = {
  onAdd: PropTypes.func.isRequired,
}; 
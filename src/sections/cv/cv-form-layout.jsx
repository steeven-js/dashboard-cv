import PropTypes from 'prop-types';
import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function CVFormLayout({
  title,
  subtitle,
  children,
  onSave,
  onBack,
  onNext,
  progress,
  showProgress = true,
  isLastStep = false,
  isFirstStep = false,
  loading = false,
  sx,
  ...other
}) {
  const [autoSaving, setAutoSaving] = useState(false);
  const savingTimeoutRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => 
    // Nettoyer le timeout lors du démontage du composant
     () => {
      if (savingTimeoutRef.current) {
        clearTimeout(savingTimeoutRef.current);
      }
    }
  , []);

  const handleAutoSave = (formData) => {
    if (savingTimeoutRef.current) {
      clearTimeout(savingTimeoutRef.current);
    }

    setAutoSaving(true);

    savingTimeoutRef.current = setTimeout(() => {
      if (onSave) {
        onSave(formData);
        setAutoSaving(false);
        toast.success('Vos modifications ont été automatiquement sauvegardées');
      }
    }, 1500);
  };

  const renderHeader = () => (
    <Stack spacing={1} sx={{ mb: 4 }}>
      {title && (
        <Typography variant="h5" sx={{ color: 'text.primary' }}>
          {title}
        </Typography>
      )}

      {subtitle && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {subtitle}
        </Typography>
      )}

      {showProgress && progress !== undefined && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ flexGrow: 1, height: 6, borderRadius: 1 }}
          />
          <Typography variant="body2" sx={{ minWidth: 40 }}>
            {`${Math.round(progress)}%`}
          </Typography>
        </Stack>
      )}
    </Stack>
  );

  const renderActions = () => (
    <Grid container spacing={2} sx={{ mt: 3 }}>
      <Grid item xs={12} sm={4}>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          onClick={onBack}
          disabled={isFirstStep || loading}
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
        >
          Précédent
        </Button>
      </Grid>

      <Grid item xs={12} sm={4}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={() => formRef.current?.requestSubmit()}
          loading={loading}
          startIcon={<Iconify icon="eva:save-fill" />}
        >
          Sauvegarder
        </Button>
      </Grid>

      <Grid item xs={12} sm={4}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={onNext}
          disabled={isLastStep || loading}
          endIcon={<Iconify icon="eva:arrow-forward-fill" />}
        >
          Suivant
        </Button>
      </Grid>

      {isLastStep && (
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            onClick={() => formRef.current?.requestSubmit()}
            loading={loading}
            startIcon={<Iconify icon="eva:checkmark-fill" />}
          >
            Terminer
          </Button>
        </Grid>
      )}
    </Grid>
  );

  return (
    <Box sx={{ ...sx }} {...other}>
      <Card sx={{ p: 3, position: 'relative' }}>
        {autoSaving && (
          <Box
            sx={{
              top: 8,
              right: 8,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              px: 2,
              py: 0.75,
              borderRadius: 1,
              bgcolor: 'action.selected',
            }}
          >
            <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
              Sauvegarde en cours...
            </Typography>
          </Box>
        )}

        {renderHeader()}

        <Box ref={formRef} onChange={() => handleAutoSave()}>
          {children}
        </Box>

        {renderActions()}
      </Card>
    </Box>
  );
}

CVFormLayout.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  children: PropTypes.node,
  onSave: PropTypes.func,
  onBack: PropTypes.func,
  onNext: PropTypes.func,
  progress: PropTypes.number,
  showProgress: PropTypes.bool,
  isLastStep: PropTypes.bool,
  isFirstStep: PropTypes.bool,
  loading: PropTypes.bool,
  sx: PropTypes.object,
}; 
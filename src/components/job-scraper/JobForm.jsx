import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, TextField, Box, Paper, Typography, CircularProgress } from '@mui/material';

export default function JobForm({ onSubmit, isLoading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation simple de l'URL
    if (!url) {
      setError('Veuillez entrer une URL');
      return;
    }

    try {
      const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/;
      if (!urlPattern.test(url)) {
        setError('Veuillez entrer une URL valide');
        return;
      }

      setError('');
      await onSubmit(url);
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de la soumission de l'URL");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Extraire une offre d'emploi
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="URL de l'offre d'emploi"
          variant="outlined"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          error={!!error}
          helperText={error}
          placeholder="https://example.com/job-offer"
          sx={{ mb: 2 }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading}
          sx={{ mt: 1 }}
        >
          {isLoading ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
              Traitement en cours...
            </>
          ) : (
            'Extraire les données'
          )}
        </Button>
      </Box>
    </Paper>
  );
}

JobForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

JobForm.defaultProps = {
  isLoading: false,
};

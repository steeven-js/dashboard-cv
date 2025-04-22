import axios from 'axios';
import { useState } from 'react';

import {
  Box,
  Card,
  Grid,
  Chip,
  Paper,
  Button,
  Divider,
  Container,
  TextField,
  Typography,
  CardContent,
  CircularProgress,
} from '@mui/material';

export default function JobAnalysisView() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!url) {
      setError('Veuillez saisir une URL');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Appel à l'API Ollama (sera implémenté côté serveur)
      const response = await axios.post('/api/analyze-job', { url });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue lors de l'analyse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 5 }}>
        <Typography variant="h4" gutterBottom>
          Analyse d&apos;offres d&apos;emploi
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Entrez l&apos;URL d&apos;une offre d&apos;emploi pour l&apos;analyser avec Ollama
        </Typography>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="URL de l'offre d'emploi"
                  variant="outlined"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/job-offer"
                  error={!!error}
                  helperText={error}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleAnalyze}
                  disabled={loading}
                  sx={{ height: '56px' }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Analyser'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {result && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Résultats de l&apos;analyse
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Informations générales
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">Titre du poste</Typography>
                  <Typography variant="body1">{result.title}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">Entreprise</Typography>
                  <Typography variant="body1">{result.company}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">Localisation</Typography>
                  <Typography variant="body1">{result.location}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">Type de contrat</Typography>
                  <Typography variant="body1">{result.contractType}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Compétences requises
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {result.skills?.map((skill, index) => (
                    <Chip key={index} label={skill} />
                  ))}
                </Box>

                <Typography variant="h6" gutterBottom>
                  Salaire estimé
                </Typography>
                <Typography variant="body1">{result.salary || 'Non spécifié'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Résumé de l&apos;offre
                </Typography>
                <Typography variant="body1">{result.summary}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Analyse complète (JSON)
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    bgcolor: 'background.paper',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                    maxHeight: 400,
                  }}
                >
                  {JSON.stringify(result, null, 2)}
                </Box>
              </Grid>

              {result.error && (
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 2,
                      mt: 2,
                      bgcolor: 'warning.lighter',
                      borderLeft: '4px solid',
                      borderColor: 'warning.main',
                    }}
                  >
                    <Typography variant="subtitle1" color="warning.dark" fontWeight="bold">
                      Note sur l&apos;analyse
                    </Typography>
                    <Typography variant="body2">{result.error}</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}
      </Box>
    </Container>
  );
}

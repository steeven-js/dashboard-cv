import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';

// mui
import {
  Box,
  Card,
  Grid,
  Stack,
  Alert,
  Button,
  Divider,
  Container,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';

// components
import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';

// service
import { cvService } from 'src/services/cv';

// ----------------------------------------------------------------------

export default function CVEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cv, setCv] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchCV = async () => {
      try {
        setLoading(true);
        const data = await cvService.getCV(id);
        setCv(data);
        setFormData(data.content || {});
      } catch (error) {
        console.error('Erreur lors du chargement du CV:', error);
        setError('Impossible de charger les informations du CV');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCV();
    }
  }, [id]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      await cvService.updateCV(id, { data: formData });
      setSuccess(true);
      
      // Retourner à la page de détails après un court délai
      setTimeout(() => {
        navigate(`${paths.dashboard.cv.details}/${id}`);
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du CV:', error);
      setError('Une erreur est survenue lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`${paths.dashboard.cv.details}/${id}`);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !cv) {
    return (
      <Container>
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="error" paragraph>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate(paths.dashboard.cv.root)}
          >
            Retour à la liste
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button 
            color="inherit" 
            onClick={handleCancel}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          >
            Retour
          </Button>
          <Typography variant="h4">Modifier le CV</Typography>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          CV mis à jour avec succès
        </Alert>
      )}

      <Card sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {cv && cv.content && Object.entries(cv.content).map(([key, value]) => (
              <Grid item xs={12} key={key}>
                <Typography variant="subtitle2" gutterBottom>
                  {key}
                </Typography>
                
                {typeof value === 'object' ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={JSON.stringify(formData[key] || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsedValue = JSON.parse(e.target.value);
                        handleChange(key, parsedValue);
                      } catch (err) {
                        // En cas d'erreur de parsing, mettre à jour le texte brut
                        handleChange(key, e.target.value);
                      }
                    }}
                  />
                ) : (
                  <TextField
                    fullWidth
                    value={formData[key] || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                  />
                )}
              </Grid>
            ))}

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  onClick={handleCancel}
                >
                  Annuler
                </Button>
                
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <Iconify icon="eva:save-fill" />}
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Card>
    </Container>
  );
} 
import { useState } from 'react';
import { useNavigate } from 'react-router';

// mui
import {
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

const DEFAULT_CV_STRUCTURE = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  adresse: '',
  formation: {},
  experience: {},
  competences: [],
};

// ----------------------------------------------------------------------

export default function CVNewPage() {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_CV_STRUCTURE);
  const [error, setError] = useState(null);

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
      
      const response = await cvService.createCV({ data: formData });
      
      // Naviguer vers la page de détails du nouveau CV
      navigate(`${paths.dashboard.cv.details}/${response.id}`);
    } catch (error) {
      console.error('Erreur lors de la création du CV:', error);
      setError('Une erreur est survenue lors de la création du CV');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(paths.dashboard.cv.list);
  };

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
          <Typography variant="h4">Nouveau CV</Typography>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {Object.entries(DEFAULT_CV_STRUCTURE).map(([key, value]) => (
              <Grid item xs={12} key={key}>
                <Typography variant="subtitle2" gutterBottom>
                  {key}
                </Typography>
                
                {typeof value === 'object' ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={JSON.stringify(formData[key] || (Array.isArray(value) ? [] : {}), null, 2)}
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
                  {saving ? 'Création...' : 'Créer'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Card>
    </Container>
  );
} 
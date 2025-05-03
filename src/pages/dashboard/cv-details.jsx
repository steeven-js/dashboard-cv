import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';

// mui
import {
  Box,
  Card,
  Grid,
  Stack,
  Paper,
  Button,
  Divider,
  Container,
  Typography,
  CircularProgress,
} from '@mui/material';

// components
import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';

// service
import { cvService } from 'src/services/cv';

// ----------------------------------------------------------------------

export default function CVDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [cv, setCv] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCV = async () => {
      try {
        setLoading(true);
        const data = await cvService.getCV(id);
        setCv(data);
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

  const handleEdit = () => {
    navigate(`${paths.dashboard.cv.edit}/${id}`);
  };

  const handleBack = () => {
    navigate(paths.dashboard.cv.root);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !cv) {
    return (
      <Container>
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="error" paragraph>
            {error || 'CV non trouvé'}
          </Typography>
          <Button variant="contained" onClick={handleBack}>
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
            onClick={handleBack}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          >
            Retour
          </Button>
          <Typography variant="h4">Détails du CV</Typography>
        </Stack>
        
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:edit-fill" />}
          onClick={handleEdit}
        >
          Modifier
        </Button>
      </Stack>

      <Card sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Informations générales
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" component="span">ID: </Typography>
                <Typography variant="body2" component="span">{cv.id}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" component="span">Date de création: </Typography>
                <Typography variant="body2" component="span">
                  {new Date(cv.created_at).toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Contenu du CV
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
              {cv.content ? (
                <Grid container spacing={2}>
                  {Object.entries(cv.content).map(([key, value]) => (
                    <Grid item xs={12} key={key}>
                      <Typography variant="subtitle2">{key}:</Typography>
                      <Typography variant="body2" paragraph>
                        {typeof value === 'object' 
                          ? JSON.stringify(value, null, 2) 
                          : value.toString()}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Aucun contenu disponible
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
} 
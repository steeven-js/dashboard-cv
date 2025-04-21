import { useState, useEffect } from 'react';
import { Container, Grid, Typography, Alert, Snackbar, Box, Divider } from '@mui/material';
import { Helmet } from 'react-helmet-async';

// Composants
import JobForm from '../components/job-scraper/JobForm';
import JobDetails from '../components/job-scraper/JobDetails';
import JobList from '../components/job-scraper/JobList';

// Services
import { jobsApi } from '../services/api';

export default function JobScraperPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  // Charger les offres d'emploi au chargement de la page
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsApi.getJobs();
      setJobs(response.results || []);
    } catch (error) {
      showAlert(`Erreur lors du chargement des offres d'emploi: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUrl = async (url) => {
    try {
      setLoading(true);
      const jobData = await jobsApi.scrapeJobUrl(url);

      // Mettre à jour la liste des offres
      await fetchJobs();

      // Sélectionner l'offre nouvellement créée
      setSelectedJob(jobData);

      showAlert("Offre d'emploi extraite avec succès!", 'success');
    } catch (error) {
      showAlert(`Erreur lors de l'extraction de l'offre: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJob = (job) => {
    setSelectedJob(job);
  };

  const showAlert = (message, severity = 'info') => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <>
      <Helmet>
        <title>Scraper d'offres d'emploi</title>
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Scraper d'offres d'emploi
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Entrez l'URL d'une offre d'emploi pour extraire automatiquement ses informations
        </Typography>

        <Box sx={{ my: 4 }}>
          <JobForm onSubmit={handleSubmitUrl} isLoading={loading} />
        </Box>

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <JobList jobs={jobs} onSelectJob={handleSelectJob} selectedJobId={selectedJob?.id} />
          </Grid>

          <Grid item xs={12} md={6}>
            {selectedJob ? (
              <JobDetails job={selectedJob} />
            ) : (
              <Alert severity="info" sx={{ p: 3 }}>
                Sélectionnez une offre d'emploi pour voir ses détails
              </Alert>
            )}
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
}

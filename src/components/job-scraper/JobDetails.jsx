import PropTypes from 'prop-types';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Link,
  Divider,
  Grid,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export default function JobDetails({ job }) {
  if (!job) {
    return null;
  }

  const {
    title,
    company,
    location,
    description,
    skills = [],
    salary,
    employment_type: employmentType,
    date_posted: datePosted,
    url,
  } = job;

  // Format de la date
  const formattedDate = datePosted
    ? new Date(datePosted).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Non spécifiée';

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                {company && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">{company}</Typography>
                  </Box>
                )}

                {location && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">{location}</Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                {employmentType && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WorkIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">{employmentType}</Typography>
                  </Box>
                )}

                {salary && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoneyIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">{salary}</Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon sx={{ mr: 1 }} />
                  <Typography variant="body1">Date de publication: {formattedDate}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {skills.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Compétences requises
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {skills.map((skill, index) => (
              <Chip key={index} label={skill} color="primary" variant="outlined" />
            ))}
          </Box>
        </Box>
      )}

      {description && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            Description du poste
          </Typography>
          <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>
            {description}
          </Typography>
        </>
      )}

      {url && (
        <Box sx={{ mt: 3 }}>
          <Link href={url} target="_blank" rel="noopener">
            Voir l'offre originale
          </Link>
        </Box>
      )}
    </Paper>
  );
}

JobDetails.propTypes = {
  job: PropTypes.shape({
    title: PropTypes.string.isRequired,
    company: PropTypes.string,
    location: PropTypes.string,
    description: PropTypes.string,
    skills: PropTypes.arrayOf(PropTypes.string),
    salary: PropTypes.string,
    employment_type: PropTypes.string,
    date_posted: PropTypes.string,
    url: PropTypes.string.isRequired,
  }),
};

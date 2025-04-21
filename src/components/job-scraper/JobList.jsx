import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  Pagination,
  Chip,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import SearchIcon from '@mui/icons-material/Search';

export default function JobList({ jobs = [], onSelectJob, selectedJobId }) {
  const [page, setPage] = useState(1);
  const jobsPerPage = 5;

  // Pagination
  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  const startIndex = (page - 1) * jobsPerPage;
  const paginatedJobs = jobs.slice(startIndex, startIndex + jobsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  if (!jobs.length) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <SearchIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Aucune offre d'emploi
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Utilisez le formulaire ci-dessus pour extraire des offres d'emploi
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Offres d'emploi enregistrées ({jobs.length})
      </Typography>

      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {paginatedJobs.map((job, index) => (
          <Box key={job.id || index}>
            {index > 0 && <Divider component="li" />}
            <ListItem
              alignItems="flex-start"
              selected={selectedJobId === job.id}
              sx={{
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                ...(selectedJobId === job.id && { bgcolor: 'action.selected' }),
              }}
              onClick={() => onSelectJob(job)}
            >
              <ListItemAvatar>
                <Avatar>
                  <WorkIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={job.title}
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      sx={{ display: 'block' }}
                    >
                      {job.company}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {job.location && (
                        <Chip label={job.location} size="small" variant="outlined" sx={{ mr: 1 }} />
                      )}

                      {job.employment_type && (
                        <Chip
                          label={job.employment_type}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                      )}
                    </Box>
                  </>
                }
              />
              <Button
                variant="outlined"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectJob(job);
                }}
              >
                Détails
              </Button>
            </ListItem>
          </Box>
        ))}
      </List>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={handleChangePage} color="primary" />
        </Box>
      )}
    </Paper>
  );
}

JobList.propTypes = {
  jobs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string.isRequired,
      company: PropTypes.string,
      location: PropTypes.string,
      employment_type: PropTypes.string,
    })
  ),
  onSelectJob: PropTypes.func.isRequired,
  selectedJobId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

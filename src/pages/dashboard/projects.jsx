import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import ProjectsForm from 'src/sections/cv/personal-projects-form';

// ----------------------------------------------------------------------

export default function ProjectsPage() {
  return (
    <>
      <title>
        Projets Personnels
      </title>

      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Projets Personnels
        </Typography>

        <ProjectsForm />
      </Container>
    </>
  );
} 
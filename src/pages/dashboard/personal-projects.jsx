import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import PersonalProjectsForm from 'src/sections/cv/personal-projects-form';

// ----------------------------------------------------------------------

export default function PersonalProjectsPage() {
  return (
    <>
      <title>
        Projets Personnels
      </title>

      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Projets Personnels
        </Typography>

        <PersonalProjectsForm />
      </Container>
    </>
  );
} 
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import ExperienceForm from 'src/sections/cv/experience-form';

// ----------------------------------------------------------------------

export default function ProfessionalExperiencePage() {
  return (
    <>
      <title>
        Expériences Professionnelles
      </title>

      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Expériences Professionnelles
        </Typography>

        <ExperienceForm />
      </Container>
    </>
  );
} 
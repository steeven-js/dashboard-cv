import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import TechnicalSkillsForm from 'src/sections/cv/technical-skills-form';

// ----------------------------------------------------------------------

export default function TechnicalSkillsPage() {
  return (
    <>
      <title>
        Compétences Techniques
      </title>

      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Compétences Techniques
      </Typography>

        <TechnicalSkillsForm />
      </Container>
    </>
  );
} 
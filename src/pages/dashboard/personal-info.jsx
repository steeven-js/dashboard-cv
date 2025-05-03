import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import PersonalInfoForm from 'src/sections/cv/personal-info-form';

// ----------------------------------------------------------------------

export default function PersonalInfoPage() {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Informations Personnelles
      </Typography>

      <PersonalInfoForm />
    </Container>
  );
} 
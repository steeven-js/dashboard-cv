import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import EducationForm from 'src/sections/cv/education-form';

// ----------------------------------------------------------------------

export default function EducationPage() {
  return (
    <DashboardContent title="Formations et Diplômes">
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4">Formations et Diplômes</Typography>
          </Stack>

          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Ajoutez vos diplômes, formations et certifications. Ces informations peuvent être réorganisées par glisser-déposer pour refléter leur importance dans votre parcours.
            </Typography>
          </Card>

          <EducationForm />
        </Stack>
      </Container>
    </DashboardContent>
  );
} 
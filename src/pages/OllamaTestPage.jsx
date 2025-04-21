import { Container, Typography, Box, Card } from '@mui/material';

import OllamaTest from '../components/OllamaTest';

import { CONFIG } from 'src/global-config';

const metadata = { title: `Ollama Python Test | Dashboard - ${CONFIG.appName}` };

export default function OllamaTestPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4" gutterBottom>
            Ollama-Python Communication Test
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This page demonstrates the communication between Python and Ollama
          </Typography>
        </Box>

        <Card sx={{ p: 0, overflow: 'hidden' }}>
          <OllamaTest />
        </Card>
      </Container>
    </>
  );
}

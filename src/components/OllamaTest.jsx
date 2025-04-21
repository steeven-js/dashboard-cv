import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Switch,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Stack,
  Divider,
  CircularProgress,
  Grid,
  FormControlLabel,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

// Configuration for API endpoints
const API_CONFIG = {
  // Python API runs locally on port 8000
  PYTHON_API_URL: import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000',
  // Ollama VPS URL
  OLLAMA_URL: import.meta.env.VITE_OLLAMA_URL || 'http://69.62.71.69:8080',
  // Ollama authentication token
  OLLAMA_TOKEN: import.meta.env.VITE_OLLAMA_TOKEN || '',
};

function OllamaTest() {
  const [status, setStatus] = useState(null);
  const [pythonResponse, setPythonResponse] = useState(null);
  const [ollamaResponse, setOllamaResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [demoMode, setDemoMode] = useState(false); // Demo mode disabled by default
  const [modelsList, setModelsList] = useState(null);
  const [loadingModels, setLoadingModels] = useState(false);

  const getApiUrl = () => {
    return `${API_CONFIG.PYTHON_API_URL}/api/test-ollama${demoMode ? '?demo=true' : ''}`;
  };

  const testOllamaConnection = async () => {
    setLoading(true);
    setError(null);
    setStatus(null);
    setPythonResponse(null);
    setOllamaResponse(null);

    try {
      const url = getApiUrl();
      console.log(`Connecting to: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        mode: 'cors',
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(data.message);
        setPythonResponse(data.python_message);
        setOllamaResponse(data.ollama_message);
      } else {
        setError(data.message || 'Failed to connect to Ollama');
        if (data.python_message) {
          setPythonResponse(data.python_message);
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError(`Could not connect to the Python API server. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to just check if the Ollama server is reachable at all
  const testOllamaDirectly = async () => {
    setLoading(true);
    setError(null);
    setStatus(null);
    setPythonResponse(null);
    setOllamaResponse(null);

    if (demoMode) {
      // In demo mode, just simulate a successful response
      setTimeout(() => {
        setStatus('Demo mode: Simulated direct Ollama connection');
        setOllamaResponse(
          'This is a simulated response from Ollama in demo mode. Everything is working as expected with the demo!'
        );
        setPythonResponse('Demo mode enabled - This is a simulated response');
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      // Try a simple GET request to the root URL to see if server is reachable
      console.log(`Checking if Ollama server is reachable at: ${API_CONFIG.OLLAMA_URL}`);

      const response = await fetch(API_CONFIG.OLLAMA_URL, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${API_CONFIG.OLLAMA_TOKEN}`,
        },
        mode: 'cors',
      });

      console.log(`Response status: ${response.status}`);

      if (response.ok || response.status === 404 || response.status === 405) {
        // Even a 404/405 means the server is responding
        setStatus('Ollama server is reachable!');
        try {
          const text = await response.text();
          setOllamaResponse(`Server responded with status ${response.status}. Response: ${text}`);
        } catch (e) {
          setOllamaResponse(
            `Server responded with status ${response.status}, but no response body.`
          );
        }
        setPythonResponse('Bypassed Python - Connected directly to Ollama server');
      } else {
        const errorText = await response.text();
        setError(`Failed to connect to Ollama server. Status: ${response.status}. ${errorText}`);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(
        `Could not connect to Ollama server: ${err.message}. The server might be unreachable or CORS might be blocking the request.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch available models from Open WebUI
  const fetchAvailableModels = async () => {
    setLoadingModels(true);
    setError(null);

    if (demoMode) {
      // In demo mode, simulate a list of models
      setTimeout(() => {
        setModelsList([
          {
            id: 'llama3',
            name: 'Llama 3 8B',
            size: '8B',
            modified_at: '2023-04-01',
            tags: ['demo'],
          },
          {
            id: 'mistral',
            name: 'Mistral 7B',
            size: '7B',
            modified_at: '2023-03-15',
            tags: ['demo'],
          },
          {
            id: 'codellama',
            name: 'CodeLlama 13B',
            size: '13B',
            modified_at: '2023-02-20',
            tags: ['demo', 'code'],
          },
        ]);
        setLoadingModels(false);
      }, 1000);
      return;
    }

    try {
      // Try to fetch the models from the API
      const modelsUrl = `${API_CONFIG.OLLAMA_URL}/api/models`;
      console.log(`Fetching models from: ${modelsUrl}`);

      const response = await fetch(modelsUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${API_CONFIG.OLLAMA_TOKEN}`,
        },
        mode: 'cors',
      });

      console.log(`Models response status: ${response.status}`);

      if (response.ok) {
        try {
          const data = await response.json();
          console.log('Models data:', data);

          // Extract the models from the response based on the observed format
          let models = [];

          // Check for Open WebUI format (data property containing array of models)
          if (data.data && Array.isArray(data.data)) {
            models = data.data;
          }
          // Check for standard array format
          else if (Array.isArray(data)) {
            models = data;
          }
          // Check for 'models' property
          else if (data.models && Array.isArray(data.models)) {
            models = data.models;
          }
          // Fallback to raw data
          else {
            models = [{ name: 'Raw response', id: JSON.stringify(data) }];
          }

          setModelsList(models);
        } catch (e) {
          // Try to parse as text if JSON parsing fails
          const text = await response.text();
          setError(`Received non-JSON response from models endpoint: ${text.substring(0, 100)}...`);
        }
      } else {
        const errorText = await response.text();
        setError(`Failed to fetch models. Status: ${response.status}. ${errorText}`);
      }
    } catch (err) {
      console.error('Error fetching models:', err);
      setError(`Could not fetch models: ${err.message}`);
    } finally {
      setLoadingModels(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', my: 4, px: 2 }}>
      <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <CardHeader
          title="Ollama-Python Connection Test"
          titleTypographyProps={{ align: 'center', variant: 'h5', fontWeight: 'bold' }}
          sx={{
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            pb: 1,
          }}
        />

        <CardContent>
          <Stack spacing={3}>
            {/* Configuration Section */}
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Configuration
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={demoMode}
                        onChange={(e) => setDemoMode(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Use Demo Mode (simulates successful Ollama connection)"
                  />
                </Box>

                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Python API URL:</strong> {API_CONFIG.PYTHON_API_URL}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Ollama VPS URL:</strong> {API_CONFIG.OLLAMA_URL}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Token present:</strong> {API_CONFIG.OLLAMA_TOKEN ? 'Yes' : 'No'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Demo Mode:</strong> {demoMode ? 'Enabled' : 'Disabled'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Actions Section */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="mdi:terminal" />}
                onClick={testOllamaConnection}
                disabled={loading}
                sx={{ minWidth: 180 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} /> : null}
                Test via Python
              </Button>

              <Button
                variant="contained"
                color="success"
                startIcon={<Iconify icon="mdi:cloud" />}
                onClick={testOllamaDirectly}
                disabled={loading}
                sx={{ minWidth: 180 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} /> : null}
                Test Direct to Ollama
              </Button>

              <Button
                variant="contained"
                color="secondary"
                startIcon={<Iconify icon="mdi:model" />}
                onClick={fetchAvailableModels}
                disabled={loadingModels}
                sx={{ minWidth: 180 }}
              >
                {loadingModels ? (
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                ) : null}
                Fetch Models
              </Button>
            </Stack>

            {/* Info Note */}
            <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> The VPS appears to be running Open WebUI for Ollama instead
                of direct Ollama API. This interface allows interaction with Ollama models through a
                web interface.
              </Typography>
            </Alert>

            {/* Status Section */}
            {status && (
              <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
                <Typography variant="body1">
                  <Iconify icon="mdi:check" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {status}
                </Typography>
              </Alert>
            )}

            {/* Error Section */}
            {error && (
              <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                <Typography variant="body1">
                  <Iconify icon="mdi:error" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {error}
                </Typography>
              </Alert>
            )}

            {/* Response Sections */}
            <Stack spacing={2}>
              {pythonResponse && (
                <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'info.lightest' }}>
                  <CardHeader
                    title="Python Response"
                    titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                    avatar={<Iconify icon="mdi:terminal" color="info" />}
                    sx={{ pb: 0 }}
                  />
                  <CardContent>
                    <Typography variant="body2">{pythonResponse}</Typography>
                  </CardContent>
                </Card>
              )}

              {ollamaResponse && (
                <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'success.lightest' }}>
                  <CardHeader
                    title="Ollama Response"
                    titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                    avatar={<Iconify icon="mdi:cloud" color="success" />}
                    sx={{ pb: 0 }}
                  />
                  <CardContent>
                    <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                      <Typography variant="body2">{ollamaResponse}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {modelsList && (
                <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'secondary.lightest' }}>
                  <CardHeader
                    title="Available Models"
                    titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                    avatar={<Iconify icon="mdi:model" color="secondary" />}
                    sx={{ pb: 0 }}
                  />
                  <CardContent>
                    {Array.isArray(modelsList) && modelsList.length > 0 ? (
                      <TableContainer
                        component={Paper}
                        variant="outlined"
                        sx={{ maxHeight: 300, overflow: 'auto' }}
                      >
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>
                                <Typography variant="subtitle2">Name</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="subtitle2">Size</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="subtitle2">Tags</Typography>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {modelsList.map((model, index) => (
                              <TableRow key={index} hover>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="medium">
                                    {model.name || model.id}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {model.size ||
                                      (model.ollama &&
                                        model.ollama.size &&
                                        Math.round(model.ollama.size / 1000000000) + 'GB') ||
                                      '-'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {model.tags && model.tags.length > 0 ? (
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                                      {model.tags.map((tag, idx) => (
                                        <Chip
                                          key={idx}
                                          label={tag}
                                          size="small"
                                          color="secondary"
                                          variant="outlined"
                                        />
                                      ))}
                                    </Stack>
                                  ) : model.ollama && model.ollama.model ? (
                                    <Chip
                                      label={model.ollama.model}
                                      size="small"
                                      color="secondary"
                                      variant="outlined"
                                    />
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No models found or invalid response format
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              )}
            </Stack>

            {/* Footer */}
            <Box pt={1}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary" align="center">
                This component demonstrates communication between Python and Ollama.
                {demoMode && (
                  <Typography
                    variant="body2"
                    color="warning.main"
                    fontWeight="medium"
                    align="center"
                    sx={{ mt: 1 }}
                  >
                    ⚠️ Running in demo mode - this simulates a successful connection without
                    requiring Ollama to be running
                  </Typography>
                )}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default OllamaTest;

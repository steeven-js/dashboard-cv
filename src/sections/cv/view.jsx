// CVWithPDF.jsx
import React, { useState } from 'react';
// Import react-pdf components
import {
  Page,
  Text,
  View,
  Font,
  Document,
  PDFViewer,
  StyleSheet,
  PDFDownloadLink,
} from '@react-pdf/renderer';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Grid, Paper, Button, Container, Typography } from '@mui/material';

// Import original CV component
import OriginalCV from './original-cv';
// Import CV data
import cvData from '../../data/cv-data.json';

// Register Font - utilisation de polices plus fiables accessibles via CDN
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
  fontWeight: 'normal',
});

Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
  fontWeight: 'bold',
});

// Define theme to match MUI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#333333',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Roboto',
    backgroundColor: '#ffffff',
  },
  section: {
    marginBottom: 20,
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  position: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  contact: {
    fontSize: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    borderBottom: '2 solid #000',
    paddingBottom: 5,
    marginBottom: 10,
  },
  sectionContent: {
    marginLeft: 5,
    marginRight: 5,
    lineHeight: 1.6,
  },
  expRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  jobTitle: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  company: {
    fontSize: 11,
    color: '#555555',
    marginBottom: 5,
  },
  dates: {
    fontSize: 10,
    color: '#555555',
  },
  bullet: {
    fontSize: 11,
    marginBottom: 3,
    marginLeft: 10,
    lineHeight: 1.4,
  },
  skillsSection: {
    marginBottom: 5,
  },
  skillsCategory: {
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: 5,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  skillChip: {
    fontSize: 9,
    padding: '3 6',
    borderRadius: 10,
    backgroundColor: '#eeeeee',
    marginRight: 5,
    marginBottom: 5,
  },
});

// PDF document structure - enhanced version to match MUI
const PDFDocument = () => {
  const { personalInfo, about, skills, experience, education } = cvData;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.name}>{personalInfo.name}</Text>
          <Text style={styles.position}>{personalInfo.position}</Text>

          <View style={styles.contactRow}>
            <Text style={styles.contact}>Email: {personalInfo.email}</Text>
            <Text style={styles.contact}>Tél: {personalInfo.phone}</Text>
          </View>

          <View style={styles.contactRow}>
            <Text style={styles.contact}>{personalInfo.location}</Text>
            <Text style={styles.contact}>{personalInfo.github}</Text>
            <Text style={styles.contact}>{personalInfo.linkedin}</Text>
          </View>
        </View>

        {/* À propos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.sectionContent}>{about}</Text>
        </View>

        {/* Compétences Techniques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compétences Techniques</Text>

          {skills.map((skillGroup, index) => (
            <View style={styles.skillsSection} key={index}>
              <Text style={styles.skillsCategory}>{skillGroup.category}</Text>
              <View style={styles.skillsRow}>
                {skillGroup.items.map((skill, i) => (
                  <Text style={styles.skillChip} key={i}>
                    {skill}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Expérience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expérience Professionnelle</Text>

          {experience.map((job, index) => (
            <View style={{ marginBottom: 10 }} key={index}>
              <View style={styles.expRow}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.dates}>{job.dates}</Text>
              </View>
              <Text style={styles.company}>{job.company}</Text>
              {job.responsibilities.map((responsibility, i) => (
                <Text style={styles.bullet} key={i}>
                  • {responsibility}
                </Text>
              ))}
            </View>
          ))}
        </View>

        {/* Formation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Formation</Text>

          {education.map((edu, index) => (
            <View style={{ marginBottom: 7 }} key={index}>
              <View style={styles.expRow}>
                <Text style={styles.jobTitle}>{edu.degree}</Text>
                <Text style={styles.dates}>{edu.dates}</Text>
              </View>
              <Text style={styles.company}>{edu.institution}</Text>
              <Text style={[styles.bullet, { marginTop: 2 }]}>{edu.description}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

// Main component with switching between preview modes
const CVWithPDF = () => {
  const [viewMode, setViewMode] = useState('mui'); // 'mui', 'preview', 'download'
  const [pdfLoading, setPdfLoading] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ padding: 2 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            CV Développeur
          </Typography>

          <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
            <Grid item>
              <Button
                variant={viewMode === 'mui' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('mui')}
              >
                Version MUI
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant={viewMode === 'preview' ? 'contained' : 'outlined'}
                onClick={() => {
                  setViewMode('preview');
                  setPdfLoading(true);
                }}
              >
                Aperçu PDF
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant={viewMode === 'download' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('download')}
              >
                Option Télécharger
              </Button>
            </Grid>
          </Grid>

          {viewMode === 'mui' && <OriginalCV />}

          {viewMode === 'preview' && (
            <Box sx={{ width: '100%', height: '80vh', border: '1px solid #ddd' }}>
              <PDFViewer
                width="100%"
                height="100%"
                style={{
                  border: 'none',
                }}
                onRender={() => setPdfLoading(false)}
              >
                <PDFDocument />
              </PDFViewer>
            </Box>
          )}

          {viewMode === 'download' && (
            <Box sx={{ textAlign: 'center', p: 5 }}>
              <PDFDownloadLink
                document={<PDFDocument />}
                fileName="cv_developpeur.pdf"
                style={{ textDecoration: 'none' }}
              >
                {({ blob, url, loading, error }) => (
                  <Button
                    variant="contained"
                    color={error ? 'error' : 'primary'}
                    disabled={loading}
                    sx={{ mb: 3 }}
                  >
                    {loading ? 'Préparation...' : error ? 'Erreur de PDF' : 'Télécharger PDF'}
                  </Button>
                )}
              </PDFDownloadLink>
              <Typography variant="body1" sx={{ mt: 2 }}>
                Le document sera téléchargé au format PDF prêt à l'impression.
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default CVWithPDF;

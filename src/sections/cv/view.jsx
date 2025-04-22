// CVWithPDF.jsx - Version optimisée pour format A4 sans espaces vides
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

// Import CV data
import { cvData } from 'src/data';

// Import original CV component
import OriginalCV from './original-cv';

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

// Define PDF styles - Version compacte sans espaces vides
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 7,
    fontFamily: 'Roboto',
    backgroundColor: '#ffffff',
    // Removing fixed dimensions to let react-pdf handle A4 sizing
  },
  section: {
    marginBottom: 4, // Espacement encore plus minimal entre sections
  },
  header: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  headerLeft: {
    width: '70%',
  },
  headerRight: {
    width: '30%',
    alignItems: 'flex-end',
  },
  name: {
    fontSize: 16, // Légèrement plus petit
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  position: {
    fontSize: 9, // Légèrement plus petit
    marginBottom: 2,
  },
  contact: {
    fontSize: 6, // Légèrement plus petit
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 8, // Légèrement plus petit
    fontWeight: 'bold',
    textTransform: 'uppercase',
    borderBottom: '0.5 solid #000',
    paddingBottom: 1,
    marginBottom: 2,
  },
  sectionContent: {
    fontSize: 7,
    lineHeight: 1.2,
  },
  mainContainer: {
    width: '100%',
    marginHorizontal: 'auto',
  },
  leftColumn: {
    width: '62%',
    paddingRight: 5,
  },
  rightColumn: {
    width: '38%',
  },
  expItem: {
    marginBottom: 3,
  },
  expTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  jobTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    width: '70%',
  },
  dates: {
    fontSize: 7,
    textAlign: 'right',
    width: '30%',
  },
  company: {
    fontSize: 7,
    marginBottom: 1,
  },
  responsibilitiesContainer: {
    paddingLeft: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 1,
  },
  bulletPoint: {
    width: 8,
    fontSize: 7,
  },
  bulletText: {
    fontSize: 7,
    flex: 1,
  },
  skillSection: {
    marginBottom: 2,
  },
  skillCategory: {
    fontSize: 7,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    fontSize: 6,
    backgroundColor: '#eeeeee',
    borderRadius: 2,
    padding: '1 3',
    marginRight: 2,
    marginBottom: 1,
  },
  eduSection: {
    marginBottom: 3,
  },
  langCertContainer: {
    marginBottom: 2,
  },
  langCertItem: {
    fontSize: 7,
    marginBottom: 1,
    paddingLeft: 4,
  },
});

// PDF document structure - version compacte sans espace vide
const PDFDocument = () => {
  const { personalInfo, about, skills, experience, education } = cvData;

  // Données supplémentaires extraites du composant OriginalCV
  const languages = [
    'Français - Langue maternelle',
    'Anglais - Courant (TOEIC 920/990)',
    'Espagnol - Intermédiaire',
  ];

  const certifications = [
    'AWS Certified Developer - Associate (2023)',
    'MongoDB Certified Developer (2022)',
    'Professional Scrum Master I (2021)',
  ];

  const interests =
    'Contribution à des projets open-source, organisation de meetups tech locaux, hackathons, photographie, randonnée, voyages.';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête optimisée */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>{personalInfo.name}</Text>
            <Text style={styles.position}>{personalInfo.position}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.contact}>Email: {personalInfo.email}</Text>
            <Text style={styles.contact}>Tél: {personalInfo.phone}</Text>
            <Text style={styles.contact}>{personalInfo.github}</Text>
            <Text style={styles.contact}>{personalInfo.linkedin}</Text>
            <Text style={styles.contact}>{personalInfo.location}</Text>
          </View>
        </View>

        {/* Contenu principal en une seule colonne */}
        <View style={styles.mainContainer}>
          {/* Colonne gauche (maintenant principale) */}
          <View style={{ width: '100%' }}>
            {/* À propos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>À propos</Text>
              <Text style={styles.sectionContent}>{about}</Text>
            </View>

            {/* Expérience Professionnelle */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Expérience Professionnelle</Text>

              {experience.map((job, index) => (
                <View style={styles.expItem} key={index}>
                  <View style={styles.expTop}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.dates}>{job.dates}</Text>
                  </View>
                  <Text style={styles.company}>{job.company}</Text>
                  <View style={styles.responsibilitiesContainer}>
                    {job.responsibilities.map((resp, i) => (
                      <View style={styles.bulletItem} key={i}>
                        <Text style={styles.bulletPoint}>•</Text>
                        <Text style={styles.bulletText}>{resp}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* Formation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Formation</Text>

              {education.map((edu, index) => (
                <View style={styles.eduSection} key={index}>
                  <View style={styles.expTop}>
                    <Text style={styles.jobTitle}>{edu.degree}</Text>
                    <Text style={styles.dates}>{edu.dates}</Text>
                  </View>
                  <Text style={styles.company}>{edu.institution}</Text>
                  <Text style={[styles.sectionContent, { paddingLeft: 4 }]}>{edu.description}</Text>
                </View>
              ))}
            </View>

            {/* Compétences Techniques - déplacé ici */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Compétences Techniques</Text>

              {skills.map((skillGroup, index) => (
                <View style={styles.skillSection} key={index}>
                  <Text style={styles.skillCategory}>{skillGroup.category}</Text>
                  <View style={styles.skillsContainer}>
                    {skillGroup.items.map((skill, i) => (
                      <Text style={styles.skillChip} key={i}>
                        {skill}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* Langues */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Langues</Text>
              <View style={styles.langCertContainer}>
                {languages.map((lang, index) => (
                  <View style={styles.bulletItem} key={index}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{lang}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Certifications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Certifications</Text>
              <View style={styles.langCertContainer}>
                {certifications.map((cert, index) => (
                  <View style={styles.bulletItem} key={index}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{cert}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Centres d'intérêt */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Centres d'intérêt</Text>
              <Text style={styles.sectionContent}>{interests}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Main component
const CVWithPDF = () => {
  const [viewMode, setViewMode] = useState('pdf'); // Définir sur 'pdf' par défaut pour afficher directement la version compacte
  const [pdfLoading, setPdfLoading] = useState(true);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ padding: 2 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            CV Développeur Full Stack
          </Typography>

          <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
            <Grid item>
              <Button
                variant={viewMode === 'mui' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('mui')}
              >
                Version Web
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant={viewMode === 'pdf' ? 'contained' : 'outlined'}
                onClick={() => {
                  setViewMode('pdf');
                  setPdfLoading(true);
                }}
              >
                Format A4 compact
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant={viewMode === 'download' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('download')}
              >
                Télécharger PDF
              </Button>
            </Grid>
          </Grid>

          {viewMode === 'mui' && <OriginalCV />}

          {viewMode === 'pdf' && (
            <Box
              sx={{
                width: '100%',
                height: '80vh',
                border: '1px solid #ddd',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <PDFViewer
                width="595"
                height="842"
                showToolbar
                style={{
                  border: 'none',
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
                onRender={() => setPdfLoading(false)}
              >
                <PDFDocument />
              </PDFViewer>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                Format A4 (une page)
              </Box>
            </Box>
          )}

          {viewMode === 'download' && (
            <Box sx={{ textAlign: 'center', p: 5 }}>
              <PDFDownloadLink
                document={<PDFDocument />}
                fileName="cv_format_a4.pdf"
                style={{ textDecoration: 'none' }}
              >
                {({ blob, url, loading, error }) => (
                  <Button
                    variant="contained"
                    color={error ? 'error' : 'primary'}
                    disabled={loading}
                    sx={{ mb: 3 }}
                  >
                    {loading
                      ? 'Préparation...'
                      : error
                        ? 'Erreur de PDF'
                        : 'Télécharger CV format A4'}
                  </Button>
                )}
              </PDFDownloadLink>
              <Typography variant="body1" sx={{ mt: 2 }}>
                Le document sera téléchargé au format PDF optimisé pour impression A4 (une seule
                page).
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default CVWithPDF;

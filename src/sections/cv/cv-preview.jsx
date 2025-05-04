import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const PREVIEW_TEMPLATES = [
  { id: 'modern', name: 'Moderne', icon: 'mdi:view-dashboard-outline' },
  { id: 'classic', name: 'Classique', icon: 'mdi:file-document-outline' },
  { id: 'creative', name: 'Créatif', icon: 'mdi:palette-outline' },
];

// ----------------------------------------------------------------------

export default function CVPreview({ data, onExport }) {
  const [template, setTemplate] = useState('modern');
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    if (data) {
      // Structurer les données pour la prévisualisation
      setPreviewData({
        personalInfo: data.personalInfo || {},
        technicalSkills: data.technicalSkills || [],
        experiences: data.experiences || [],
        projects: data.projects || [],
        education: data.education || [],
      });
    }
  }, [data]);

  const handleChangeTemplate = (newTemplate) => {
    setTemplate(newTemplate);
  };

  if (!previewData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Aucune donnée disponible pour la prévisualisation
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {PREVIEW_TEMPLATES.map((tmpl) => (
          <TemplateOption
            key={tmpl.id}
            template={tmpl}
            isSelected={template === tmpl.id}
            onClick={() => handleChangeTemplate(tmpl.id)}
          />
        ))}
      </Stack>

      <PreviewContainer>
        {template === 'modern' && <ModernTemplate data={previewData} />}
        {template === 'classic' && <ClassicTemplate data={previewData} />}
        {template === 'creative' && <CreativeTemplate data={previewData} />}
      </PreviewContainer>

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="mdi:download" />}
          onClick={() => onExport?.(template)}
        >
          Exporter en PDF
        </Button>
      </Stack>
    </Box>
  );
}

CVPreview.propTypes = {
  data: PropTypes.object,
  onExport: PropTypes.func,
};

// ----------------------------------------------------------------------

function TemplateOption({ template, isSelected, onClick }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2,
        flex: 1,
        cursor: 'pointer',
        transition: (theme) => theme.transitions.create('all'),
        border: (theme) => `1px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
        bgcolor: (theme) => (isSelected ? alpha(theme.palette.primary.main, 0.08) : 'background.paper'),
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: (theme) => theme.customShadows.z8,
        },
      }}
    >
      <Stack spacing={1} alignItems="center">
        <Iconify icon={template.icon} width={24} height={24} />
        <Typography variant="subtitle2">{template.name}</Typography>
      </Stack>
    </Card>
  );
}

TemplateOption.propTypes = {
  template: PropTypes.object,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
};

// ----------------------------------------------------------------------

const PreviewContainer = styled(Box)(({ theme }) => ({
  height: 650,
  overflow: 'auto',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.customShadows.z8,
  '&::-webkit-scrollbar': {
    width: 8,
    height: 8,
  },
  '&::-webkit-scrollbar-thumb': {
    borderRadius: 8,
    backgroundColor: alpha(theme.palette.grey[600], 0.48),
  },
}));

// ----------------------------------------------------------------------

function ModernTemplate({ data }) {
  const { personalInfo, technicalSkills, experiences, projects, education } = data;

  return (
    <Box sx={{ p: 3, fontFamily: (theme) => theme.typography.fontFamily }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center" sx={{ mb: 4 }}>
        <Avatar
          src={personalInfo.photo}
          alt={personalInfo.firstName}
          sx={{ width: 120, height: 120, border: '1px solid', borderColor: 'divider' }}
        />
        <Box>
          <Typography variant="h4" gutterBottom>
            {personalInfo.firstName} {personalInfo.lastName}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {personalInfo.title}
          </Typography>
          <Typography variant="body2">{personalInfo.summary}</Typography>
        </Box>
      </Stack>

      <Grid>
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
          Compétences techniques
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {technicalSkills.map((skill) => (
            <Chip
              key={skill.id}
              label={`${skill.name} ${skill.level ? `• ${skill.level}/5` : ''}`}
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Box>

        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
          Expériences professionnelles
        </Typography>
        <Stack spacing={2} sx={{ mb: 3 }}>
          {experiences.map((exp) => (
            <ExperienceItem key={exp.id} experience={exp} />
          ))}
        </Stack>

        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
          Projets personnels
        </Typography>
        <Stack spacing={2} sx={{ mb: 3 }}>
          {projects.map((project) => (
            <ProjectItem key={project.id} project={project} />
          ))}
        </Stack>

        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
          Formation
        </Typography>
        <Stack spacing={2} sx={{ mb: 3 }}>
          {education.map((edu) => (
            <EducationItem key={edu.id} education={edu} />
          ))}
        </Stack>
      </Grid>
    </Box>
  );
}

ModernTemplate.propTypes = {
  data: PropTypes.object,
};

// ----------------------------------------------------------------------

function ClassicTemplate({ data }) {
  // Implémentation simplifiée du template classique
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Template Classique
      </Typography>
      <Typography variant="body2" align="center" sx={{ mb: 4 }}>
        Ce template sera implémenté prochainement
      </Typography>
    </Box>
  );
}

ClassicTemplate.propTypes = {
  data: PropTypes.object,
};

// ----------------------------------------------------------------------

function CreativeTemplate({ data }) {
  // Implémentation simplifiée du template créatif
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Template Créatif
      </Typography>
      <Typography variant="body2" align="center" sx={{ mb: 4 }}>
        Ce template sera implémenté prochainement
      </Typography>
    </Box>
  );
}

CreativeTemplate.propTypes = {
  data: PropTypes.object,
};

// ----------------------------------------------------------------------

function ExperienceItem({ experience }) {
  return (
    <Box sx={{ pb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        {experience.title} • {experience.company}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        {experience.startDate} - {experience.endDate || 'Présent'} | {experience.location}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {experience.description}
      </Typography>
      {experience.achievements && experience.achievements.length > 0 && (
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          {experience.achievements.map((achievement, index) => (
            <Typography component="li" key={index} variant="body2">
              {achievement}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}

ExperienceItem.propTypes = {
  experience: PropTypes.object,
};

// ----------------------------------------------------------------------

function ProjectItem({ project }) {
  return (
    <Box sx={{ pb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        {project.name}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        {project.startDate} - {project.endDate || 'En cours'}
      </Typography>
      <Typography variant="body2">{project.description}</Typography>
    </Box>
  );
}

ProjectItem.propTypes = {
  project: PropTypes.object,
};

// ----------------------------------------------------------------------

function EducationItem({ education }) {
  return (
    <Box sx={{ pb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        {education.degree}
      </Typography>
      <Typography variant="body2">
        {education.institution}, {education.location}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {education.startDate} - {education.endDate || 'En cours'}
      </Typography>
    </Box>
  );
}

EducationItem.propTypes = {
  education: PropTypes.object,
};

// ----------------------------------------------------------------------

const Grid = styled(Box)({
  display: 'grid',
  gap: 24,
});

const Chip = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  fontWeight: theme.typography.fontWeightMedium,
  fontSize: theme.typography.caption.fontSize,
})); 
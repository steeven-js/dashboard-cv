import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { alpha , useTheme } from '@mui/material/styles';

import { Chart } from 'src/components/chart';

// ----------------------------------------------------------------------

export default function SkillRadarChart({ skills, title, subheader, requiredSkills, maxLevel = 5, ...other }) {
  const theme = useTheme();

  if (!skills?.length) return null;

  // Préparer les données pour le radar chart
  const categories = skills.map((skill) => skill.name);
  const currentValues = skills.map((skill) => skill.level);
  
  // Vérifier si nous avons des niveaux requis à comparer
  const hasRequiredLevels = requiredSkills && requiredSkills.length > 0;
  const requiredValues = hasRequiredLevels
    ? skills.map((skill) => {
        const requiredSkill = requiredSkills.find((req) => req.name === skill.name);
        return requiredSkill ? requiredSkill.level : 0;
      })
    : [];

  const chartSeries = [
    {
      name: 'Niveau actuel',
      data: currentValues,
    },
  ];

  if (hasRequiredLevels) {
    chartSeries.push({
      name: 'Niveau requis',
      data: requiredValues,
    });
  }

  const chartOptions = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
    },
    colors: [theme.palette.primary.main, theme.palette.error.main],
    fill: {
      opacity: 0.75,
    },
    stroke: {
      width: 2,
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      strokeColors: [theme.palette.primary.main, theme.palette.error.main],
      fillColors: [theme.palette.primary.main, theme.palette.error.main],
      hover: {
        size: 6,
      },
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: Array(categories.length).fill(theme.palette.text.secondary),
        },
      },
    },
    yaxis: {
      max: maxLevel,
      min: 0,
      tickAmount: maxLevel,
    },
    tooltip: {
      y: {
        formatter: (value) => `Niveau ${value}/${maxLevel}`,
      },
    },
    plotOptions: {
      radar: {
        polygons: {
          strokeColors: alpha(theme.palette.grey[500], 0.2),
          connectorColors: alpha(theme.palette.grey[500], 0.2),
          fill: {
            colors: ['transparent'],
          },
        },
      },
    },
  };

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 2 }} />
      
      {skills.length > 2 ? (
        <Box sx={{ height: 320, px: 2, pb: 2 }}>
          <Chart type="radar" series={chartSeries} options={chartOptions} height={320} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Ajoutez au moins 3 compétences pour afficher le graphique radar
          </Typography>
        </Box>
      )}
    </Card>
  );
}

SkillRadarChart.propTypes = {
  skills: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      level: PropTypes.number,
    })
  ).isRequired,
  title: PropTypes.string,
  subheader: PropTypes.string,
  requiredSkills: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      level: PropTypes.number,
    })
  ),
  maxLevel: PropTypes.number,
}; 
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { Chart } from 'src/components/chart';

// ----------------------------------------------------------------------

export default function SkillBarChart({ skills, title, subheader, requiredSkills, maxLevel = 5, ...other }) {
  const theme = useTheme();

  if (!skills?.length) return null;

  // Organiser les compétences par catégorie
  const categories = {};
  skills.forEach((skill) => {
    if (!categories[skill.category]) {
      categories[skill.category] = [];
    }
    categories[skill.category].push(skill);
  });

  // Calculer la moyenne par catégorie
  const categoryLabels = Object.keys(categories);
  const categoryAverages = categoryLabels.map((category) => {
    const skillsInCategory = categories[category];
    const sum = skillsInCategory.reduce((acc, skill) => acc + skill.level, 0);
    return parseFloat((sum / skillsInCategory.length).toFixed(1));
  });

  // Si nous avons des niveaux requis, calculer également les moyennes requises
  const hasRequiredLevels = requiredSkills && requiredSkills.length > 0;
  const requiredAverages = hasRequiredLevels
    ? categoryLabels.map((category) => {
        const skillsInCategory = categories[category];
        let requiredSum = 0;
        let count = 0;
        
        skillsInCategory.forEach((skill) => {
          const requiredSkill = requiredSkills.find((req) => req.name === skill.name);
          if (requiredSkill) {
            requiredSum += requiredSkill.level;
            count += 1;
          }
        });
        
        return count > 0 ? parseFloat((requiredSum / count).toFixed(1)) : 0;
      })
    : [];

  const chartSeries = [
    {
      name: 'Niveau moyen',
      data: categoryAverages,
    },
  ];

  if (hasRequiredLevels) {
    chartSeries.push({
      name: 'Niveau requis',
      data: requiredAverages,
    });
  }

  const chartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      stacked: false,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}/${maxLevel}`,
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: [theme.palette.text.secondary],
      },
    },
    colors: [theme.palette.primary.main, theme.palette.error.main],
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: categoryLabels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
    yaxis: {
      max: maxLevel,
      labels: {
        formatter: (val) => val.toFixed(1),
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `Niveau ${val}/${maxLevel}`,
      },
    },
    fill: {
      opacity: 1,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      floating: true,
      offsetY: -25,
      offsetX: -5,
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '80%',
            },
          },
          yaxis: {
            labels: {
              show: false,
            },
          },
        },
      },
    ],
  };

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 2 }} />
      
      {categoryLabels.length > 0 ? (
        <Box sx={{ height: categoryLabels.length > 3 ? 350 : 280, px: 2, pb: 2 }}>
          <Chart 
            type="bar" 
            series={chartSeries} 
            options={chartOptions} 
            height={categoryLabels.length > 3 ? 350 : 280} 
          />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Aucune catégorie de compétence disponible
          </Typography>
        </Box>
      )}
    </Card>
  );
}

SkillBarChart.propTypes = {
  skills: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      level: PropTypes.number,
      category: PropTypes.string.isRequired,
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
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';

// ----------------------------------------------------------------------

export default function SettingSelect({
  domain,
  field,
  label,
  value,
  onChange,
  multiple = false,
  helperText,
  ...other
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, you would fetch settings from an API
    // For now, we'll use mock data
    const mockSettings = {
      post: {
        categories: ['Actualités', 'Tutoriels', 'Événements', 'Annonces'],
        tags: ['Technologie', 'Business', 'Marketing', 'Design', 'Développement'],
      },
      company: {
        sectors: ['Technologie', 'Finance', 'Santé', 'Éducation', 'Industrie'],
        types: ['SARL', 'SAS', 'Auto-entrepreneur', 'SA', 'SCI'],
      },
      invoice: {
        services: ['Consulting', 'Développement', 'Formation', 'Support', 'Maintenance'],
        descriptions: ['Prestation mensuelle', 'Service ponctuel', 'Abonnement annuel'],
        tvaRates: ['0%', '5.5%', '10%', '20%'],
      },
      customer: {
        roles: ['Directeur', 'Manager', 'Responsable IT', 'Comptable', 'Employé'],
      },
    };

    setTimeout(() => {
      // Simulate API delay
      if (mockSettings[domain] && mockSettings[domain][field]) {
        setOptions(mockSettings[domain][field]);
      } else {
        setOptions([]);
      }
      setLoading(false);
    }, 300);
  }, [domain, field]);

  if (multiple) {
    return (
      <FormControl fullWidth disabled={loading}>
        <InputLabel>{label}</InputLabel>
        <Select
          multiple
          value={value || []}
          onChange={onChange}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((selectedValue) => (
                <Chip key={selectedValue} label={selectedValue} size="small" />
              ))}
            </Box>
          )}
          {...other}
        >
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }

  return (
    <TextField
      select
      fullWidth
      label={label}
      value={value || ''}
      onChange={onChange}
      disabled={loading}
      helperText={helperText}
      {...other}
    >
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  );
}

SettingSelect.propTypes = {
  domain: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  multiple: PropTypes.bool,
  helperText: PropTypes.string,
};

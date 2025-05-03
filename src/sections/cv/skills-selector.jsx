import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';

import { getTechnicalSkills } from 'src/services/cv-service';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function SkillsSelector({ 
  label, 
  helperText, 
  value = [], 
  onChange,
  error,
  placeholder,
  ...other 
}) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les compétences techniques de l'utilisateur
  useEffect(() => {
    const loadSkills = async () => {
      try {
        setIsLoading(true);
        const skills = await getTechnicalSkills();
        
        // Extraire les noms uniques des compétences
        const uniqueSkillNames = [...new Set(skills.map(skill => skill.name))];
        setSuggestions(uniqueSkillNames);
      } catch (loadError) {
        console.error('Erreur lors du chargement des compétences:', loadError);
      } finally {
        setIsLoading(false);
      }
    };

    loadSkills();
  }, []);

  // Gérer l'ajout d'une compétence
  const handleAddSkill = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      const newValue = [...value, inputValue.trim()];
      onChange(newValue);
      setInputValue('');
    }
  };

  // Gérer la suppression d'une compétence
  const handleDeleteSkill = (skillToDelete) => {
    const newValue = value.filter(skill => skill !== skillToDelete);
    onChange(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          {label}
        </Typography>
      )}

      <Stack spacing={2}>
        <Autocomplete
          freeSolo
          disabled={isLoading}
          value={null}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          onChange={(event, newValue) => {
            if (newValue && !value.includes(newValue)) {
              onChange([...value, newValue]);
              setInputValue('');
            }
          }}
          options={suggestions}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={placeholder || "Ajouter une compétence"}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {params.InputProps.endAdornment}
                    <InputAdornment position="end">
                      <Button
                        size="small"
                        color="primary"
                        disabled={!inputValue.trim() || value.includes(inputValue.trim())}
                        onClick={handleAddSkill}
                        sx={{ minWidth: 'auto', p: 0.5 }}
                      >
                        <Iconify icon="solar:add-circle-bold" />
                      </Button>
                    </InputAdornment>
                  </>
                ),
              }}
              error={!!error}
              sx={{
                '& .MuiInputBase-root': {
                  minHeight: 56,
                },
              }}
              {...other}
            />
          )}
          sx={{ 
            width: '100%', 
            '& .MuiAutocomplete-endAdornment': {
              top: 'calc(50% - 14px)',
            },
          }}
        />

        {/* Afficher les compétences sélectionnées */}
        {value.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {value.map((skill) => (
              <Chip
                key={skill}
                size="medium"
                color="primary"
                variant="soft"
                label={skill}
                onDelete={() => handleDeleteSkill(skill)}
                sx={{ mb: 0.5, mr: 0.5 }}
              />
            ))}
          </Box>
        )}

        {helperText && (
          <FormHelperText error={!!error}>
            {error || helperText}
          </FormHelperText>
        )}
      </Stack>
    </Box>
  );
}

SkillsSelector.propTypes = {
  label: PropTypes.string,
  helperText: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  placeholder: PropTypes.string,
}; 
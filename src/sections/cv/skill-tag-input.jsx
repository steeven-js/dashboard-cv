import { useState } from 'react';
import PropTypes from 'prop-types';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';

import { Iconify } from 'src/components/iconify';

export default function SkillTagInput({ 
  value = [], 
  onChange, 
  placeholder, 
  helperText, 
  label, 
  error,
  inputSx = {} 
}) {
  const [inputValue, setInputValue] = useState('');

  // Assurer que value est toujours un tableau
  const tags = Array.isArray(value) ? value : [];

  const handleKeyUp = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      handleAddTag();
    }
  };

  const handleAddTag = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput && !tags.includes(trimmedInput)) {
      const newTags = [...tags, trimmedInput];
      onChange(newTags);
      setInputValue('');
    }
  };

  const handleTagDelete = (tagToDelete) => {
    const newTags = tags.filter((tag) => tag !== tagToDelete);
    onChange(newTags);
  };

  return (
    <FormControl fullWidth error={!!error}>
      {label && <FormLabel sx={{ mb: 1, color: 'text.primary' }}>{label}</FormLabel>}
      
      <TextField
        fullWidth
        value={inputValue}
        placeholder={placeholder || 'Ajouter un tag et appuyer sur Entrée'}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleAddTag}
        onKeyUp={handleKeyUp}
        error={!!error}
        sx={{
          '& .MuiInputBase-root': { 
            minHeight: 56,
            fontSize: '1rem'
          },
          ...inputSx
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Iconify
                icon="solar:tag-linear"
                sx={{ color: 'text.disabled', cursor: 'pointer' }}
                onClick={handleAddTag}
              />
            </InputAdornment>
          ),
        }}
      />

      {(helperText || error) && (
        <FormHelperText error={!!error}>
          {error || helperText}
        </FormHelperText>
      )}

      {tags.length > 0 && (
        <Stack
          direction="row"
          flexWrap="wrap"
          spacing={0.5}
          sx={{ mt: 2 }}
        >
          {tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              size="small"
              variant="soft"
              onDelete={() => handleTagDelete(tag)}
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
        </Stack>
      )}
    </FormControl>
  );
}

SkillTagInput.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  helperText: PropTypes.node,
  label: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  inputSx: PropTypes.object,
}; 
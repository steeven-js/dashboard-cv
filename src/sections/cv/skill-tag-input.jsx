import { useState } from 'react';
import PropTypes from 'prop-types';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';

import { getFilteredSkillSuggestions } from 'src/data/skill-model';

import { Iconify } from 'src/components/iconify';

/**
 * Composant pour gérer les tags associés à une compétence
 * Permet d'ajouter, supprimer et afficher des tags
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.value - Liste actuelle des tags
 * @param {Function} props.onChange - Fonction appelée lors de modifications
 * @param {string} props.placeholder - Texte placeholder
 * @param {string} props.helperText - Texte d'aide
 * @param {string} props.label - Libellé du champ
 * @param {string|boolean} props.error - Message d'erreur
 * @param {Object} props.inputSx - Styles supplémentaires
 * @param {string} props.category - Catégorie pour filtrer les suggestions
 */
export default function SkillTagInput({ 
  value = [], 
  onChange, 
  placeholder, 
  helperText, 
  label, 
  error,
  inputSx = {},
  category = null
}) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Assurer que value est toujours un tableau
  const tags = Array.isArray(value) ? value : [];

  // Gérer la saisie de texte
  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);

    // Mise à jour des suggestions
    if (newValue.length >= 2) {
      const filteredSuggestions = getFilteredSkillSuggestions(newValue, category);
      setSuggestions(filteredSuggestions.filter(s => !tags.includes(s)));
    } else {
      setSuggestions([]);
    }
  };

  // Gérer l'appui sur les touches
  const handleKeyUp = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      handleAddTag();
    }
  };

  // Ajouter un tag
  const handleAddTag = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput && !tags.includes(trimmedInput)) {
      const newTags = [...tags, trimmedInput];
      onChange(newTags);
      setInputValue('');
      setSuggestions([]);
    }
  };

  // Supprimer un tag
  const handleTagDelete = (tagToDelete) => {
    const newTags = tags.filter((tag) => tag !== tagToDelete);
    onChange(newTags);
  };

  // Ajouter une suggestion
  const handleSuggestionClick = (suggestion) => {
    if (!tags.includes(suggestion)) {
      const newTags = [...tags, suggestion];
      onChange(newTags);
      setInputValue('');
      setSuggestions([]);
    }
  };

  return (
    <FormControl fullWidth error={!!error}>
      {label && <FormLabel sx={{ mb: 1, color: 'text.primary' }}>{label}</FormLabel>}
      
      <TextField
        fullWidth
        value={inputValue}
        placeholder={placeholder || 'Ajouter un tag et appuyer sur Entrée'}
        onChange={handleInputChange}
        onBlur={() => setTimeout(() => setSuggestions([]), 200)}
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

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Stack
          direction="row"
          flexWrap="wrap"
          spacing={0.5}
          sx={{ mt: 1, mb: 1 }}
        >
          {suggestions.slice(0, 5).map((suggestion, index) => (
            <Chip
              key={index}
              label={suggestion}
              size="small"
              variant="outlined"
              onClick={() => handleSuggestionClick(suggestion)}
              sx={{ mr: 0.5, mb: 0.5, cursor: 'pointer' }}
            />
          ))}
        </Stack>
      )}

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
  category: PropTypes.string,
}; 
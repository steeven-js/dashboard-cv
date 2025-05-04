import PropTypes from 'prop-types';
import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import useMediaQuery from '@mui/material/useMediaQuery';
import InputAdornment from '@mui/material/InputAdornment';

import { getFilteredSkillSuggestions } from 'src/data/skill-model';

import { Iconify } from 'src/components/iconify';

/**
 * Système de gestion des tags pour les compétences
 * Permet de créer, suggérer et rechercher des tags pour faciliter la correspondance avec les offres d'emploi
 */
export default function SkillTagSystem({ 
  allTags = [], 
  popularTags = [], 
  searchedTags = [], 
  onTagSelect,
  onTagCreate,
  onTagSearch,
  selectedTags = [],
  category = null,
  sx
}) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showPopularTags, setShowPopularTags] = useState(true);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Calculer les tags populaires à afficher
  const displayedPopularTags = useMemo(() => 
    // Filtrer les tags populaires pour exclure ceux déjà sélectionnés
     popularTags
      .filter(tag => !selectedTags.includes(tag.name))
      .slice(0, isMobile ? 6 : 10)
  , [popularTags, selectedTags, isMobile]);

  // Mettre à jour les suggestions basées sur la saisie
  useEffect(() => {
    if (inputValue.length >= 2) {
      // Obtenir les suggestions filtrées
      const filteredSuggestions = getFilteredSkillSuggestions(inputValue, category);
      
      // Exclure les tags déjà sélectionnés
      const newSuggestions = filteredSuggestions.filter(s => !selectedTags.includes(s));
      
      setSuggestions(newSuggestions);
      setShowPopularTags(newSuggestions.length === 0);
    } else {
      setSuggestions([]);
      setShowPopularTags(true);
    }
  }, [inputValue, category, selectedTags]);

  // Gérer la saisie de texte
  const handleInputChange = (event, newValue) => {
    setInputValue(newValue);
  };

  // Gérer la sélection d'un tag
  const handleTagSelect = (tag) => {
    if (onTagSelect && !selectedTags.includes(tag)) {
      onTagSelect(tag);
    }
    setInputValue('');
    setSuggestions([]);
  };

  // Créer un nouveau tag
  const handleCreateTag = () => {
    if (inputValue.trim() && onTagCreate && !selectedTags.includes(inputValue.trim())) {
      onTagCreate(inputValue.trim());
      setInputValue('');
    }
  };

  // Rechercher les compétences par tag
  const handleSearchByTag = (tag) => {
    if (onTagSearch) {
      onTagSearch(tag);
    }
  };

  // Calculer l'échelle pour la taille des puces en fonction de la popularité
  const getTagScale = (count) => {
    const maxCount = Math.max(...popularTags.map(tag => tag.count || 1), 1);
    const minScale = 0.8;
    const maxScale = 1.4;
    
    const scale = minScale + ((count / maxCount) * (maxScale - minScale));
    return Math.max(minScale, Math.min(maxScale, scale));
  };

  return (
    <Card sx={{ p: 3, ...sx }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Système de tags pour les compétences
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Stack spacing={2}>
          {/* Champ de recherche et création de tags */}
          <Autocomplete
            freeSolo
            inputValue={inputValue}
            onInputChange={handleInputChange}
            options={suggestions}
            filterOptions={(x) => x}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Rechercher ou créer un tag..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Iconify
                        icon="solar:add-circle-linear"
                        sx={{ 
                          color: 'primary.main', 
                          cursor: 'pointer',
                          visibility: inputValue.trim() ? 'visible' : 'hidden'
                        }}
                        onClick={handleCreateTag}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            noOptionsText="Aucune suggestion"
            onChange={(event, newValue) => {
              if (typeof newValue === 'string') {
                handleTagSelect(newValue);
              }
            }}
          />

          {/* Liste des suggestions */}
          {suggestions.length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Suggestions:
              </Typography>
              <Stack direction="row" flexWrap="wrap" spacing={1}>
                {suggestions.map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion}
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleTagSelect(suggestion)}
                    sx={{ mr: 0.5, mb: 0.5, cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Tags populaires */}
          {showPopularTags && displayedPopularTags.length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Tags populaires:
              </Typography>
              <Stack direction="row" flexWrap="wrap" spacing={1}>
                {displayedPopularTags.map((tag, index) => {
                  const scale = getTagScale(tag.count || 1);
                  
                  return (
                    <Chip
                      key={index}
                      label={`${tag.name} (${tag.count || 0})`}
                      size="small"
                      variant="soft"
                      color="primary"
                      onClick={() => handleTagSelect(tag.name)}
                      sx={{ 
                        mr: 0.5, 
                        mb: 0.5,
                        cursor: 'pointer',
                        fontSize: `${scale}rem`,
                        height: 'auto',
                        py: 0.5
                      }}
                    />
                  );
                })}
              </Stack>
            </Box>
          )}

          {/* Tags récemment recherchés */}
          {searchedTags.length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Recherches récentes:
              </Typography>
              <Stack direction="row" flexWrap="wrap" spacing={1}>
                {searchedTags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleSearchByTag(tag)}
                    icon={<Iconify icon="solar:search-linear" width={14} />}
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </Box>

      {/* Tags sélectionnés */}
      {selectedTags.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Tags sélectionnés
          </Typography>
          <Stack direction="row" flexWrap="wrap" spacing={1}>
            {selectedTags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="medium"
                variant="soft"
                color="primary"
                onDelete={() => onTagSelect && onTagSelect(tag)}
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Card>
  );
}

SkillTagSystem.propTypes = {
  allTags: PropTypes.array,
  popularTags: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      count: PropTypes.number
    })
  ),
  searchedTags: PropTypes.arrayOf(PropTypes.string),
  onTagSelect: PropTypes.func,
  onTagCreate: PropTypes.func,
  onTagSearch: PropTypes.func,
  selectedTags: PropTypes.arrayOf(PropTypes.string),
  category: PropTypes.string,
  sx: PropTypes.object
}; 
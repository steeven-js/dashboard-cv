import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * Barre de filtrage pour les compétences techniques
 */
export default function SkillsFilterBar({ onFilterChange, categories = [] }) {
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Options de filtre par catégorie
  const categoryOptions = [
    { value: '', label: 'Toutes les catégories' },
    ...categories.map(cat => ({ value: cat, label: cat })),
  ];
  
  // Mettre à jour les filtres quand ils changent
  useEffect(() => {
    onFilterChange(category, searchQuery);
  }, [category, searchQuery, onFilterChange]);
  
  // Gestion des changements de catégorie
  const handleCategoryChange = useCallback((event) => {
    setCategory(event.target.value);
  }, []);
  
  // Gestion des changements de recherche
  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);
  
  // Réinitialiser tous les filtres
  const handleResetFilters = useCallback(() => {
    setCategory('');
    setSearchQuery('');
  }, []);
  
  // Réinitialiser un filtre spécifique
  const handleRemoveFilter = useCallback((filterType) => {
    if (filterType === 'category') {
      setCategory('');
    } else if (filterType === 'search') {
      setSearchQuery('');
    }
  }, []);
  
  // Vérifier si des filtres sont actifs
  const hasActiveFilters = category || searchQuery;
  
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Filtres
      </Typography>
      
      <Stack spacing={2}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2}
          alignItems={{ sm: 'center' }}
        >
          {/* Recherche */}
          <TextField
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Rechercher par nom ou tag..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <Iconify
                    icon="eva:close-fill"
                    onClick={() => handleRemoveFilter('search')}
                    sx={{ color: 'text.disabled', cursor: 'pointer' }}
                  />
                </InputAdornment>
              ),
            }}
          />
          
          {/* Catégorie */}
          <FormControl sx={{ minWidth: 240 }}>
            <InputLabel>Catégorie</InputLabel>
            <Select
              value={category}
              label="Catégorie"
              onChange={handleCategoryChange}
              endAdornment={
                category && (
                  <InputAdornment position="end">
                    <Iconify
                      icon="eva:close-fill"
                      onClick={() => handleRemoveFilter('category')}
                      sx={{ color: 'text.disabled', cursor: 'pointer', mr: 1 }}
                    />
                  </InputAdornment>
                )
              }
            >
              {categoryOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        
        {/* Affichage des filtres actifs */}
        {hasActiveFilters && (
          <Stack direction="row" flexWrap="wrap" spacing={1}>
            <Typography variant="body2" sx={{ mr: 1, my: 0.5 }}>
              Filtres actifs:
            </Typography>
            
            {category && (
              <Chip
                label={`Catégorie: ${category}`}
                size="small"
                onDelete={() => handleRemoveFilter('category')}
                color="primary"
                variant="soft"
              />
            )}
            
            {searchQuery && (
              <Chip
                label={`Recherche: ${searchQuery}`}
                size="small"
                onDelete={() => handleRemoveFilter('search')}
                color="primary"
                variant="soft"
              />
            )}
            
            <Chip
              label="Tout réinitialiser"
              size="small"
              onClick={handleResetFilters}
              color="error"
              variant="soft"
            />
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

SkillsFilterBar.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string),
}; 
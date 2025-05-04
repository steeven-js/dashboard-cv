import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';

import { SKILL_CATEGORIES } from 'src/data/skill-model';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * Barre de filtres pour la gestion des compétences techniques
 * Permet de filtrer par catégorie et de rechercher par texte
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Function} props.onFilterChange - Fonction appelée lors du changement de filtres
 */
export default function SkillsFilterBar({ onFilterChange }) {
  const [category, setCategory] = useState('');
  const [searchValue, setSearchValue] = useState('');
  
  // Gérer le changement de catégorie
  const handleCategoryChange = useCallback((event) => {
    const newCategory = event.target.value;
    setCategory(newCategory);
    onFilterChange(newCategory, searchValue);
  }, [onFilterChange, searchValue]);
  
  // Gérer la recherche textuelle
  const handleSearchChange = useCallback((event) => {
    const newSearchValue = event.target.value;
    setSearchValue(newSearchValue);
    onFilterChange(category, newSearchValue);
  }, [onFilterChange, category]);
  
  // Effacer la recherche
  const handleClearSearch = useCallback(() => {
    setSearchValue('');
    onFilterChange(category, '');
  }, [onFilterChange, category]);
  
  // Réinitialiser tous les filtres
  const handleResetFilters = useCallback(() => {
    setCategory('');
    setSearchValue('');
    onFilterChange('', '');
  }, [onFilterChange]);

  return (
    <Card sx={{ p: 2, mb: 3, boxShadow: (theme) => theme.customShadows.z8 }}>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
      >
        {/* Filtre par catégorie */}
        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel>Catégorie</InputLabel>
          
          <Select
            value={category}
            onChange={handleCategoryChange}
            displayEmpty
            label="Catégorie"
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 260 },
              },
            }}
            sx={{ 
              textTransform: 'capitalize',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: (theme) => theme.palette.divider,
              }
            }}
          >
            <MenuItem value="">Toutes les catégories</MenuItem>
            
            <Box sx={{ my: 1, borderBottom: '1px dashed #ddd' }} />
            
            {SKILL_CATEGORIES.map((option) => (
              <MenuItem key={option.value} value={option.value} sx={{ textTransform: 'capitalize' }}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Recherche par texte */}
        <TextField
          fullWidth
          value={searchValue}
          onChange={handleSearchChange}
          placeholder="Rechercher une compétence..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <Stack direction="row" spacing={0.5}>
                {searchValue && (
                  <IconButton onClick={handleClearSearch}>
                    <Iconify icon="eva:close-fill" />
                  </IconButton>
                )}
              </Stack>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: (theme) => theme.palette.divider,
              },
            },
          }}
        />
        
        {/* Bouton réinitialiser les filtres */}
        {(category || searchValue) && (
          <IconButton 
            onClick={handleResetFilters}
            sx={{
              p: 1,
              bgcolor: 'action.selected',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Iconify icon="solar:restart-bold" />
          </IconButton>
        )}
      </Stack>
    </Card>
  );
}

SkillsFilterBar.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
}; 
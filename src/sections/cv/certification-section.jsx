import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

CertificationSection.propTypes = {
  certifications: PropTypes.array,
  onChange: PropTypes.func,
};

export default function CertificationSection({ certifications = [], onChange }) {
  const [items, setItems] = useState(certifications);
  const [newItem, setNewItem] = useState('');
  const [inputError, setInputError] = useState('');

  // Mettre à jour les certifications lorsque les props changent
  useEffect(() => {
    setItems(certifications);
  }, [certifications]);

  // Ajouter une nouvelle certification
  const handleAddItem = () => {
    if (!newItem.trim()) {
      setInputError('Veuillez entrer une certification');
      return;
    }

    if (items.includes(newItem.trim())) {
      setInputError('Cette certification existe déjà');
      return;
    }

    const updatedItems = [...items, newItem.trim()];
    setItems(updatedItems);
    onChange(updatedItems);
    setNewItem('');
    setInputError('');
  };

  // Supprimer une certification
  const handleDeleteItem = (indexToDelete) => {
    const updatedItems = items.filter((_, index) => index !== indexToDelete);
    setItems(updatedItems);
    onChange(updatedItems);
  };

  // Gérer la touche Entrée pour ajouter une certification
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddItem();
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="subtitle2">
          Certifications Complémentaires
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          (optionnel)
        </Typography>
      </Stack>

      <Stack spacing={1}>
        {/* Champ pour ajouter une nouvelle certification */}
        <TextField
          fullWidth
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ajouter une certification (ex: AWS Certified Developer)"
          error={!!inputError}
          helperText={inputError}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button 
                  onClick={handleAddItem}
                  variant="contained" 
                  size="small"
                  sx={{ minWidth: '36px', px: 1 }}
                >
                  <Iconify icon="eva:plus-fill" />
                </Button>
              </InputAdornment>
            ),
          }}
        />

        {/* Liste des certifications */}
        {items.length > 0 && (
          <Stack direction="row" flexWrap="wrap" sx={{ pt: 1 }}>
            {items.map((item, index) => (
              <Chip
                key={index}
                label={item}
                onDelete={() => handleDeleteItem(index)}
                sx={{ m: 0.5 }}
                color="info"
                variant="soft"
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
} 
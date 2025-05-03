import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function AchievementInput({
  label,
  helperText,
  value = [],
  onChange,
  error,
  ...other
}) {
  const [inputValue, setInputValue] = useState('');

  // Gérer l'ajout d'une réalisation
  const handleAddAchievement = () => {
    if (inputValue.trim()) {
      const newAchievements = [...value, inputValue.trim()];
      onChange(newAchievements);
      setInputValue('');
    }
  };

  // Gérer la suppression d'une réalisation
  const handleDeleteAchievement = (index) => {
    const newAchievements = [...value];
    newAchievements.splice(index, 1);
    onChange(newAchievements);
  };

  // Gérer la modification d'une réalisation
  const handleEditAchievement = (index, newValue) => {
    const newAchievements = [...value];
    newAchievements[index] = newValue;
    onChange(newAchievements);
  };

  // Gérer la touche Entrée pour ajouter une réalisation
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddAchievement();
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          {label}
        </Typography>
      )}

      <Stack spacing={2}>
        <TextField
          fullWidth
          value={inputValue}
          placeholder="Ajouter une réalisation (ex: Augmentation du trafic de 20%)"
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          error={!!error}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  size="small"
                  color="primary"
                  disabled={!inputValue.trim()}
                  onClick={handleAddAchievement}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <Iconify icon="solar:add-circle-bold" />
                </Button>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiInputBase-root': {
              minHeight: 56,
            },
          }}
          {...other}
        />

        {/* Liste des réalisations */}
        {value.length > 0 && (
          <List
            dense
            disablePadding
            sx={{
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              '& .MuiListItem-root': {
                px: 2,
                py: 1,
                borderBottom: (theme) => `1px dashed ${theme.palette.divider}`,
                '&:last-child': {
                  borderBottom: 0,
                },
              },
            }}
          >
            {value.map((achievement, index) => (
              <ListItem key={index}>
                <Stack 
                  direction="row" 
                  alignItems="center" 
                  spacing={1}
                  sx={{ width: '100%' }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'common.white',
                      flexShrink: 0,
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {index + 1}
                  </Box>
                  
                  <TextField
                    fullWidth
                    size="small"
                    value={achievement}
                    onChange={(e) => handleEditAchievement(index, e.target.value)}
                    variant="standard"
                    InputProps={{
                      disableUnderline: true,
                    }}
                    sx={{
                      ml: 1,
                      '& .MuiInputBase-input': {
                        py: 0.5,
                      },
                    }}
                  />
                </Stack>

                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    color="error"
                    onClick={() => handleDeleteAchievement(index)}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
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

AchievementInput.propTypes = {
  label: PropTypes.string,
  helperText: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
}; 
import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * Composant pour filtrer les compétences par catégorie
 */
export default function SkillCategoryFilter({
  categories = [],
  selectedCategory = null,
  onSelectCategory,
  compact = false,
  showCounts = true,
  variant = 'soft', // 'soft', 'outlined', 'filled'
}) {
  const theme = useTheme();
  
  // Handler pour la sélection d'une catégorie
  const handleSelectCategory = useCallback((categoryId) => {
    if (onSelectCategory) {
      // Si on clique sur la catégorie déjà sélectionnée, la désélectionner
      onSelectCategory(categoryId === selectedCategory ? null : categoryId);
    }
  }, [onSelectCategory, selectedCategory]);

  // Rendu d'une puce de catégorie
  const renderCategoryChip = (category) => {
    const isSelected = selectedCategory === category.id;
    const labelContent = (
      <>
        {category.icon && (
          <Iconify
            icon={category.icon}
            width={16}
            sx={{ mr: 0.5 }}
          />
        )}
        {category.label}
        {showCounts && category.skillCount > 0 && (
          <Typography
            component="span"
            variant="caption"
            sx={{
              ml: 0.5,
              fontWeight: 'normal',
              color: 'text.secondary',
            }}
          >
            ({category.skillCount})
          </Typography>
        )}
      </>
    );

    return (
      <Tooltip
        key={category.id}
        title={category.description || ''}
        placement="top"
        arrow
        disableHoverListener={!category.description}
      >
        <Chip
          label={labelContent}
          onClick={() => handleSelectCategory(category.id)}
          variant={variant}
          color={category.color || 'default'}
          sx={{
            borderRadius: 1,
            height: 'auto',
            py: 0.75,
            px: 1,
            ...(isSelected && {
              boxShadow: theme.customShadows.z8,
              fontWeight: 'bold',
            }),
          }}
        />
      </Tooltip>
    );
  };

  // Grouper les catégories par parent
  const rootCategories = categories.filter(cat => !cat.parentId);
  const categoryWithChildrenMap = new Map();
  
  categories.forEach(cat => {
    if (cat.parentId) {
      if (!categoryWithChildrenMap.has(cat.parentId)) {
        categoryWithChildrenMap.set(cat.parentId, []);
      }
      categoryWithChildrenMap.get(cat.parentId).push(cat);
    }
  });

  // Si compact, afficher juste une liste plate de catégories
  if (compact) {
    return (
      <Stack
        direction="row"
        flexWrap="wrap"
        spacing={1}
        gap={1}
        alignItems="center"
      >
        {categories.map(category => renderCategoryChip(category))}
      </Stack>
    );
  }

  // Sinon, afficher avec regroupement de sous-catégories
  return (
    <Box sx={{ mb: 3 }}>
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        gap={1}
        alignItems="center"
        mb={2}
      >
        {/* Bouton "Toutes les catégories" */}
        <Button
          variant={selectedCategory === null ? 'contained' : 'outlined'}
          size="small"
          onClick={() => handleSelectCategory(null)}
          startIcon={<Iconify icon="mdi:filter-variant" />}
          sx={{ borderRadius: 1 }}
        >
          Toutes
        </Button>
        
        {/* Catégories racines */}
        {rootCategories.map(category => renderCategoryChip(category))}
      </Stack>
      
      {/* Sous-catégories si une catégorie parente est sélectionnée */}
      {selectedCategory && categoryWithChildrenMap.has(selectedCategory) && (
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          gap={1}
          alignItems="center"
          pl={2}
          py={1}
          sx={{
            borderLeft: `3px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Sous-catégories:
          </Typography>
          
          {categoryWithChildrenMap.get(selectedCategory).map(subcategory => 
            renderCategoryChip(subcategory)
          )}
        </Stack>
      )}
    </Box>
  );
}

SkillCategoryFilter.propTypes = {
  categories: PropTypes.array,
  selectedCategory: PropTypes.string,
  onSelectCategory: PropTypes.func,
  compact: PropTypes.bool,
  showCounts: PropTypes.bool,
  variant: PropTypes.oneOf(['soft', 'outlined', 'filled']),
}; 
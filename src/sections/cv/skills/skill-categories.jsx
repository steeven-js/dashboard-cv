import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

import CategoryDialog from './category-dialog';
import SkillsEmptyContent from './skills-empty-content';

// ----------------------------------------------------------------------

/**
 * Composant pour la gestion des catégories de compétences
 */
export default function SkillCategories({
  categories = [],
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  isLoading = false,
}) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Handlers pour l'ouverture/fermeture de la boîte de dialogue
  const handleOpenDialog = useCallback(() => {
    setSelectedCategory(null);
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setSelectedCategory(null);
  }, []);

  // Handler pour éditer une catégorie
  const handleEditCategory = useCallback((category) => {
    setSelectedCategory(category);
    setOpenDialog(true);
  }, []);

  // Handlers pour la suppression d'une catégorie
  const handleOpenDeleteConfirm = useCallback((category) => {
    setCategoryToDelete(category);
    setOpenConfirm(true);
  }, []);

  const handleCloseDeleteConfirm = useCallback(() => {
    setOpenConfirm(false);
    setCategoryToDelete(null);
  }, []);

  const handleDeleteCategory = useCallback(() => {
    if (categoryToDelete && onDeleteCategory) {
      onDeleteCategory(categoryToDelete.id);
    }
    handleCloseDeleteConfirm();
  }, [categoryToDelete, onDeleteCategory, handleCloseDeleteConfirm]);

  // Handler pour sauvegarder une catégorie (nouvelle ou éditée)
  const handleSaveCategory = useCallback((formData) => {
    if (selectedCategory) {
      // Édition
      if (onEditCategory) {
        onEditCategory({ ...formData, id: selectedCategory.id });
      }
    } else {
      // Création
      if (onAddCategory) {
        onAddCategory(formData);
      }
    }
    handleCloseDialog();
  }, [selectedCategory, onAddCategory, onEditCategory, handleCloseDialog]);

  // Si pas de catégories et pas en chargement, afficher l'état vide
  if (!isLoading && categories.length === 0) {
    return (
      <SkillsEmptyContent
        title="Aucune catégorie"
        description="Commencez à organiser vos compétences en créant des catégories."
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleOpenDialog}
          >
            Nouvelle catégorie
          </Button>
        }
      />
    );
  }

  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5">Catégories de compétences</Typography>
        
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleOpenDialog}
        >
          Nouvelle catégorie
        </Button>
      </Box>
      
      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Catégorie</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Compétences</TableCell>
                  <TableCell>Couleur</TableCell>
                  <TableCell>Icône</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id || category.value}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="subtitle2" noWrap>
                          {category.label}
                        </Typography>
                        {category.parentId && (
                          <Tooltip title="Sous-catégorie">
                            <Label color="info" variant="soft">
                              Sous-catégorie
                            </Label>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 240 }}>
                        {category.description || '-'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Typography variant="subtitle2">
                        {category.skillCount || 0}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Label color={category.color || 'default'}>
                        {category.color || 'default'}
                      </Label>
                    </TableCell>
                    
                    <TableCell>
                      {category.icon ? (
                        <Iconify icon={category.icon} width={24} />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    
                    <TableCell align="right">
                      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEditCategory(category)}
                        >
                          <Iconify icon="eva:edit-fill" />
                        </IconButton>
                        
                        <IconButton 
                          color="error" 
                          onClick={() => handleOpenDeleteConfirm(category)}
                          disabled={category.skillCount > 0}
                        >
                          <Iconify icon="eva:trash-2-outline" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      </Card>
      
      {/* Boîte de dialogue pour créer/éditer une catégorie */}
      <CategoryDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleSaveCategory}
        category={selectedCategory}
        categories={categories}
      />
      
      {/* Dialogue de confirmation pour la suppression */}
      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseDeleteConfirm}
        title="Supprimer la catégorie"
        content={
          <>
            Êtes-vous sûr de vouloir supprimer la catégorie
            <Typography component="span" variant="subtitle2" sx={{ mx: 0.5 }}>
              {categoryToDelete?.label}
            </Typography>
            ?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteCategory}
          >
            Supprimer
          </Button>
        }
      />
    </>
  );
}

SkillCategories.propTypes = {
  categories: PropTypes.array,
  onAddCategory: PropTypes.func,
  onEditCategory: PropTypes.func,
  onDeleteCategory: PropTypes.func,
  isLoading: PropTypes.bool,
}; 
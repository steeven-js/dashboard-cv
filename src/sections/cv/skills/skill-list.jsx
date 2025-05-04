import { m } from 'framer-motion';
import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { TablePaginationCustom } from 'src/components/table';
import { FiltersBlock, FiltersResult } from 'src/components/filters-result';
import { varFade, varContainer, MotionContainer } from 'src/components/animate';

import SkillCard from './skill-card';

// ----------------------------------------------------------------------

// Nombre d'éléments par page
const ITEMS_PER_PAGE = [9, 18, 36];

/**
 * Composant pour afficher la liste des compétences techniques
 * Avec options de filtrage, tri et pagination
 */
export default function SkillList({ skills = [], onEdit, onDelete, title = 'Compétences techniques' }) {
  // État pour le mode d'affichage (grille ou liste)
  const [viewMode, setViewMode] = useState('grid');
  
  // État pour les filtres
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    visibility: 'all',
    sort: 'name-asc',
  });
  
  // État pour la pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  
  // Gérer le changement de mode d'affichage
  const handleChangeViewMode = useCallback((event) => {
    setViewMode(event.target.value);
  }, []);
  
  // Gérer les changements de filtres
  const handleChangeFilter = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setPage(0);
  }, []);
  
  // Réinitialiser tous les filtres
  const handleResetFilters = useCallback(() => {
    setFilters({
      category: '',
      search: '',
      visibility: 'all',
      sort: 'name-asc',
    });
    setPage(0);
  }, []);
  
  // Gérer le changement de page
  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);
  
  // Gérer le changement du nombre d'éléments par page
  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);
  
  // Appliquer les filtres aux compétences
  const filteredSkills = applyFilter({
    skills,
    filters,
  });
  
  // Trier les compétences selon le critère sélectionné
  const sortedSkills = applySorting(filteredSkills, filters.sort);
  
  // Paginer les compétences
  const paginatedSkills = sortedSkills.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  // Extraire les catégories uniques pour le filtre
  const uniqueCategories = [...new Set(skills.map((skill) => skill.category))].filter(Boolean);
  
  // Calculer les filtres actifs
  const canReset = filters.category !== '' || filters.search !== '' || filters.visibility !== 'all';
  const hasResults = filteredSkills.length > 0;
  
  return (
    <Container component={MotionContainer} maxWidth={false}>
      <Stack spacing={2.5}>
        <Stack
          spacing={3}
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
        >
          <Stack spacing={1}>
            <m.div variants={varFade('inLeft').in}>
              <FiltersBlock
                label="Catégorie:"
                isShow={!!filters.category}
              >
                <Button
                  color="error"
                  onClick={() => handleChangeFilter('category', '')}
                  endIcon={<Iconify icon="eva:close-fill" />}
                >
                  {filters.category}
                </Button>
              </FiltersBlock>
            </m.div>
            
            <m.div variants={varFade('inLeft').in}>
              <FiltersBlock
                label="Visibilité:"
                isShow={filters.visibility !== 'all'}
              >
                <Button
                  color="error"
                  onClick={() => handleChangeFilter('visibility', 'all')}
                  endIcon={<Iconify icon="eva:close-fill" />}
                >
                  {filters.visibility === 'visible' ? 'Visible' : 'Masquée'}
                </Button>
              </FiltersBlock>
            </m.div>
          </Stack>
          
          <Stack 
            direction="row" 
            alignItems="center" 
            spacing={2}
            sx={{ flexShrink: 0 }}
          >
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                value={filters.search}
                onChange={(e) => handleChangeFilter('search', e.target.value)}
                placeholder="Rechercher..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: { xs: 1, md: 220 } }}
              />
              
              <Select
                size="small"
                value={filters.category}
                onChange={(e) => handleChangeFilter('category', e.target.value)}
                displayEmpty
                sx={{ width: { xs: 120, md: 160 } }}
              >
                <MenuItem value="">Toutes les catégories</MenuItem>
                <MenuItem divider disabled>
                  Filtrer par catégorie
                </MenuItem>
                {uniqueCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
              
              <Select
                size="small"
                value={filters.visibility}
                onChange={(e) => handleChangeFilter('visibility', e.target.value)}
                sx={{ width: { xs: 120, md: 160 } }}
              >
                <MenuItem value="all">Toutes les compétences</MenuItem>
                <MenuItem value="visible">Visibles</MenuItem>
                <MenuItem value="hidden">Masquées</MenuItem>
              </Select>
            </Stack>
            
            <Stack direction="row" spacing={1}>
              <Select
                size="small"
                value={filters.sort}
                onChange={(e) => handleChangeFilter('sort', e.target.value)}
                sx={{ width: { xs: 120, md: 160 } }}
              >
                <MenuItem value="name-asc">Nom (A-Z)</MenuItem>
                <MenuItem value="name-desc">Nom (Z-A)</MenuItem>
                <MenuItem value="level-desc">Niveau (Décroissant)</MenuItem>
                <MenuItem value="level-asc">Niveau (Croissant)</MenuItem>
                <MenuItem value="recent">Les plus récents</MenuItem>
              </Select>
              
              <RadioGroup
                row
                value={viewMode}
                onChange={handleChangeViewMode}
                sx={{ 
                  '& .MuiFormControlLabel-root': { 
                    m: 0,
                    '& .MuiRadio-root': { p: 0.75 } 
                  } 
                }}
              >
                <FormControlLabel
                  value="grid"
                  control={
                    <Radio
                      icon={<Iconify icon="carbon:grid" />}
                      checkedIcon={<Iconify icon="carbon:grid" />}
                    />
                  }
                  label=""
                  sx={{
                    mr: 1,
                    '& .MuiFormControlLabel-label': { sr: 'only' },
                  }}
                />
                
                <FormControlLabel
                  value="list"
                  control={
                    <Radio
                      icon={<Iconify icon="carbon:list" />}
                      checkedIcon={<Iconify icon="carbon:list" />}
                    />
                  }
                  label=""
                  sx={{
                    '& .MuiFormControlLabel-label': { sr: 'only' },
                  }}
                />
              </RadioGroup>
            </Stack>
          </Stack>
        </Stack>
        
        {canReset && (
          <m.div variants={varFade('inDown').in}>
            <FiltersResult
              sx={{ mb: 2 }}
              onReset={handleResetFilters}
              totalResults={filteredSkills.length}
            />
          </m.div>
        )}
        
        {/* Affichage des compétences */}
        {hasResults ? (
          <>
            <Box
              component={m.div}
              variants={
                viewMode === 'grid'
                  ? varContainer()
                  : varFade('inUp').in
              }
              gap={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: viewMode === 'list' ? 'repeat(1, 1fr)' : 'repeat(3, 1fr)',
              }}
            >
              {paginatedSkills.map((skill) => (
                <m.div key={skill.id} variants={viewMode === 'grid' ? varFade('inUp') : undefined}>
                  <SkillCard
                    skill={skill}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </m.div>
              ))}
            </Box>
            
            <TablePaginationCustom
              count={filteredSkills.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={ITEMS_PER_PAGE}
            />
          </>
        ) : (
          <EmptyContent
            filled
            title="Aucune compétence trouvée"
            description="Essayez de modifier vos critères de recherche"
            imgUrl="/assets/icons/empty/ic-content.svg"
            sx={{ py: 5 }}
          />
        )}
      </Stack>
    </Container>
  );
}

SkillList.propTypes = {
  skills: PropTypes.array,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  title: PropTypes.string,
};

// ----------------------------------------------------------------------

/**
 * Filtre les compétences selon les critères spécifiés
 */
function applyFilter({ skills, filters }) {
  const { category, search, visibility } = filters;
  
  const filterSkills = skills.filter((skill) => {
    // Filtre par catégorie
    if (category && skill.category !== category) {
      return false;
    }
    
    // Filtre par visibilité
    if (visibility === 'visible' && !skill.visibility) {
      return false;
    }
    
    if (visibility === 'hidden' && skill.visibility) {
      return false;
    }
    
    // Filtre par recherche
    if (search) {
      const searchLower = search.toLowerCase();
      const nameMatch = skill.name.toLowerCase().includes(searchLower);
      const tagsMatch = skill.tags && skill.tags.some((tag) => tag.toLowerCase().includes(searchLower));
      
      return nameMatch || tagsMatch;
    }
    
    return true;
  });
  
  return filterSkills;
}

/**
 * Trie les compétences selon le critère spécifié
 */
function applySorting(skills, sortBy) {
  const sorted = [...skills];
  
  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    
    case 'level-desc':
      return sorted.sort((a, b) => b.level - a.level);
    
    case 'level-asc':
      return sorted.sort((a, b) => a.level - b.level);
    
    case 'recent':
      return sorted.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0;
      });
    
    default:
      return sorted;
  }
} 
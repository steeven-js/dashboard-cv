import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';

// mui
import { 
  Card, 
  Table, 
  Stack, 
  Button, 
  TableRow, 
  Container, 
  TableBody, 
  TableCell, 
  Typography,
  TableContainer, 
  CircularProgress 
} from '@mui/material';

// components
import { paths } from 'src/routes/paths';

// service
import { cvService } from 'src/services/cv';

import { Iconify } from 'src/components/iconify';
import { TableHeadCustom } from 'src/components/table';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'ID' },
  { id: 'date', label: 'Date de création' },
  { id: 'actions', label: 'Actions', align: 'right' },
];

// ----------------------------------------------------------------------

export default function CVListPage() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [cvs, setCvs] = useState([]);

  useEffect(() => {
    const fetchCVs = async () => {
      try {
        setLoading(true);
        const data = await cvService.getUserCVs();
        setCvs(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des CVs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCVs();
  }, []);

  const handleViewDetails = (id) => {
    navigate(`${paths.dashboard.cv.details}/${id}`);
  };

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Mes CVs</Typography>
        
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={() => navigate(paths.dashboard.cv.new)}
        >
          Nouveau CV
        </Button>
      </Stack>

      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Table>
            <TableHeadCustom headLabel={TABLE_HEAD} />

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : cvs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2">Aucun CV trouvé</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                cvs.map((cv) => (
                  <TableRow key={cv.id} hover>
                    <TableCell>{cv.id}</TableCell>
                    <TableCell>{new Date(cv.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewDetails(cv.id)}
                        startIcon={<Iconify icon="eva:eye-fill" />}
                      >
                        Voir détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Container>
  );
} 
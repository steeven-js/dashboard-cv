import PropTypes from 'prop-types';

// @mui
import { TableRow, TableCell, TableHead, TableSortLabel } from '@mui/material';

// ----------------------------------------------------------------------

export function TableHeadCustom({
  order,
  orderBy,
  headLabel,
  onSort,
  sx,
}) {
  return (
    <TableHead sx={sx}>
      <TableRow>
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width, minWidth: headCell.minWidth }}
          >
            {onSort ? (
              <TableSortLabel
                hideSortIcon
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={() => onSort(headCell.id)}
              >
                {headCell.label}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

TableHeadCustom.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']),
  orderBy: PropTypes.string,
  headLabel: PropTypes.array,
  onSort: PropTypes.func,
  sx: PropTypes.object,
}; 
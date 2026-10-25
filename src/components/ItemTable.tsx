import {
  Box,
  Link,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { categoryOf } from '../clothTypes';
import TypeIcon from './TypeIcon';
import { swatchFor } from '../colors';
import { SORT_COLUMNS, type SortDir, type SortKey } from '../sort';
import ItemThumb from './ItemThumb';
import type { ClothItem } from '../types';

interface Props {
  /** already sorted */
  items: ClothItem[];
  sortKey: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
  onEdit: (item: ClothItem) => void;
  onDelete: (item: ClothItem) => void;
}

export default function ItemTable({ items, sortKey, dir, onSort, onEdit, onDelete }: Props) {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            {SORT_COLUMNS.map((c) => (
              <TableCell key={c.key} align={c.numeric ? 'right' : 'left'} sortDirection={sortKey === c.key ? dir : false}>
                <TableSortLabel active={sortKey === c.key} direction={sortKey === c.key ? dir : 'asc'} onClick={() => onSort(c.key)}>
                  {c.label}
                </TableSortLabel>
              </TableCell>
            ))}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((it) => (
            <TableRow key={it.id} hover>
              <TableCell>
                <ItemThumb item={it} size={40} fontSize={22} />
              </TableCell>
              <TableCell>
                {/^https?:\/\//i.test(it.url) ? (
                  <Link href={it.url} target="_blank" rel="noopener noreferrer">{it.name}</Link>
                ) : (
                  it.name
                )}
              </TableCell>
              <TableCell>{it.purchasedDate}</TableCell>
              <TableCell>{it.brand}</TableCell>
              <TableCell>{categoryOf(it.type)}</TableCell>
              <TableCell>{it.type && <><TypeIcon type={it.type} /> {it.type}</>}</TableCell>
              <TableCell>
                {swatchFor(it.color) && (
                  <Box
                    component="span"
                    sx={{ display: 'inline-block', width: 14, height: 14, mr: 1, verticalAlign: 'middle', borderRadius: '50%', border: 1, borderColor: 'divider', background: swatchFor(it.color) }}
                  />
                )}
                {it.color}
              </TableCell>
              <TableCell>{it.size}</TableCell>
              <TableCell align="right">{it.cost.toLocaleString()}</TableCell>
              <TableCell align="right">
                <IconButton size="small" aria-label="edit" onClick={() => onEdit(it)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" aria-label="delete" onClick={() => onDelete(it)}><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={10} align="center">No items yet. Add your first cloth item.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

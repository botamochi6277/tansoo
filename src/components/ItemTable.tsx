import { useMemo, useState } from 'react';
import {
  Avatar,
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
import { typeIcon } from '../clothTypes';
import { swatchFor } from '../colors';
import type { ClothItem } from '../types';

type SortKey = Exclude<keyof ClothItem, 'id'>;

const columns: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: 'name', label: 'Name' },
  { key: 'purchasedDate', label: 'Purchased' },
  { key: 'brand', label: 'Brand' },
  { key: 'type', label: 'Type' },
  { key: 'color', label: 'Color' },
  { key: 'cost', label: 'Cost (¥)', numeric: true },
];

interface Props {
  items: ClothItem[];
  onEdit: (item: ClothItem) => void;
  onDelete: (item: ClothItem) => void;
}

export default function ItemTable({ items, onEdit, onDelete }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('purchasedDate');
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    const sign = dir === 'asc' ? 1 : -1;
    return [...items].sort((a, b) => {
      const x = a[sortKey];
      const y = b[sortKey];
      return (typeof x === 'number' ? x - (y as number) : String(x).localeCompare(String(y))) * sign;
    });
  }, [items, sortKey, dir]);

  const toggle = (k: SortKey) => {
    if (k === sortKey) setDir(dir === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(k);
      setDir('asc');
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            {columns.map((c) => (
              <TableCell key={c.key} align={c.numeric ? 'right' : 'left'} sortDirection={sortKey === c.key ? dir : false}>
                <TableSortLabel active={sortKey === c.key} direction={sortKey === c.key ? dir : 'asc'} onClick={() => toggle(c.key)}>
                  {c.label}
                </TableSortLabel>
              </TableCell>
            ))}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((it) => (
            <TableRow key={it.id} hover>
              <TableCell>
                <Avatar variant="rounded" src={it.image || undefined} alt={it.name} sx={{ width: 40, height: 40, fontSize: 22, bgcolor: 'action.hover' }}>
                  {typeIcon(it.type)}
                </Avatar>
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
              <TableCell>{it.type && `${typeIcon(it.type)} ${it.type}`}</TableCell>
              <TableCell>
                {swatchFor(it.color) && (
                  <Box
                    component="span"
                    sx={{ display: 'inline-block', width: 14, height: 14, mr: 1, verticalAlign: 'middle', borderRadius: '50%', border: 1, borderColor: 'divider', background: swatchFor(it.color) }}
                  />
                )}
                {it.color}
              </TableCell>
              <TableCell align="right">{it.cost.toLocaleString()}</TableCell>
              <TableCell align="right">
                <IconButton size="small" aria-label="edit" onClick={() => onEdit(it)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" aria-label="delete" onClick={() => onDelete(it)}><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>
          ))}
          {sorted.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center">No items yet. Add your first cloth item.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

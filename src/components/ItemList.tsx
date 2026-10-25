import { useMemo, useState } from 'react';
import { IconButton, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { SORT_COLUMNS, sortItems, type SortDir, type SortKey } from '../sort';
import ItemCards from './ItemCards';
import ItemTable from './ItemTable';
import type { ClothItem } from '../types';

type View = 'table' | 'cards';
const VIEW_KEY = 'tansoo-view';

function savedView(): View {
  try {
    return localStorage.getItem(VIEW_KEY) === 'table' ? 'table' : 'cards'; // cards unless the user chose the table
  } catch {
    return 'cards';
  }
}

interface Props {
  items: ClothItem[];
  onEdit: (item: ClothItem) => void;
  onDelete: (item: ClothItem) => void;
}

/** Items as a table or as compact cards, sharing one sort order. */
export default function ItemList({ items, onEdit, onDelete }: Props) {
  const [view, setView] = useState<View>(savedView);
  const [sortKey, setSortKey] = useState<SortKey>('purchasedDate');
  const [dir, setDir] = useState<SortDir>('desc');

  const sorted = useMemo(() => sortItems(items, sortKey, dir), [items, sortKey, dir]);

  const changeView = (v: View | null) => {
    if (!v) return;
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* storage unavailable */
    }
  };

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setDir(dir === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(k);
      setDir('asc');
    }
  };

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
        <ToggleButtonGroup size="small" exclusive value={view} onChange={(_, v) => changeView(v)} aria-label="view">
          <ToggleButton value="table" aria-label="table view"><ViewListIcon fontSize="small" /></ToggleButton>
          <ToggleButton value="cards" aria-label="card view"><ViewModuleIcon fontSize="small" /></ToggleButton>
        </ToggleButtonGroup>
        {view === 'cards' && (
          <>
            <TextField select size="small" label="Sort by" value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} sx={{ minWidth: 140 }}>
              {SORT_COLUMNS.map((c) => <MenuItem key={c.key} value={c.key}>{c.label}</MenuItem>)}
            </TextField>
            <IconButton aria-label="toggle sort direction" onClick={() => setDir(dir === 'asc' ? 'desc' : 'asc')}>
              {dir === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            </IconButton>
          </>
        )}
      </Stack>
      {view === 'table' ? (
        <ItemTable items={sorted} sortKey={sortKey} dir={dir} onSort={toggleSort} onEdit={onEdit} onDelete={onDelete} />
      ) : (
        <ItemCards items={sorted} onEdit={onEdit} onDelete={onDelete} />
      )}
    </>
  );
}

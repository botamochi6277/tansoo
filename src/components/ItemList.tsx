import { useMemo, useState } from 'react';
import { Button, IconButton, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { CATEGORIES, categoryOf } from '../clothTypes';
import { COLORS } from '../colors';
import { filterItems, isFiltering, NO_FILTERS, type Filters } from '../filter';
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

  const [filters, setFilters] = useState<Filters>(NO_FILTERS);

  // only offer values that exist in the closet
  const options = useMemo(() => {
    const colors = new Set(items.map((i) => i.color));
    const cats = new Set(items.map((i) => categoryOf(i.type)));
    return {
      categories: CATEGORIES.map((c) => c.name).filter((c) => cats.has(c)),
      colors: [...COLORS.map((c) => c.name).filter((c) => colors.has(c)), ...[...colors].filter((c) => c && !COLORS.some((x) => x.name === c))],
      brands: [...new Set(items.map((i) => i.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    };
  }, [items]);

  const shown = useMemo(() => filterItems(items, filters), [items, filters]);
  const sorted = useMemo(() => sortItems(shown, sortKey, dir), [shown, sortKey, dir]);

  const multi = (label: string, key: 'categories' | 'colors' | 'brands', values: string[]) => (
    <TextField
      select
      size="small"
      label={label}
      value={filters[key]}
      onChange={(e) => setFilters({ ...filters, [key]: e.target.value as unknown as string[] })}
      slotProps={{ select: { multiple: true, renderValue: (v) => (v as string[]).join(', ') } }}
      sx={{ minWidth: 140, maxWidth: 220 }}
    >
      {values.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
    </TextField>
  );

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
      <Stack direction="row" useFlexGap spacing={1} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          label="Search"
          placeholder="name, brand, type…"
          value={filters.text}
          onChange={(e) => setFilters({ ...filters, text: e.target.value })}
          sx={{ minWidth: 180 }}
        />
        {multi('Category', 'categories', options.categories)}
        {multi('Color', 'colors', options.colors)}
        {multi('Brand', 'brands', options.brands)}
        {isFiltering(filters) && (
          <>
            <Button onClick={() => setFilters(NO_FILTERS)}>Clear</Button>
            <Typography variant="body2" color="text.secondary">{sorted.length} of {items.length} items</Typography>
          </>
        )}
      </Stack>
      {items.length > 0 && sorted.length === 0 ? (
        <Typography align="center" color="text.secondary">No items match the filters.</Typography>
      ) : view === 'table' ? (
        <ItemTable items={sorted} sortKey={sortKey} dir={dir} onSort={toggleSort} onEdit={onEdit} onDelete={onDelete} />
      ) : (
        <ItemCards items={sorted} onEdit={onEdit} onDelete={onDelete} />
      )}
    </>
  );
}

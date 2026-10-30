import { useMemo, useState } from 'react';
import { Button, IconButton, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { CATEGORIES, categoryOf } from '../clothTypes';
import { COLORS } from '../colors';
import { effectiveFormality, FORMALITY_LEVELS, formalityKey, signed } from '../formality';
import { filterItems, isFiltering, NO_FILTERS, type Filters } from '../filter';
import { SORT_COLUMNS, sortItems, type SortDir, type SortKey } from '../sort';
import { useI18n, type Key } from '../i18n';
import { currentSeason, SEASONS, seasonKey, type Season } from '../season';
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
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  onEdit: (item: ClothItem) => void;
  onDelete: (item: ClothItem) => void;
}

/** Items as a table or as compact cards, sharing one sort order. */
export default function ItemList({ items, filters, onFiltersChange: setFilters, onEdit, onDelete }: Props) {
  const { t, categoryLabel, colorLabel } = useI18n();
  const now = currentSeason();
  const [view, setView] = useState<View>(savedView);
  const [sortKey, setSortKey] = useState<SortKey>('purchasedDate');
  const [dir, setDir] = useState<SortDir>('desc');


  // only offer values that exist in the closet
  const options = useMemo(() => {
    const colors = new Set(items.map((i) => i.color));
    const scores = new Set(items.map((i) => String(effectiveFormality(i))));
    const cats = new Set(items.map((i) => categoryOf(i.type)));
    return {
      categories: CATEGORIES.map((c) => c.name).filter((c) => cats.has(c)),
      colors: [...COLORS.map((c) => c.name).filter((c) => colors.has(c)), ...[...colors].filter((c) => c && !COLORS.some((x) => x.name === c))],
      formalities: FORMALITY_LEVELS.map(String).filter((f) => scores.has(f)),
      brands: [...new Set(items.map((i) => i.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    };
  }, [items]);

  const shown = useMemo(() => filterItems(items, filters), [items, filters]);
  const sorted = useMemo(() => sortItems(shown, sortKey, dir), [shown, sortKey, dir]);

  const multi = (label: string, key: 'categories' | 'colors' | 'brands' | 'formalities' | 'seasons', values: string[], show: (v: string) => string) => (
    <TextField
      select
      size="small"
      label={label}
      value={filters[key]}
      onChange={(e) => setFilters({ ...filters, [key]: e.target.value as unknown as string[] })}
      slotProps={{ select: { multiple: true, renderValue: (v) => (v as string[]).map(show).join(', ') } }}
      sx={{ minWidth: 140, maxWidth: 220 }}
    >
      {values.map((v) => <MenuItem key={v} value={v}>{show(v)}</MenuItem>)}
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
          <ToggleButton value="table" aria-label={t('list.tableView')}><ViewListIcon fontSize="small" /></ToggleButton>
          <ToggleButton value="cards" aria-label={t('list.cardView')}><ViewModuleIcon fontSize="small" /></ToggleButton>
        </ToggleButtonGroup>
        {view === 'cards' && (
          <>
            <TextField select size="small" label={t('list.sortBy')} value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} sx={{ minWidth: 140 }}>
              {SORT_COLUMNS.map((c) => <MenuItem key={c.key} value={c.key}>{t(`col.${c.key}` as Key)}</MenuItem>)}
            </TextField>
            <IconButton aria-label={t('list.sortDir')} onClick={() => setDir(dir === 'asc' ? 'desc' : 'asc')}>
              {dir === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            </IconButton>
          </>
        )}
      </Stack>
      <Stack direction="row" useFlexGap spacing={1} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          label={t('list.search')}
          placeholder={t('list.searchPh')}
          value={filters.text}
          onChange={(e) => setFilters({ ...filters, text: e.target.value })}
          sx={{ minWidth: 180 }}
        />
        {multi(t('col.category'), 'categories', options.categories, categoryLabel)}
        {multi(t('col.color'), 'colors', options.colors, colorLabel)}
        {multi(t('col.formality'), 'formalities', options.formalities, (v) => `${signed(Number(v))} ${t(formalityKey(Number(v)))}`)}
        {multi(t('col.seasons'), 'seasons', [...SEASONS], (v) => t(seasonKey(v as Season)))}
        <Button
          size="small"
          variant={filters.seasons.length === 1 && filters.seasons[0] === now ? 'contained' : 'outlined'}
          onClick={() => setFilters({ ...filters, seasons: filters.seasons.length === 1 && filters.seasons[0] === now ? [] : [now] })}
        >
          {t('list.nowSeason', { season: t(seasonKey(now)) })}
        </Button>
        {multi(t('col.brand'), 'brands', options.brands, (v) => v)}
        {isFiltering(filters) && (
          <>
            <Button onClick={() => setFilters(NO_FILTERS)}>{t('list.clear')}</Button>
            <Typography variant="body2" color="text.secondary">{t('list.count', { n: sorted.length, total: items.length })}</Typography>
          </>
        )}
      </Stack>
      {items.length > 0 && sorted.length === 0 ? (
        <Typography align="center" color="text.secondary">{t('list.noMatch')}</Typography>
      ) : view === 'table' ? (
        <ItemTable items={sorted} sortKey={sortKey} dir={dir} onSort={toggleSort} onEdit={onEdit} onDelete={onDelete} />
      ) : (
        <ItemCards items={sorted} onEdit={onEdit} onDelete={onDelete} />
      )}
    </>
  );
}

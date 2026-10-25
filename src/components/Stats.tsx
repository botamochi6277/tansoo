import { Box, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';
import ColorByCategory from './ColorByCategory';
import { categoryOf } from '../clothTypes';
import { useI18n } from '../i18n';
import type { ClothItem } from '../types';

const NONE = '';

function groupBy(items: ClothItem[], key: 'brand' | 'type' | 'color' | 'category') {
  const m = new Map<string, { count: number; cost: number }>();
  for (const it of items) {
    const k = (key === 'category' ? categoryOf(it.type) : it[key].trim()) || NONE;
    const g = m.get(k) ?? { count: 0, cost: 0 };
    g.count++;
    g.cost += it.cost;
    m.set(k, g);
  }
  return [...m.entries()].sort((a, b) => b[1].count - a[1].count);
}

function Breakdown({ title, rows, total, show }: { title: string; rows: [string, { count: number; cost: number }][]; total: number; show: (k: string) => string }) {
  const { count } = useI18n();
  return (
    <Card sx={{ flex: 1, minWidth: 260 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        {rows.map(([k, g]) => (
          <Box key={k} sx={{ mb: 1 }}>
            <Typography variant="body2">
              {show(k)}: {count(g.count)} · ¥{g.cost.toLocaleString()}
            </Typography>
            <LinearProgress variant="determinate" value={(g.count / total) * 100} />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}

export default function Stats({ items }: { items: ClothItem[] }) {
  const { t, typeLabel, categoryLabel, colorLabel } = useI18n();
  if (items.length === 0) return <Typography>{t('stats.empty')}</Typography>;
  const orNone = (f: (k: string) => string) => (k: string) => (k === NONE ? t('common.none') : f(k));
  const total = items.reduce((s, i) => s + i.cost, 0);
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <Card sx={{ flex: 1 }}><CardContent>
          <Typography color="text.secondary">{t('stats.items')}</Typography>
          <Typography variant="h4">{items.length}</Typography>
        </CardContent></Card>
        <Card sx={{ flex: 1 }}><CardContent>
          <Typography color="text.secondary">{t('stats.total')}</Typography>
          <Typography variant="h4">¥{total.toLocaleString()}</Typography>
        </CardContent></Card>
        <Card sx={{ flex: 1 }}><CardContent>
          <Typography color="text.secondary">{t('stats.avg')}</Typography>
          <Typography variant="h4">¥{Math.round(total / items.length).toLocaleString()}</Typography>
        </CardContent></Card>
      </Stack>
      <ColorByCategory items={items} />
      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap" }}>
        <Breakdown title={t('stats.byBrand')} rows={groupBy(items, 'brand')} total={items.length} show={orNone((k) => k)} />
        <Breakdown title={t('stats.byCategory')} rows={groupBy(items, 'category')} total={items.length} show={orNone(categoryLabel)} />
        <Breakdown title={t('stats.byType')} rows={groupBy(items, 'type')} total={items.length} show={orNone(typeLabel)} />
        <Breakdown title={t('stats.byColor')} rows={groupBy(items, 'color')} total={items.length} show={orNone(colorLabel)} />
      </Stack>
    </Stack>
  );
}

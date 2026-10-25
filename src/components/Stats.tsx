import { Box, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';
import { categoryOf } from '../clothTypes';
import type { ClothItem } from '../types';

function groupBy(items: ClothItem[], key: 'brand' | 'type' | 'color' | 'category') {
  const m = new Map<string, { count: number; cost: number }>();
  for (const it of items) {
    const k = (key === 'category' ? categoryOf(it.type) : it[key].trim()) || '(none)';
    const g = m.get(k) ?? { count: 0, cost: 0 };
    g.count++;
    g.cost += it.cost;
    m.set(k, g);
  }
  return [...m.entries()].sort((a, b) => b[1].count - a[1].count);
}

function Breakdown({ title, rows, total }: { title: string; rows: [string, { count: number; cost: number }][]; total: number }) {
  return (
    <Card sx={{ flex: 1, minWidth: 260 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        {rows.map(([k, g]) => (
          <Box key={k} sx={{ mb: 1 }}>
            <Typography variant="body2">
              {k}: {g.count} item{g.count > 1 ? 's' : ''} · ¥{g.cost.toLocaleString()}
            </Typography>
            <LinearProgress variant="determinate" value={(g.count / total) * 100} />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}

export default function Stats({ items }: { items: ClothItem[] }) {
  if (items.length === 0) return <Typography>No data to analyze yet.</Typography>;
  const total = items.reduce((s, i) => s + i.cost, 0);
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <Card sx={{ flex: 1 }}><CardContent>
          <Typography color="text.secondary">Items</Typography>
          <Typography variant="h4">{items.length}</Typography>
        </CardContent></Card>
        <Card sx={{ flex: 1 }}><CardContent>
          <Typography color="text.secondary">Total cost</Typography>
          <Typography variant="h4">¥{total.toLocaleString()}</Typography>
        </CardContent></Card>
        <Card sx={{ flex: 1 }}><CardContent>
          <Typography color="text.secondary">Average cost</Typography>
          <Typography variant="h4">¥{Math.round(total / items.length).toLocaleString()}</Typography>
        </CardContent></Card>
      </Stack>
      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap" }}>
        <Breakdown title="By brand" rows={groupBy(items, 'brand')} total={items.length} />
        <Breakdown title="By category" rows={groupBy(items, 'category')} total={items.length} />
        <Breakdown title="By type" rows={groupBy(items, 'type')} total={items.length} />
        <Breakdown title="By color" rows={groupBy(items, 'color')} total={items.length} />
      </Stack>
    </Stack>
  );
}

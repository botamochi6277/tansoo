import { Box, Card, CardContent, Tooltip, Typography } from '@mui/material';
import { CATEGORIES, categoryOf } from '../clothTypes';
import { COLORS, swatchFor } from '../colors';
import { useI18n } from '../i18n';
import type { ClothItem } from '../types';

const UNSPECIFIED = 'Unspecified';

/** Items per category, split by color. Colors keep the palette order; unknown ones fold into "Unspecified". */
function tally(items: ClothItem[]) {
  const colorKey = (c: string) => (swatchFor(c) ? c : UNSPECIFIED);
  const rows = CATEGORIES.map((cat) => {
    const counts = new Map<string, number>();
    for (const it of items) {
      if (categoryOf(it.type) !== cat.name) continue;
      const k = colorKey(it.color);
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    const total = [...counts.values()].reduce((s, n) => s + n, 0);
    return { category: cat.name, counts, total };
  }).filter((r) => r.total > 0);
  const present = new Set(rows.flatMap((r) => [...r.counts.keys()]));
  const order = [...COLORS.map((c) => c.name), UNSPECIFIED].filter((c) => present.has(c));
  return { rows, order };
}

const fill = (color: string) => swatchFor(color) ?? 'repeating-linear-gradient(45deg, #9e9e9e 0 3px, transparent 3px 6px)';

const BAR_HEIGHT = 22;
const LABEL_SPACE = 12; // % of the track kept free for the value at the bar tip

export default function ColorByCategory({ items }: { items: ClothItem[] }) {
  const { t, count, categoryLabel, colorLabel } = useI18n();
  const colorName = (c: string) => (c === UNSPECIFIED ? t('stats.unspecified') : colorLabel(c));
  const { rows, order } = tally(items);
  const max = Math.max(...rows.map((r) => r.total));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>{t('stats.colorsByCategory')}</Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
          {order.map((c) => (
            <Box key={c} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: 0.5, border: 1, borderColor: 'divider', background: fill(c) }} />
              <Typography variant="caption">{colorName(c)}</Typography>
            </Box>
          ))}
        </Box>

        <Box role="list" sx={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', columnGap: 2, rowGap: 1, alignItems: 'center' }}>
          {rows.map((r) => (
            <Box key={r.category} role="listitem" sx={{ display: 'contents' }}>
              <Typography variant="body2">{categoryLabel(r.category)}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: '2px', width: `${(r.total / max) * (100 - LABEL_SPACE)}%`, minWidth: 8 }}>
                  {order
                    .filter((c) => r.counts.has(c))
                    .map((c, i, present) => {
                      const n = r.counts.get(c)!;
                      const last = i === present.length - 1;
                      return (
                        <Tooltip key={c} arrow title={`${categoryLabel(r.category)} · ${colorName(c)}: ${count(n)}`}>
                          <Box
                            tabIndex={0}
                            role="img"
                            aria-label={`${categoryLabel(r.category)}, ${colorName(c)}: ${count(n)}`}
                            sx={{
                              flex: n,
                              minWidth: 4,
                              height: BAR_HEIGHT,
                              background: fill(c),
                              border: 1,
                              borderColor: 'divider',
                              // 4px rounded data end, square at the baseline
                              borderRadius: last ? '0 4px 4px 0' : 0,
                              '&:focus-visible': { outline: 2, outlineColor: 'primary.main', outlineOffset: 1 },
                            }}
                          />
                        </Tooltip>
                      );
                    })}
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.total}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

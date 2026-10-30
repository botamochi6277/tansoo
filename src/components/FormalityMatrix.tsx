import { useState } from 'react';
import { Box, ButtonBase, Card, CardContent, ToggleButton, ToggleButtonGroup, Tooltip, Typography, useTheme } from '@mui/material';
import { CATEGORIES, categoryOf } from '../clothTypes';
import { effectiveFormality, FORMALITY_LEVELS, formalityKey, signed } from '../formality';
import { useI18n } from '../i18n';
import { effectiveSeasons, SEASONS, seasonKey, type Season } from '../season';
import type { ClothItem } from '../types';

const MIN_SHADE = 0.14; // lightest fill for a cell that has items

/** Heat-map of item counts: categories down, formality across. One hue, light to dark. */
type SeasonChoice = Season | 'all';

export default function FormalityMatrix({ items: allItems, onShowItems }: { items: ClothItem[]; onShowItems: (category: string, formality: number, season: Season | null) => void }) {
  const { t, count, categoryLabel } = useI18n();
  const theme = useTheme();
  const [season, setSeason] = useState<SeasonChoice>('all');

  // only the items worn in the chosen season
  const items = season === 'all' ? allItems : allItems.filter((it) => effectiveSeasons(it).includes(season));

  const counts = new Map<string, number>();
  for (const it of items) {
    const k = `${categoryOf(it.type)}|${effectiveFormality(it)}`;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const rows = CATEGORIES.map((c) => c.name).filter((c) => FORMALITY_LEVELS.some((f) => counts.has(`${c}|${f}`)));
  const max = Math.max(1, ...counts.values());

  const shade = (n: number) => MIN_SHADE + (1 - MIN_SHADE) * (n / max);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>{t('stats.formalityMatrix')}</Typography>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={season}
          onChange={(_, v: SeasonChoice | null) => v && setSeason(v)}
          aria-label={t('col.seasons')}
          sx={{ mb: 2 }}
        >
          <ToggleButton value="all">{t('stats.allSeasons')}</ToggleButton>
          {SEASONS.map((s) => <ToggleButton key={s} value={s}>{t(seasonKey(s))}</ToggleButton>)}
        </ToggleButtonGroup>

        {rows.length === 0 && <Typography color="text.secondary">{t('stats.noItemsSeason')}</Typography>}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `max-content repeat(${FORMALITY_LEVELS.length}, minmax(48px, 1fr))`,
            gap: '2px',
            alignItems: 'stretch',
          }}
        >
          <Box />
          {FORMALITY_LEVELS.map((f) => (
            <Box key={f} sx={{ textAlign: 'center', pb: 0.5 }}>
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>{signed(f)}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                {t(formalityKey(f))}
              </Typography>
            </Box>
          ))}

          {rows.map((cat) => (
            <Box key={cat} sx={{ display: 'contents' }}>
              <Typography variant="body2" sx={{ pr: 2, alignSelf: 'center' }}>{categoryLabel(cat)}</Typography>
              {FORMALITY_LEVELS.map((f) => {
                const n = counts.get(`${cat}|${f}`) ?? 0;
                const label = `${categoryLabel(cat)} · ${signed(f)} ${t(formalityKey(f))}: ${count(n)}`;
                const dark = n > 0 && shade(n) > 0.55; // text flips once the fill is dark enough
                const sx = {
                  minHeight: 40,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // one hue: the theme's primary, mixed into the surface by count
                  bgcolor: n > 0
                    ? `color-mix(in srgb, ${theme.palette.primary.main} ${Math.round(shade(n) * 100)}%, ${theme.palette.background.paper})`
                    : 'action.hover',
                  color: dark ? 'primary.contrastText' : 'text.primary',
                  fontWeight: 600,
                  fontSize: 'inherit',
                  '&:focus-visible': { outline: 2, outlineColor: 'primary.main', outlineOffset: 1 },
                } as const;
                // cells with items are buttons that open the Items tab filtered to them
                return n > 0 ? (
                  <Tooltip key={f} arrow title={`${label} — ${t('stats.showItems')}`}>
                    <ButtonBase
                      aria-label={`${label}. ${t('stats.showItems')}`}
                      onClick={() => onShowItems(cat, f, season === 'all' ? null : season)}
                      sx={{ ...sx, cursor: 'pointer', '&:hover': { outline: 2, outlineColor: 'text.primary', outlineOffset: -2 } }}
                    >
                      {n}
                    </ButtonBase>
                  </Tooltip>
                ) : (
                  <Tooltip key={f} arrow title={label}>
                    <Box tabIndex={0} role="img" aria-label={label} sx={sx} />
                  </Tooltip>
                );
              })}
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <Typography variant="caption" color="text.secondary">1</Typography>
          <Box
            sx={{
              width: 120,
              height: 10,
              borderRadius: 1,
              background: `linear-gradient(to right, color-mix(in srgb, ${theme.palette.primary.main} ${MIN_SHADE * 100}%, ${theme.palette.background.paper}), ${theme.palette.primary.main})`,
            }}
          />
          <Typography variant="caption" color="text.secondary">{max}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

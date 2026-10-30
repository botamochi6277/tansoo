import { Box, Card, CardActions, IconButton, Link, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ItemThumb from './ItemThumb';
import TypeIcon from './TypeIcon';
import { swatchFor } from '../colors';
import { useI18n } from '../i18n';
import { effectiveSeasons } from '../season';
import { useSeasonsLabel } from '../seasonLabel';
import { effectiveFormality, formalityKey, signed } from '../formality';
import type { ClothItem } from '../types';

interface Props {
  items: ClothItem[];
  onEdit: (item: ClothItem) => void;
  onDelete: (item: ClothItem) => void;
}

export default function ItemCards({ items, onEdit, onDelete }: Props) {
  const { t, typeLabel, colorLabel } = useI18n();
  const seasonsLabel = useSeasonsLabel();
  if (items.length === 0) {
    return <Typography align="center">{t('list.empty')}</Typography>;
  }
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 1.5 }}>
      {items.map((it) => (
        <Card key={it.id} variant="outlined" sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <ItemThumb item={it} size="100%" fontSize={56} />
          <Typography variant="subtitle2" noWrap title={it.name}>
            {/^https?:\/\//i.test(it.url) ? (
              <Link href={it.url} target="_blank" rel="noopener noreferrer">{it.name}</Link>
            ) : (
              it.name
            )}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {it.type && <><TypeIcon type={it.type} /> {typeLabel(it.type)}</>}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {swatchFor(it.color) && (
              <Box
                component="span"
                sx={{ display: 'inline-block', width: 10, height: 10, mr: 0.5, verticalAlign: 'middle', borderRadius: '50%', border: 1, borderColor: 'divider', background: swatchFor(it.color) }}
              />
            )}
            {[it.color && colorLabel(it.color), it.size].filter(Boolean).join(' · ')}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {t('col.formality')}: {signed(effectiveFormality(it))} {t(formalityKey(effectiveFormality(it)))} · {seasonsLabel(effectiveSeasons(it))}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {[it.brand, it.purchasedDate].filter(Boolean).join(' · ')}
          </Typography>
          <CardActions disableSpacing sx={{ p: 0, justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>¥{it.cost.toLocaleString()}</Typography>
            <Box>
              <IconButton size="small" aria-label={t('common.edit')} onClick={() => onEdit(it)}><EditIcon fontSize="small" /></IconButton>
              <IconButton size="small" aria-label={t('common.delete')} onClick={() => onDelete(it)}><DeleteIcon fontSize="small" /></IconButton>
            </Box>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
}

import { Box } from '@mui/material';
import TypeIcon from './TypeIcon';
import { inkFor, swatchFor } from '../colors';
import type { ClothItem } from '../types';

interface Props {
  item: ClothItem;
  /** CSS width; the thumbnail is always square */
  size: number | string;
  fontSize: number | string;
}

/** The item's photo, or a placeholder in the item's color showing its type icon. */
export default function ItemThumb({ item, size, fontSize }: Props) {
  const swatch = swatchFor(item.color);
  return (
    <Box
      sx={{
        width: size,
        aspectRatio: '1',
        flexShrink: 0,
        borderRadius: 1,
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        // placeholder takes the item's color; unknown colors keep the neutral look
        ...(swatch ? { background: swatch, color: inkFor(item.color) } : { bgcolor: 'action.hover', color: 'text.primary' }),
      }}
    >
      {item.image ? (
        <Box component="img" src={item.image} alt={item.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <TypeIcon type={item.type} />
      )}
    </Box>
  );
}

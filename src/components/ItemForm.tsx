import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { fileToThumbnail } from '../image';
import { CLOTH_TYPES, typeIcon } from '../clothTypes';
import { COLORS } from '../colors';
import type { ClothItem, NewClothItem } from '../types';

interface Props {
  open: boolean;
  initial: ClothItem | null; // null = new item
  brands: string[];
  onClose: () => void;
  onSubmit: (item: NewClothItem, id?: number) => void;
}

const empty = (): NewClothItem => ({
  name: '',
  purchasedDate: new Date().toISOString().slice(0, 10),
  brand: '',
  type: '',
  color: '',
  cost: 0,
  size: '',
  image: '',
  url: '',
});

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free'];

export default function ItemForm({ open, initial, brands, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<NewClothItem>(empty());

  useEffect(() => {
    if (open) setForm(initial ? { ...initial } : empty());
  }, [open, initial]);

  // keep a previously saved free-text type selectable when editing
  const typeOptions = form.type && !CLOTH_TYPES.includes(form.type) ? [...CLOTH_TYPES, form.type] : CLOTH_TYPES;

  const set = <K extends keyof NewClothItem>(k: K, v: NewClothItem[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const valid = form.name.trim() !== '' && form.purchasedDate !== '' && form.cost >= 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{initial ? 'Edit item' : 'Add item'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Name" value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus required />
          <TextField
            label="Purchased date"
            type="date"
            value={form.purchasedDate}
            onChange={(e) => set('purchasedDate', e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField label="Brand" value={form.brand} onChange={(e) => set('brand', e.target.value)} slotProps={{ htmlInput: { list: 'brands' } }} />
          <datalist id="brands">{brands.map((b) => <option key={b} value={b} />)}</datalist>
          <FormControl>
            <FormLabel>Type</FormLabel>
            <RadioGroup row value={form.type} onChange={(e) => set('type', e.target.value)}>
              {typeOptions.map((t) => (
                <FormControlLabel key={t} value={t} control={<Radio size="small" />} label={`${typeIcon(t)} ${t}`} sx={{ width: '48%', mr: 0 }} />
              ))}
            </RadioGroup>
          </FormControl>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>Color</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {COLORS.map((c) => {
                const selected = form.color === c.name;
                return (
                  <ButtonBase
                    key={c.name}
                    onClick={() => set('color', c.name)}
                    aria-pressed={selected}
                    sx={{ justifyContent: 'flex-start', gap: 1, p: 0.5, borderRadius: 1, border: 2, borderColor: selected ? 'primary.main' : 'transparent' }}
                  >
                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', border: 1, borderColor: 'divider', background: c.swatch, flexShrink: 0 }} />
                    <Typography variant="body2">{c.name}</Typography>
                  </ButtonBase>
                );
              })}
            </Box>
          </Box>
          <TextField
            label="Size (optional)"
            value={form.size}
            onChange={(e) => set('size', e.target.value)}
            placeholder="e.g. M, 30, 26.5"
            slotProps={{ htmlInput: { list: 'sizes' } }}
          />
          <datalist id="sizes">{SIZES.map((z) => <option key={z} value={z} />)}</datalist>
          <TextField
            label="Cost (yen)"
            type="number"
            value={form.cost}
            onChange={(e) => set('cost', Math.max(0, Math.round(Number(e.target.value))))}
          />
          <TextField
            label="URL"
            type="url"
            placeholder="https://"
            value={form.url}
            onChange={(e) => set('url', e.target.value)}
          />
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>Image</Typography>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              {form.image && (
                <Box component="img" src={form.image} alt="" sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }} />
              )}
              <Button component="label" variant="outlined" size="small">
                {form.image ? 'Change' : 'Choose image'}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (!file) return;
                    try {
                      set('image', await fileToThumbnail(file));
                    } catch {
                      window.alert('Could not read that image.');
                    }
                  }}
                />
              </Button>
              {form.image && <Button size="small" onClick={() => set('image', '')}>Remove</Button>}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!valid} onClick={() => onSubmit(form, initial?.id)}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

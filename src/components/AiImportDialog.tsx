import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { buildPrompt, parseAiReply, type ParseResult } from '../aiImport';
import { useI18n } from '../i18n';
import { effectiveSeasons } from '../season';
import { useSeasonsLabel } from '../seasonLabel';
import { effectiveFormality, signed } from '../formality';
import type { NewClothItem } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (items: NewClothItem[]) => void;
}

export default function AiImportDialog({ open, onClose, onAdd }: Props) {
  const { t, lang, count, typeLabel, colorLabel } = useI18n();
  const seasonsLabel = useSeasonsLabel();
  const prompt = useMemo(() => buildPrompt(lang), [lang]);
  const [copied, setCopied] = useState(false);
  const [reply, setReply] = useState('');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState('');

  const close = () => {
    setReply('');
    setResult(null);
    setError('');
    setCopied(false);
    onClose();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
    } catch {
      window.alert(t('ai.copyFail'));
    }
  };

  const parse = () => {
    try {
      setResult(parseAiReply(reply, t));
      setError('');
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : t('ai.readFail'));
    }
  };

  const add = () => {
    if (!result) return;
    onAdd(result.items);
    close();
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="md">
      <DialogTitle>{t('ai.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="subtitle2">{t('ai.step1')}</Typography>
          <TextField multiline minRows={6} maxRows={10} value={prompt} slotProps={{ input: { readOnly: true } }} />
          <Button fullWidth size="large" variant="contained" startIcon={<ContentCopyIcon />} onClick={copy}>
            {copied ? t('ai.copied') : t('ai.copy')}
          </Button>

          <Typography variant="subtitle2">{t('ai.step2')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('ai.step2Body')}
          </Typography>

          <Typography variant="subtitle2">{t('ai.step3')}</Typography>
          <TextField
            multiline
            minRows={5}
            maxRows={10}
            placeholder="[ { &quot;name&quot;: …"
            value={reply}
            onChange={(e) => {
              setReply(e.target.value);
              setResult(null);
              setError('');
            }}
          />
          <Button fullWidth size="large" variant="contained" startIcon={<CheckIcon />} disabled={!reply.trim()} onClick={parse}>
            {t('ai.check')}
          </Button>

          {error && <Alert severity="error">{error}</Alert>}
          {result && (
            <>
              {result.warnings.length > 0 && (
                <Alert severity="warning">
                  {result.warnings.map((w) => <div key={w}>{w}</div>)}
                </Alert>
              )}
              <Typography variant="subtitle2">{t('ai.willAdd', { items: count(result.items.length) })}</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('col.name')}</TableCell>
                    <TableCell>{t('col.purchasedDate')}</TableCell>
                    <TableCell>{t('col.brand')}</TableCell>
                    <TableCell>{t('col.type')}</TableCell>
                    <TableCell>{t('col.color')}</TableCell>
                    <TableCell>{t('col.size')}</TableCell>
                    <TableCell>{t('col.formality')}</TableCell>
                    <TableCell>{t('col.seasons')}</TableCell>
                    <TableCell align="right">{t('col.cost')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.items.map((it, i) => (
                    <TableRow key={i}>
                      <TableCell>{it.name}</TableCell>
                      <TableCell>{it.purchasedDate}</TableCell>
                      <TableCell>{it.brand}</TableCell>
                      <TableCell>{typeLabel(it.type)}</TableCell>
                      <TableCell>{colorLabel(it.color)}</TableCell>
                      <TableCell>{it.size}</TableCell>
                      <TableCell>{signed(effectiveFormality(it))}</TableCell>
                      <TableCell>{seasonsLabel(effectiveSeasons(it))}</TableCell>
                      <TableCell align="right">{it.cost.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1, '& > :not(style) ~ :not(style)': { ml: 0 } }}>
        <Button variant="outlined" size="large" onClick={close} sx={{ flex: 1, py: 1.5 }}>{t('common.cancel')}</Button>
        <Button
          variant="contained"
          size="large"
          disabled={!result || result.items.length === 0}
          onClick={add}
          sx={{ flex: 1, py: 1.5 }}
        >
          {t('ai.add', { n: result ? result.items.length : '' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

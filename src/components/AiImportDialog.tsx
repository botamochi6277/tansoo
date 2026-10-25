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
import type { NewClothItem } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (items: NewClothItem[]) => void;
}

export default function AiImportDialog({ open, onClose, onAdd }: Props) {
  const prompt = useMemo(buildPrompt, []);
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
      window.alert('Could not copy automatically. Select the prompt text and copy it by hand.');
    }
  };

  const parse = () => {
    try {
      setResult(parseAiReply(reply));
      setError('');
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : 'Could not read the pasted text.');
    }
  };

  const add = () => {
    if (!result) return;
    onAdd(result.items);
    close();
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="md">
      <DialogTitle>Add by your AI</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="subtitle2">1. Copy this prompt</Typography>
          <TextField multiline minRows={6} maxRows={10} value={prompt} slotProps={{ input: { readOnly: true } }} />
          <Button fullWidth size="large" variant="contained" startIcon={<ContentCopyIcon />} onClick={copy}>
            {copied ? 'Copied' : 'Copy prompt'}
          </Button>

          <Typography variant="subtitle2">2. Send it to your AI</Typography>
          <Typography variant="body2" color="text.secondary">
            Open your order history page (e.g. UNIQLO) and give it to your AI model (Gemini, GPT, …) together with the prompt.
            It replies with a list of the items you bought.
          </Typography>

          <Typography variant="subtitle2">3. Paste the AI's reply</Typography>
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
            Check
          </Button>

          {error && <Alert severity="error">{error}</Alert>}
          {result && (
            <>
              {result.warnings.length > 0 && (
                <Alert severity="warning">
                  {result.warnings.map((w) => <div key={w}>{w}</div>)}
                </Alert>
              )}
              <Typography variant="subtitle2">{result.items.length} item(s) will be added</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Purchased</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Color</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell align="right">Cost (¥)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.items.map((it, i) => (
                    <TableRow key={i}>
                      <TableCell>{it.name}</TableCell>
                      <TableCell>{it.purchasedDate}</TableCell>
                      <TableCell>{it.brand}</TableCell>
                      <TableCell>{it.type}</TableCell>
                      <TableCell>{it.color}</TableCell>
                      <TableCell>{it.size}</TableCell>
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
        <Button variant="outlined" size="large" onClick={close} sx={{ flex: 1, py: 1.5 }}>Cancel</Button>
        <Button
          variant="contained"
          size="large"
          disabled={!result || result.items.length === 0}
          onClick={add}
          sx={{ flex: 1, py: 1.5 }}
        >
          Add {result ? result.items.length : ''} items
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AppBar, Box, Button, Container, CssBaseline, IconButton, Tab, Tabs, ThemeProvider, Toolbar, Typography,
  createTheme, useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import * as db from './db';
import type { ClothItem, NewClothItem } from './types';
import ItemForm from './components/ItemForm';
import ItemTable from './components/ItemTable';
import Stats from './components/Stats';

const MODE_KEY = 'smart-closet-mode';
type Mode = 'light' | 'dark';

function savedMode(): Mode | null {
  try {
    const v = localStorage.getItem(MODE_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

export default function App() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [userMode, setUserMode] = useState<Mode | null>(savedMode);
  const mode: Mode = userMode ?? (prefersDark ? 'dark' : 'light');
  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const toggleMode = () => {
    const next: Mode = mode === 'dark' ? 'light' : 'dark';
    setUserMode(next);
    try {
      localStorage.setItem(MODE_KEY, next);
    } catch {
      /* storage unavailable */
    }
  };

  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<ClothItem[]>([]);
  const [tab, setTab] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClothItem | null>(null);

  const refresh = useCallback(() => setItems(db.listItems()), []);

  useEffect(() => {
    db.openDb().then(() => {
      refresh();
      setReady(true);
    });
  }, [refresh]);

  const submit = (item: NewClothItem, id?: number) => {
    if (id === undefined) db.addItem(item);
    else db.updateItem({ ...item, id });
    refresh();
    setFormOpen(false);
  };

  const remove = (item: ClothItem) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    db.deleteItem(item.id);
    refresh();
  };

  const exportFile = () => {
    const blob = new Blob([db.exportDb() as BlobPart], { type: 'application/vnd.sqlite3' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `tansoo-${new Date().toISOString().slice(0, 10)}.sqlite`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importFile = async (file: File) => {
    if (!window.confirm('Importing replaces all current items. Continue?')) return;
    try {
      db.importDb(new Uint8Array(await file.arrayBuffer()));
      refresh();
    } catch (e) {
      window.alert(e instanceof Error && e.message.startsWith('This file') ? e.message : 'Could not read that file as a SQLite database.');
    }
  };

  const uniq = (k: 'brand') => [...new Set(items.map((i) => i[k]).filter(Boolean))];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Tansoo</Typography>
          <Button
            color="inherit"
            startIcon={<AddIcon />}
            disabled={!ready}
            onClick={() => { setEditing(null); setFormOpen(true); }}
          >
            Add item
          </Button>
          <Button color="inherit" startIcon={<FileDownloadIcon />} disabled={!ready} onClick={exportFile} sx={{ ml: 1 }}>
            Export
          </Button>
          <Button color="inherit" startIcon={<FileUploadIcon />} disabled={!ready} component="label" sx={{ ml: 1 }}>
            Import
            <input
              hidden
              type="file"
              accept=".sqlite,.db,application/vnd.sqlite3,application/x-sqlite3"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (file) importFile(file);
              }}
            />
          </Button>
          <IconButton color="inherit" aria-label="toggle dark mode" onClick={toggleMode} sx={{ ml: 1 }}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Items" />
          <Tab label="Stats" />
        </Tabs>
        {!ready ? (
          <Box>Loading…</Box>
        ) : tab === 0 ? (
          <ItemTable items={items} onEdit={(i) => { setEditing(i); setFormOpen(true); }} onDelete={remove} />
        ) : (
          <Stats items={items} />
        )}
      </Container>
      <ItemForm
        open={formOpen}
        initial={editing}
        brands={uniq('brand')}
        onClose={() => setFormOpen(false)}
        onSubmit={submit}
      />
    </ThemeProvider>
  );
}

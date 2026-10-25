import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppBar, Box, Button, Chip, Container, CssBaseline, IconButton, Tab, Tabs, ThemeProvider, Toolbar, Typography,
  createTheme, useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import * as db from './db';
import * as fs from './fileStore';
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

  // --- optional link to a .sqlite file via the File System Access API ---
  const fsSupported = fs.isSupported();
  const handleRef = useRef<fs.FileHandle | null>(null);
  const [fileName, setFileName] = useState('');
  // reconnect: remembered file needs a click to re-grant access; error: last write failed
  const [fileStatus, setFileStatus] = useState<'none' | 'linked' | 'reconnect' | 'error'>('none');

  const link = (h: fs.FileHandle) => {
    handleRef.current = h;
    setFileName(h.name);
    setFileStatus('linked');
    fs.rememberHandle(h);
  };

  const unlink = () => {
    db.setPersistListener(null); // stop writing to the old file right away
    handleRef.current = null;
    setFileStatus('none');
    fs.rememberHandle(null);
  };

  const loadFrom = async (h: fs.FileHandle) => {
    db.importDb(await fs.readBytes(h));
    refresh();
    link(h);
  };

  useEffect(() => {
    db.openDb().then(async () => {
      refresh();
      setReady(true);
      if (!fs.isSupported()) return;
      const h = await fs.recallHandle();
      if (!h) return;
      handleRef.current = h;
      setFileName(h.name);
      try {
        if (await fs.hasPermission(h, false)) await loadFrom(h);
        else setFileStatus('reconnect');
      } catch {
        setFileStatus('error');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While linked, mirror every change to the file; writes are queued and coalesced.
  useEffect(() => {
    if (fileStatus !== 'linked') return;
    let pending: Uint8Array | null = null;
    let writing = false;
    const flush = async () => {
      if (writing) return;
      writing = true;
      try {
        while (pending) {
          const bytes = pending;
          pending = null;
          await fs.writeBytes(handleRef.current!, bytes);
        }
      } catch {
        setFileStatus('error');
      } finally {
        writing = false;
      }
    };
    db.setPersistListener((bytes) => {
      pending = bytes;
      flush();
    });
    return () => db.setPersistListener(null);
  }, [fileStatus]);

  const reportError = (e: unknown) =>
    window.alert(e instanceof Error && e.message.startsWith('This file') ? e.message : 'Could not use that file.');

  const openFile = async () => {
    try {
      const h = await fs.pickExisting();
      if (!h) return;
      if (!window.confirm(`Load items from "${h.name}"? This replaces all current items.`)) return;
      unlink();
      if (!(await fs.hasPermission(h, true))) return;
      await loadFrom(h);
    } catch (e) {
      reportError(e);
    }
  };

  const newFile = async () => {
    try {
      const h = await fs.pickNew();
      if (!h) return;
      unlink();
      if (!(await fs.hasPermission(h, true))) return;
      await fs.writeBytes(h, db.exportDb());
      link(h);
    } catch (e) {
      reportError(e);
    }
  };

  const reconnect = async () => {
    const h = handleRef.current;
    if (!h) return;
    try {
      if (!(await fs.hasPermission(h, true))) return;
      if (fileStatus === 'error') {
        // keep what is on screen and push it to the file
        await fs.writeBytes(h, db.exportDb());
        link(h);
      } else {
        if (!window.confirm(`Load items from "${h.name}"? This replaces the items currently shown.`)) return;
        await loadFrom(h);
      }
    } catch (e) {
      reportError(e);
    }
  };

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
          {fsSupported ? (
            <>
              {fileStatus === 'linked' && (
                <Chip color="success" size="small" label={fileName} title="Changes are saved to this file" onDelete={unlink} sx={{ ml: 1 }} />
              )}
              {fileStatus === 'reconnect' && (
                <Chip color="warning" size="small" label={`Reconnect ${fileName}`} onClick={reconnect} sx={{ ml: 1 }} />
              )}
              {fileStatus === 'error' && (
                <Chip color="error" size="small" label={`Save failed: ${fileName}`} onClick={reconnect} sx={{ ml: 1 }} />
              )}
              <Button color="inherit" startIcon={<FolderOpenIcon />} disabled={!ready} onClick={openFile} sx={{ ml: 1 }}>
                Open file
              </Button>
              <Button color="inherit" startIcon={<NoteAddIcon />} disabled={!ready} onClick={newFile} sx={{ ml: 1 }}>
                New file
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
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
          <>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => { setEditing(null); setFormOpen(true); }}
              sx={{ mb: 2 }}
            >
              Add new item
            </Button>
            <ItemTable items={items} onEdit={(i) => { setEditing(i); setFormOpen(true); }} onDelete={remove} />
          </>
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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppBar, Box, Button, Chip, Container, CssBaseline, IconButton, Link, Stack, Tab, Tabs, ThemeProvider, Toolbar, Typography,
  createTheme, useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import GitHubIcon from '@mui/icons-material/GitHub';
import TranslateIcon from '@mui/icons-material/Translate';
import * as db from './db';
import { useI18n } from './i18n';
import * as fs from './fileStore';
import type { ClothItem, NewClothItem } from './types';
import ItemForm from './components/ItemForm';
import AiImportDialog from './components/AiImportDialog';
import ItemList from './components/ItemList';
import { NO_FILTERS, type Filters } from './filter';
import Stats from './components/Stats';

const REPO_URL = 'https://github.com/botamochi6277/tansoo';

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
  const { t, lang, setLang } = useI18n();
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
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
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
    window.alert(e instanceof Error && e.message === db.NOT_TANSOO_DB ? t('err.notDb') : t('err.useFile'));

  const openFile = async () => {
    try {
      const h = await fs.pickExisting();
      if (!h) return;
      if (!window.confirm(t('confirm.load', { name: h.name }))) return;
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
        if (!window.confirm(t('confirm.reload', { name: h.name }))) return;
        await loadFrom(h);
      }
    } catch (e) {
      reportError(e);
    }
  };

  // Run a database change; on failure keep the dialog open and say why instead of failing silently.
  const attempt = (action: () => void): boolean => {
    try {
      action();
      refresh();
      return true;
    } catch (e) {
      console.error(e);
      window.alert(t('err.save', { message: e instanceof Error ? e.message : String(e) }));
      return false;
    }
  };

  const submit = (item: NewClothItem, id?: number) => {
    const saved = attempt(() => (id === undefined ? db.addItem(item) : db.updateItem({ ...item, id })));
    if (saved) setFormOpen(false);
  };

  const addMany = (list: NewClothItem[]) => {
    attempt(() => list.forEach((item) => db.addItem(item)));
  };

  const remove = (item: ClothItem) => {
    if (!window.confirm(t('confirm.delete', { name: item.name }))) return;
    attempt(() => db.deleteItem(item.id));
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
    if (!window.confirm(t('confirm.import'))) return;
    try {
      db.importDb(new Uint8Array(await file.arrayBuffer()));
      refresh();
    } catch (e) {
      window.alert(e instanceof Error && e.message === db.NOT_TANSOO_DB ? t('err.notDb') : t('err.badFile'));
    }
  };

  const uniq = (k: 'brand') => [...new Set(items.map((i) => i[k]).filter(Boolean))];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Box component="img" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" sx={{ height: 34, mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Tansoo</Typography>
          {fsSupported ? (
            <>
              {fileStatus === 'linked' && (
                <Chip color="success" size="small" label={fileName} title={t('file.linkedTitle')} onDelete={unlink} sx={{ ml: 1 }} />
              )}
              {fileStatus === 'reconnect' && (
                <Chip color="warning" size="small" label={t('file.reconnect', { name: fileName })} onClick={reconnect} sx={{ ml: 1 }} />
              )}
              {fileStatus === 'error' && (
                <Chip color="error" size="small" label={t('file.saveFailed', { name: fileName })} onClick={reconnect} sx={{ ml: 1 }} />
              )}
              <Button color="inherit" startIcon={<FolderOpenIcon />} disabled={!ready} onClick={openFile} sx={{ ml: 1 }}>
                {t('btn.openFile')}
              </Button>
              <Button color="inherit" startIcon={<NoteAddIcon />} disabled={!ready} onClick={newFile} sx={{ ml: 1 }}>
                {t('btn.newFile')}
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" startIcon={<FileDownloadIcon />} disabled={!ready} onClick={exportFile} sx={{ ml: 1 }}>
                {t('btn.export')}
              </Button>
              <Button color="inherit" startIcon={<FileUploadIcon />} disabled={!ready} component="label" sx={{ ml: 1 }}>
                {t('btn.import')}
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
          <Button color="inherit" startIcon={<TranslateIcon />} aria-label={t('toggle.lang')} onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')} sx={{ ml: 1 }}>
            {t('lang.other')}
          </Button>
          <IconButton color="inherit" aria-label={t('toggle.dark')} onClick={toggleMode} sx={{ ml: 1 }}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 3, flex: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t('app.about')}</Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label={t('tab.items')} />
          <Tab label={t('tab.stats')} />
        </Tabs>
        {!ready ? (
          <Box>{t('app.loading')}</Box>
        ) : tab === 0 ? (
          <>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => { setEditing(null); setFormOpen(true); }}
              >
                {t('btn.add')}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<AutoAwesomeIcon />}
                onClick={() => setAiOpen(true)}
              >
                {t('btn.ai')}
              </Button>
            </Stack>
            <ItemList items={items} filters={filters} onFiltersChange={setFilters} onEdit={(i) => { setEditing(i); setFormOpen(true); }} onDelete={remove} />
          </>
        ) : (
          <Stats
            items={items}
            onShowItems={(f) => {
              setFilters({ ...NO_FILTERS, ...f });
              setTab(0);
            }}
          />
        )}
      </Container>
      <Box component="footer" sx={{ py: 2, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}>
        <Link
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          color="text.secondary"
          underline="hover"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}
        >
          <GitHubIcon fontSize="small" />
          {t('footer.github')}
        </Link>
      </Box>
      </Box>
      <AiImportDialog open={aiOpen} onClose={() => setAiOpen(false)} onAdd={addMany} />
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

import {
  createContext,
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { loadPdf } from '../lib/pdf';
import { auditHtml, fixPunctuationOutsideQuotes } from '../lib/audit';
import { inTextCitation } from '../lib/apa';
import {
  INITIAL_DRAFT,
  INITIAL_DRAFT_TITLE,
  buildDraftDocument,
} from '../lib/draft';
import { clamp, downloadBlob, slugify, uid } from '../lib/utils';

const WorkspaceContext = createContext(null);

export const SAMPLE_FILES = [
  'sherman-marginalia-reading.pdf',
  'bacon-advancement-annotated.pdf',
  'hollis-reading-practices.pdf',
];

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return context;
}

/** Plain-text lookup across every extracted page of every loaded source. */
export function searchSources(files, query, limit = 60) {
  const needle = String(query || '').trim().toLowerCase();
  if (needle.length < 3) return [];

  const results = [];
  for (const file of files) {
    for (const page of file.pages) {
      const haystack = page.text.toLowerCase();
      let cursor = 0;
      let hitsOnPage = 0;

      while (hitsOnPage < 4) {
        const index = haystack.indexOf(needle, cursor);
        if (index === -1) break;

        const start = Math.max(0, index - 90);
        const end = Math.min(page.text.length, index + needle.length + 120);

        results.push({
          key: `${file.id}-${page.num}-${index}`,
          fileId: file.id,
          fileName: file.name,
          page: page.num,
          before: page.text.slice(start, index),
          match: page.text.slice(index, index + needle.length),
          after: page.text.slice(index + needle.length, end),
        });

        hitsOnPage += 1;
        cursor = index + needle.length;
        if (results.length >= limit) return results;
      }
    }
  }
  return results;
}

export function WorkspaceProvider({ children }) {
  /* ------------------------------- layout ------------------------------- */
  const [layout, setLayout] = useState('writing');

  /* ------------------------------- sources ------------------------------ */
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [secondaryFileId, setSecondaryFileId] = useState(null);
  const [pageMap, setPageMap] = useState({});
  const [busy, setBusy] = useState(null);
  const [libraryOpen, setLibraryOpen] = useState(false);

  /* -------------------------------- draft ------------------------------- */
  const [draftHtml, setDraftHtml] = useState(INITIAL_DRAFT);
  const [draftTitle, setDraftTitle] = useState(INITIAL_DRAFT_TITLE);
  const [draftDirty, setDraftDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const editorRef = useRef(null);

  /* ------------------------------- search ------------------------------- */
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [highlightTerm, setHighlightTerm] = useState('');
  const searchInputRef = useRef(null);
  const deferredQuery = useDeferredValue(searchQuery);
  const searchResults = useMemo(
    () => searchSources(files, deferredQuery),
    [files, deferredQuery],
  );

  /* ------------------------------- locker ------------------------------- */
  const [lockerOpen, setLockerOpen] = useState(false);
  const [snippets, setSnippets] = useState([]);

  /* ------------------------------- overlays ----------------------------- */
  const [auditOpen, setAuditOpen] = useState(false);
  const [bibOpen, setBibOpen] = useState(false);

  /* -------------------------------- toasts ------------------------------ */
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((message, tone = 'default') => {
    const id = uid('toast');
    setToasts((prev) => [...prev.slice(-2), { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3400);
  }, []);

  /* ------------------------------- sources ------------------------------ */
  const addPdfs = useCallback(
    async (fileList) => {
      const incoming = Array.from(fileList || []).filter(
        (file) => file && (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)),
      );

      if (!incoming.length) {
        toast('Only PDF files can be added', 'error');
        return;
      }

      setBusy({
        label: incoming.length === 1 ? incoming[0].name : `${incoming.length} PDFs`,
        detail: 'Opening document…',
        progress: 0.02,
      });

      const added = [];

      for (let index = 0; index < incoming.length; index += 1) {
        const file = incoming[index];
        try {
          const parsed = await loadPdf(file, (pageProgress) => {
            setBusy({
              label: file.name,
              detail: `Extracting text · ${Math.round(pageProgress * 100)}%`,
              progress: (index + pageProgress) / incoming.length,
            });
          });

          added.push({
            id: uid('src'),
            name: file.name.replace(/\.pdf$/i, ''),
            fileName: file.name,
            size: file.size,
            ...parsed,
          });
        } catch (error) {
          console.error('[pdf] failed to load', file.name, error);
          toast(`Could not read ${file.name}`, 'error');
        }
      }

      if (added.length) {
        setFiles((prev) => [...prev, ...added]);
        setActiveFileId((prev) => prev ?? added[0].id);
        setSecondaryFileId((prev) => prev ?? added[1]?.id ?? added[0].id);
        setPageMap((prev) => {
          const next = { ...prev };
          for (const file of added) next[file.id] = next[file.id] ?? 1;
          return next;
        });
        toast(
          added.length === 1
            ? `“${added[0].name}” added`
            : `${added.length} sources added to the library`,
        );
      }

      setBusy(null);
    },
    [toast],
  );

  const loadSamples = useCallback(async () => {
    const already = new Set(files.map((file) => file.fileName));
    const missing = SAMPLE_FILES.filter((name) => !already.has(name));
    if (!missing.length) {
      toast('The sample library is already loaded');
      return;
    }

    try {
      setBusy({ label: 'Sample library', detail: 'Fetching…', progress: 0.04 });
      const loaded = await Promise.all(
        missing.map(async (name) => {
          const response = await fetch(`${import.meta.env.BASE_URL}samples/${name}`);
          if (!response.ok) throw new Error(`Missing sample: ${name}`);
          const blob = await response.blob();
          return new File([blob], name, { type: 'application/pdf' });
        }),
      );
      setBusy(null);
      await addPdfs(loaded);
    } catch (error) {
      console.error(error);
      setBusy(null);
      toast('Sample library unavailable — upload your own PDFs', 'error');
    }
  }, [addPdfs, files, toast]);

  const removeFile = useCallback((fileId) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
    setActiveFileId((prev) => (prev === fileId ? null : prev));
    setSecondaryFileId((prev) => (prev === fileId ? null : prev));
    setPageMap((prev) => {
      const next = { ...prev };
      delete next[fileId];
      return next;
    });
  }, []);

  const updateMeta = useCallback((fileId, patch) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId ? { ...file, meta: { ...file.meta, ...patch } } : file,
      ),
    );
  }, []);

  const setPage = useCallback(
    (fileId, nextPage) => {
      if (!fileId) return;
      const file = files.find((item) => item.id === fileId);
      const max = file?.numPages ?? 1;
      const safe = clamp(Number(nextPage) || 1, 1, max);
      setPageMap((prev) => ({ ...prev, [fileId]: safe }));
    },
    [files],
  );

  const activeFile = files.find((file) => file.id === activeFileId) ?? null;
  const secondaryFile = files.find((file) => file.id === secondaryFileId) ?? null;
  const activePage = activeFileId ? pageMap[activeFileId] || 1 : 1;
  const secondaryPage = secondaryFileId ? pageMap[secondaryFileId] || 1 : 1;

  /* -------------------------------- draft ------------------------------- */
  const updateDraft = useCallback((html) => {
    setDraftHtml(html);
    setDraftDirty(true);
  }, []);

  const saveDraft = useCallback(() => {
    const documentHtml = buildDraftDocument(draftHtml, draftTitle);
    downloadBlob(documentHtml, `${slugify(draftTitle)}.html`, 'text/html');
    setLastSavedAt(new Date());
    setDraftDirty(false);
    toast('Draft packaged and downloaded as HTML');
  }, [draftHtml, draftTitle, toast]);

  const loadDraftFile = useCallback(
    (file) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const raw = String(reader.result || '');
        const parsed = new DOMParser().parseFromString(raw, 'text/html');
        const body = parsed.body ? parsed.body.innerHTML : raw;
        const title = parsed.title?.trim();

        setDraftHtml(body);
        if (title) setDraftTitle(title);
        if (editorRef.current) editorRef.current.innerHTML = body;
        setDraftDirty(true);
        toast('Draft loaded into the editor');
      };
      reader.onerror = () => toast('Could not read that HTML file', 'error');
      reader.readAsText(file);
    },
    [toast],
  );

  const audit = useMemo(() => auditHtml(draftHtml), [draftHtml]);

  const applyPunctuationFix = useCallback(() => {
    const fixed = fixPunctuationOutsideQuotes(draftHtml);
    setDraftHtml(fixed);
    if (editorRef.current) editorRef.current.innerHTML = fixed;
    setDraftDirty(true);
    toast('Punctuation moved inside closing quotation marks');
  }, [draftHtml, toast]);

  /* ------------------------------- snippets ----------------------------- */
  const lockSnippet = useCallback(
    ({ fileId, page, text }) => {
      const file = files.find((item) => item.id === fileId);
      const clean = String(text || '').replace(/\s+/g, ' ').trim();
      if (!file || !clean) return null;

      const duplicate = snippets.some(
        (snippet) =>
          snippet.fileId === fileId && snippet.page === page && snippet.text === clean,
      );
      if (duplicate) {
        toast('That quotation is already in the locker');
        return null;
      }

      const snippet = {
        id: uid('snip'),
        fileId,
        page,
        text: clean,
        fileName: file.name,
        metaSnapshot: { ...file.meta },
        createdAt: new Date().toISOString(),
      };

      setSnippets((prev) => [snippet, ...prev]);
      toast('Quotation locked to the snippet locker');
      return snippet;
    },
    [files, snippets, toast],
  );

  const removeSnippet = useCallback((snippetId) => {
    setSnippets((prev) => prev.filter((snippet) => snippet.id !== snippetId));
  }, []);

  const snippetCitation = useCallback(
    (snippet) => {
      const live = files.find((file) => file.id === snippet.fileId);
      return inTextCitation(live?.meta ?? snippet.metaSnapshot, snippet.page);
    },
    [files],
  );

  /* -------------------------------- search ------------------------------ */
  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus();
    searchInputRef.current?.select();
    setSearchOpen(true);
  }, []);

  const searchFromSelection = useCallback((rawText) => {
    const value = String(rawText || '').replace(/\s+/g, ' ').trim();
    if (value.length < 4 || value.length > 180) return;
    setSearchQuery(value);
    setHighlightTerm(value);
    setSearchOpen(true);
  }, []);

  const openSearchResult = useCallback((result) => {
    setActiveFileId(result.fileId);
    setPageMap((prev) => ({ ...prev, [result.fileId]: result.page }));
    setHighlightTerm(result.match || '');
    setSearchOpen(false);
  }, []);

  /* ------------------------------ shortcuts ----------------------------- */
  useEffect(() => {
    const onKeyDown = (event) => {
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveDraft();
      }
      if (mod && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        focusSearch();
      }
      if (event.key === 'Escape') {
        setAuditOpen(false);
        setBibOpen(false);
        setSearchOpen(false);
        setLockerOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [saveDraft, focusSearch]);

  const value = {
    // layout
    layout,
    setLayout,
    // sources
    files,
    activeFile,
    activeFileId,
    setActiveFileId,
    secondaryFile,
    secondaryFileId,
    setSecondaryFileId,
    activePage,
    secondaryPage,
    pageMap,
    setPage,
    addPdfs,
    loadSamples,
    removeFile,
    updateMeta,
    busy,
    libraryOpen,
    setLibraryOpen,
    // draft
    draftHtml,
    draftTitle,
    setDraftTitle,
    updateDraft,
    saveDraft,
    loadDraftFile,
    draftDirty,
    lastSavedAt,
    editorRef,
    // audit
    audit,
    applyPunctuationFix,
    auditOpen,
    setAuditOpen,
    // locker
    lockerOpen,
    setLockerOpen,
    snippets,
    lockSnippet,
    removeSnippet,
    snippetCitation,
    // search
    searchQuery,
    setSearchQuery,
    searchOpen,
    setSearchOpen,
    searchResults,
    searchInputRef,
    highlightTerm,
    setHighlightTerm,
    focusSearch,
    searchFromSelection,
    openSearchResult,
    // bibliography
    bibOpen,
    setBibOpen,
    // toast
    toasts,
    toast,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

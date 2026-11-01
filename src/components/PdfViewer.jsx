import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { buildTextLayer, startPageRender } from '../lib/pdf';
import { useWorkspace } from '../store/workspace';
import { useMeasure } from '../hooks/useMeasure';
import { clamp, cn } from '../lib/utils';
import { Icon } from './icons';
import { FADE_FAST } from '../lib/motion';

function PageField({ page, total, onPage }) {
  const [value, setValue] = useState(String(page));

  useEffect(() => {
    setValue(String(page));
  }, [page]);

  const commit = () => {
    const parsed = parseInt(value, 10);
    if (Number.isFinite(parsed)) onPage(clamp(parsed, 1, total));
    else setValue(String(page));
  };

  return (
    <input
      value={value}
      inputMode="numeric"
      aria-label="Page number"
      onChange={(event) => setValue(event.target.value.replace(/[^0-9]/g, ''))}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
      }}
      className="w-7 rounded-[3px] bg-ink/[0.055] py-0.5 text-center font-mono text-[10px] tabular-nums text-ink outline-none transition-colors focus:bg-ink/[0.09]"
    />
  );
}

export function PdfViewer({
  file,
  page,
  onPage,
  files = [],
  onSelectFile,
  secondary = false,
  compact = false,
}) {
  const {
    lockSnippet,
    addPdfs,
    loadSamples,
    highlightTerm,
  } = useWorkspace();

  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const renderTaskRef = useRef(null);

  const [stageRef, stage] = useMeasure();
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [status, setStatus] = useState('idle');
  const [zoom, setZoom] = useState(1);
  const [selection, setSelection] = useState('');
  const [pill, setPill] = useState(null);

  /* Reset view state when the source changes. */
  useEffect(() => {
    setZoom(1);
    setSelection('');
    setPill(null);
  }, [file?.id]);

  /* Render the active page: canvas + selectable text layer. */
  useEffect(() => {
    if (!file || !stage.width || !canvasRef.current) return undefined;
    let cancelled = false;
    setStatus('loading');
    setSelection('');
    setPill(null);

    (async () => {
      try {
        const pdfPage = await file.doc.getPage(clamp(page, 1, file.numPages));
        if (cancelled || !canvasRef.current) return;

        const base = pdfPage.getViewport({ scale: 1 });
        const available = Math.max(stage.width - (compact ? 16 : 30), 160);
        const scale = clamp((available / base.width) * zoom, 0.2, 4);

        renderTaskRef.current?.cancel?.();
        const { task, viewport } = startPageRender(pdfPage, canvasRef.current, scale);
        renderTaskRef.current = task;
        setBox({ width: viewport.width, height: viewport.height });

        await task.promise;
        if (cancelled) return;

        const content = await pdfPage.getTextContent();
        if (cancelled || !textLayerRef.current) return;
        buildTextLayer(textLayerRef.current, content, viewport, highlightTerm);
        setStatus('ready');
      } catch (error) {
        if (cancelled || error?.name === 'RenderingCancelledException') return;
        console.error('[pdf] page render failed', error);
        setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [file, page, stage.width, zoom, highlightTerm, compact]);

  const handleLock = useCallback(() => {
    if (!file || !selection) return;
    lockSnippet({ fileId: file.id, page, text: selection });
    window.getSelection()?.removeAllRanges();
    setSelection('');
    setPill(null);
  }, [file, lockSnippet, page, selection]);

  const handleMouseUp = useCallback(() => {
    const active = window.getSelection();
    if (!active || active.isCollapsed || !stageRef.current) return;

    const text = active.toString().replace(/\s+/g, ' ').trim();
    const anchor = active.anchorNode;
    if (!text || text.length < 2 || !anchor || !stageRef.current.contains(anchor)) return;

    setSelection(text);

    try {
      const rect = active.getRangeAt(0).getBoundingClientRect();
      const host = stageRef.current.getBoundingClientRect();
      setPill({
        x: rect.left - host.left + stageRef.current.scrollLeft + rect.width / 2,
        y: rect.top - host.top + stageRef.current.scrollTop - 10,
      });
    } catch {
      setPill(null);
    }
  }, []);

  const handleFiles = (event) => {
    const list = event.target.files;
    if (list?.length) addPdfs(list);
    event.target.value = '';
  };

  const showZoom = !compact;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex h-10 shrink-0 items-center gap-1 border-b border-line/[0.07] bg-sheet px-2">
        {secondary ? (
          <select
            value={file?.id ?? ''}
            onChange={(event) => onSelectFile?.(event.target.value)}
            aria-label="Second source"
            className="h-7 min-w-0 flex-1 truncate rounded-[4px] border-0 bg-transparent px-1 text-[11.5px] font-medium text-ink outline-none transition-colors hover:bg-ink/[0.04] focus:bg-ink/[0.06]"
          >
            <option value="">Choose a second source…</option>
            {files.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-1.5 px-1">
            <Icon name="file" size={12} className="shrink-0 text-ink-3" />
            <span className="truncate text-[11.5px] font-medium text-ink">
              {file ? file.name : 'Reference'}
            </span>
            {file && (
              <span className="hidden shrink-0 font-mono text-[9.5px] text-ink-3 sm:inline">
                {file.numPages} pp
              </span>
            )}
          </div>
        )}

        {file && (
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              className="btn-icon h-6 w-6"
              onClick={() => onPage(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              <Icon name="chevron-left" size={12} />
            </button>

            <div className="flex items-center gap-1 font-mono text-[10px] text-ink-3">
              <PageField page={page} total={file.numPages} onPage={onPage} />
              <span className="tabular-nums">/ {file.numPages}</span>
            </div>

            <button
              type="button"
              className="btn-icon h-6 w-6"
              onClick={() => onPage(page + 1)}
              disabled={page >= file.numPages}
              aria-label="Next page"
            >
              <Icon name="chevron-right" size={12} />
            </button>

            {showZoom && (
              <>
                <span className="mx-1 h-3.5 w-px bg-line/10" />
                <button
                  type="button"
                  className="btn-icon h-6 w-6"
                  onClick={() => setZoom((value) => clamp(value - 0.15, 0.5, 2.5))}
                  aria-label="Zoom out"
                >
                  <Icon name="zoom-out" size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="w-9 rounded-[3px] py-0.5 font-mono text-[9.5px] tabular-nums text-ink-3 transition-colors hover:bg-ink/[0.05] hover:text-ink"
                  title="Fit to width"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  className="btn-icon h-6 w-6"
                  onClick={() => setZoom((value) => clamp(value + 0.15, 0.5, 2.5))}
                  aria-label="Zoom in"
                >
                  <Icon name="zoom-in" size={12} />
                </button>
              </>
            )}

            <span className="mx-1 h-3.5 w-px bg-line/10" />

            <button
              type="button"
              onClick={handleLock}
              disabled={!selection}
              title={
                selection
                  ? 'Lock the highlighted passage to the snippet locker'
                  : 'Highlight text in the page, then lock it'
              }
              className={cn(
                'flex h-7 items-center gap-1.5 rounded-[4px] px-2 text-[10.5px] font-medium transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97]',
                selection
                  ? 'bg-accent text-white hover:bg-accent/90'
                  : 'bg-ink/[0.045] text-ink-3',
              )}
            >
              <Icon name="lock" size={11} />
              {!compact && <span>Lock</span>}
            </button>
          </div>
        )}
      </div>

      {/* Stage */}
      <div
        ref={stageRef}
        className={cn('pdf-stage', compact && 'p-2')}
        onMouseUp={handleMouseUp}
      >
        {file ? (
          <>
            <div
              className="pdf-page"
              style={{ width: box.width || undefined, height: box.height || undefined }}
            >
              <canvas ref={canvasRef} className="block" />
              <div ref={textLayerRef} className="textLayer" />
            </div>

            <AnimatePresence>
              {status === 'loading' && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={FADE_FAST}
                  className="pointer-events-none absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-2 rounded-full bg-sheet/95 px-2.5 py-1 text-[10px] font-medium text-ink-3 shadow-[0_1px_3px_rgba(24,21,17,0.14)]"
                >
                  <span className="h-1 w-1 rounded-full bg-accent" />
                  Rendering page
                </motion.div>
              )}
            </AnimatePresence>

            {status === 'error' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-lg bg-sheet px-4 py-3 text-center shadow-pop">
                  <p className="text-[12px] font-medium text-ink">Page could not be rendered</p>
                  <p className="mt-1 font-mono text-[10px] text-ink-3">Try another page or source.</p>
                </div>
              </div>
            )}

            <AnimatePresence>
              {pill && selection && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 2, scale: 0.98 }}
                  transition={FADE_FAST}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handleLock}
                  style={{ left: pill.x, top: pill.y }}
                  className="absolute z-20 flex -translate-x-1/2 -translate-y-full items-center gap-1.5 whitespace-nowrap rounded-[5px] bg-ink px-2.5 py-1.5 text-[10.5px] font-medium text-sheet shadow-lift active:scale-[0.98]"
                >
                  <Icon name="lock" size={11} />
                  Lock snippet
                </motion.button>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center p-6">
            <div className="max-w-[330px] text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-sheet shadow-[0_0_0_1px_rgba(24,21,17,0.07),0_6px_16px_-10px_rgba(24,21,17,0.4)]">
                <Icon name="book" size={20} className="text-ink-3" />
              </div>
              <h3 className="mt-4 font-serif text-[19px] leading-tight text-ink">
                {files.length ? 'Choose a source' : 'No sources on the desk'}
              </h3>
              <p className="mx-auto mt-1.5 max-w-[30ch] text-[12px] leading-relaxed text-ink-3">
                {files.length
                  ? 'Select a PDF from the library, or add another file to the stack.'
                  : 'Drop PDFs anywhere in this pane. Text is extracted locally — nothing leaves your machine.'}
              </p>

              {!files.length && (
                <>
                  <div
                    className={cn(
                      'mt-5 flex flex-col items-stretch justify-center gap-2',
                      !compact && 'sm:flex-row',
                    )}
                  >
                    <label className="btn-solid h-8 cursor-pointer px-3">
                      <Icon name="upload" size={13} />
                      Choose PDFs
                      <input
                        type="file"
                        multiple
                        accept="application/pdf,.pdf"
                        className="sr-only"
                        onChange={handleFiles}
                      />
                    </label>
                    <button type="button" className="btn-outline h-8 px-3" onClick={loadSamples}>
                      <Icon name="library" size={13} />
                      Sample library
                    </button>
                  </div>
                  <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3/60">
                    pdf.js · in-browser extraction
                  </p>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useWorkspace } from '../store/workspace';
import { useMeasure } from '../hooks/useMeasure';
import { SearchBar } from './SearchBar';
import { PdfSidebar } from './PdfSidebar';
import { PdfViewer } from './PdfViewer';
import { Icon } from './icons';
import { SPRING_SHEET } from '../lib/motion';

export function ReferencePane() {
  const {
    files,
    activeFile,
    activePage,
    secondaryFile,
    secondaryPage,
    setSecondaryFileId,
    setPage,
    layout,
    libraryOpen,
    setLibraryOpen,
    busy,
    addPdfs,
  } = useWorkspace();

  const [measureRef, size] = useMeasure();
  const compact = size.width > 0 && size.width < 660;
  const [dragOver, setDragOver] = useState(false);

  /* The inline library needs room; below that it becomes a drawer. */
  useEffect(() => {
    setLibraryOpen(!compact);
  }, [compact, setLibraryOpen]);

  return (
    <section
      ref={measureRef}
      className="pane"
      onDragOver={(event) => {
        if (event.dataTransfer?.types?.includes('Files')) {
          event.preventDefault();
          setDragOver(true);
        }
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setDragOver(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        if (event.dataTransfer?.files?.length) addPdfs(event.dataTransfer.files);
      }}
    >
      <SearchBar compact={compact} />

      <div className="relative flex min-h-0 flex-1">
        {!compact && libraryOpen && <PdfSidebar />}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {layout === 'reading' ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex min-h-0 flex-1 flex-col border-b border-line/[0.08]">
                <PdfViewer
                  file={activeFile}
                  page={activePage}
                  files={files}
                  onPage={(next) => setPage(activeFile?.id, next)}
                  compact={compact}
                />
              </div>
              <div className="flex min-h-0 flex-1 flex-col">
                <PdfViewer
                  file={secondaryFile}
                  page={secondaryPage}
                  files={files}
                  onPage={(next) => setPage(secondaryFile?.id, next)}
                  onSelectFile={(fileId) => setSecondaryFileId(fileId || null)}
                  secondary
                  compact={compact}
                />
              </div>
            </div>
          ) : (
            <PdfViewer
              file={activeFile}
              page={activePage}
              files={files}
              onPage={(next) => setPage(activeFile?.id, next)}
              compact={compact}
            />
          )}
        </div>

        <AnimatePresence>
          {compact && libraryOpen && (
            <>
              <motion.div
                key="library-scrim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => setLibraryOpen(false)}
                className="absolute inset-0 z-30 bg-ink/20"
              />
              <motion.div
                key="library-drawer"
                initial={{ x: '-102%' }}
                animate={{ x: 0 }}
                exit={{ x: '-102%' }}
                transition={SPRING_SHEET}
                className="absolute inset-y-0 left-0 z-40 w-[272px] overflow-hidden rounded-r-lg shadow-lift"
              >
                <PdfSidebar compact />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {busy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-sheet/70 backdrop-blur-[2px]"
          >
            <div className="w-[272px] rounded-lg bg-sheet p-4 shadow-pop">
              <p className="micro text-accent">Indexing source</p>
              <p className="mt-2 truncate text-[12.5px] font-medium text-ink">{busy.label}</p>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-ink/10">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-200 ease-out"
                  style={{ width: `${Math.max(4, Math.round((busy.progress || 0) * 100))}%` }}
                />
              </div>
              <p className="mt-2 truncate font-mono text-[9.5px] text-ink-3">{busy.detail}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {dragOver && (
        <div className="pointer-events-none absolute inset-2 z-[55] flex items-center justify-center rounded-lg border border-dashed border-accent/50 bg-sheet/75">
          <div className="text-center">
            <Icon name="upload" size={20} className="mx-auto text-accent" />
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
              Drop PDFs to add sources
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

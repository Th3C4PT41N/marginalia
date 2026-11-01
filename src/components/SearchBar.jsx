import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useWorkspace } from '../store/workspace';
import { cn } from '../lib/utils';
import { Icon } from './icons';
import { FADE_FAST, popIn } from '../lib/motion';

export function SearchBar({ compact = false }) {
  const {
    searchQuery,
    setSearchQuery,
    searchOpen,
    setSearchOpen,
    searchResults,
    searchInputRef,
    openSearchResult,
    files,
    libraryOpen,
    setLibraryOpen,
    highlightTerm,
  } = useWorkspace();

  const wrapRef = useRef(null);
  const query = searchQuery.trim();
  const active = query.length >= 3;
  const sourceCount = new Set(searchResults.map((result) => result.fileId)).size;
  const indexedPages = files.reduce((total, file) => total + file.numPages, 0);

  useEffect(() => {
    if (!searchOpen) return undefined;
    const onPointerDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [searchOpen, setSearchOpen]);

  return (
    <div className="relative z-30 shrink-0 border-b border-line/[0.07] px-2.5 py-2">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setLibraryOpen(!libraryOpen)}
          aria-label="Toggle source library"
          aria-expanded={libraryOpen}
          className={cn(
            'btn-icon h-8 w-8 shrink-0',
            libraryOpen && 'bg-ink/[0.06] text-ink',
          )}
          title="Source library"
        >
          <Icon name="library" size={15} />
        </button>

        <div className="relative min-w-0 flex-1" ref={wrapRef}>
          <Icon
            name="search"
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3"
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && searchResults[0]) openSearchResult(searchResults[0]);
              if (event.key === 'Escape') setSearchOpen(false);
            }}
            placeholder={compact ? 'Search all sources…' : 'Cross-document quote lookup…'}
            aria-label="Search quotations across all loaded PDFs"
            className="h-8 w-full rounded-md border-0 bg-sheet pl-8 pr-14 text-[12.5px] text-ink shadow-[inset_0_0_0_1px_rgba(24,21,17,0.13)] outline-none transition-shadow duration-150 placeholder:text-ink-3/70 focus:shadow-[inset_0_0_0_1.5px_rgba(173,56,41,0.5)]"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              className="absolute right-1.5 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-[3px] text-ink-3 transition-colors hover:bg-ink/[0.06] hover:text-ink"
              aria-label="Clear search"
            >
              <Icon name="x" size={11} />
            </button>
          ) : (
            <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 sm:block">
              <span className="kbd">⌘K</span>
            </span>
          )}

          <AnimatePresence>
            {searchOpen && active && (
              <motion.div
                key="results"
                initial={popIn.initial}
                animate={popIn.animate}
                exit={popIn.exit}
                transition={FADE_FAST}
                className="absolute inset-x-0 top-[calc(100%+7px)] z-40 overflow-hidden rounded-lg bg-sheet shadow-pop"
              >
                <div className="flex items-center justify-between gap-2 border-b border-line/[0.07] px-3 py-2">
                  <span className="micro truncate">
                    {searchResults.length} match{searchResults.length === 1 ? '' : 'es'} ·{' '}
                    {sourceCount} source{sourceCount === 1 ? '' : 's'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3 transition-colors hover:text-ink"
                  >
                    Esc
                  </button>
                </div>

                <div className="max-h-[min(54vh,440px)] overflow-y-auto">
                  {searchResults.length === 0 && (
                    <div className="px-4 py-7 text-center">
                      <Icon name="scan-search" size={18} className="mx-auto text-ink-3/50" />
                      <p className="mt-2 text-[12px] font-medium text-ink">No matches</p>
                      <p className="mx-auto mt-1 max-w-[34ch] text-[11px] leading-relaxed text-ink-3">
                        Nothing in {indexedPages.toLocaleString()} indexed pages matches
                        “{query}”. Try a shorter phrase or a distinctive noun.
                      </p>
                    </div>
                  )}

                  {searchResults.map((result) => (
                    <button
                      key={result.key}
                      type="button"
                      onClick={() => openSearchResult(result)}
                      className="group flex w-full items-start gap-2.5 border-b border-line/[0.05] px-3 py-2.5 text-left transition-colors duration-100 last:border-0 hover:bg-ink/[0.035]"
                    >
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[3px] bg-ink/[0.05] text-ink-3 transition-colors group-hover:bg-accent/10 group-hover:text-accent">
                        <Icon name="file" size={11} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className="truncate text-[11px] font-medium leading-none text-ink">
                            {result.fileName}
                          </span>
                          <span className="ml-auto shrink-0 font-mono text-[9px] leading-none text-ink-3">
                            p. {result.page}
                          </span>
                        </span>
                        <span className="mt-1.5 block text-[11.5px] leading-[1.6] text-ink-2">
                          <span className="text-ink-3/60">…</span>
                          {result.before}
                          <mark
                            className={cn(
                              'rounded-[2px] px-0.5 text-ink',
                              highlightTerm ? 'bg-accent/[0.14]' : 'bg-gold/20',
                            )}
                          >
                            {result.match}
                          </mark>
                          {result.after}
                          <span className="text-ink-3/60">…</span>
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                {searchResults.length > 0 && (
                  <div className="flex items-center justify-between border-t border-line/[0.07] bg-sheet-2/60 px-3 py-1.5">
                    <span className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-ink-3/80">
                      Select a result to open that page
                    </span>
                    <span className="font-mono text-[8.5px] text-ink-3/80">
                      {indexedPages} pp indexed
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

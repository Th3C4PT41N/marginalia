import { forwardRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useWorkspace } from '../store/workspace';
import { cn, formatTime } from '../lib/utils';
import { Icon } from './icons';
import { EASE_OUT, FADE_FAST, SPRING_SHEET } from '../lib/motion';

function CopyButton({ value, label = 'Copy citation' }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="grid h-5 w-5 shrink-0 place-items-center rounded-[3px] text-ink-3 transition-colors duration-150 hover:bg-ink/[0.07] hover:text-ink"
      aria-label={label}
      title={label}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="copied"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.12 }}
            className="text-teal"
          >
            <Icon name="check" size={12} strokeWidth={2.2} />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.12 }}
          >
            <Icon name="copy" size={11} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

const SnippetCard = forwardRef(function SnippetCard({ snippet, index, citation }, ref) {
  const { removeSnippet } = useWorkspace();

  return (
    <motion.article
      ref={ref}
      layout="position"
      initial={{ opacity: 0, y: 10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.14 } }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      className="locker-card snap-start"
    >
      <div className="flex items-center justify-between px-3 pt-2.5">
        <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-3">
          {String(index + 1).padStart(2, '0')} · {formatTime(new Date(snippet.createdAt))}
        </span>
        <button
          type="button"
          onClick={() => removeSnippet(snippet.id)}
          className="grid h-5 w-5 place-items-center rounded-[3px] text-ink-3 transition-colors hover:bg-accent/10 hover:text-accent"
          aria-label="Remove snippet"
          title="Remove from locker"
        >
          <Icon name="trash" size={11} />
        </button>
      </div>

      <div className="mt-1 flex min-h-0 flex-1 flex-col px-3">
        <blockquote className="min-h-0 flex-1 overflow-y-auto border-l-2 border-accent/25 pl-2.5 font-serif text-[12.5px] leading-[1.62] text-ink/85">
          {snippet.text}
        </blockquote>
      </div>

      <div className="mt-2 border-t border-line/[0.06] px-3 py-2.5">
        <div className="flex items-center gap-1.5 text-ink-3">
          <Icon name="file" size={10} className="shrink-0" />
          <span className="truncate font-mono text-[8.5px]">{snippet.fileName}</span>
          <span className="ml-auto shrink-0 font-mono text-[8.5px]">p. {snippet.page}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 rounded-[4px] bg-sheet-2 px-2 py-1.5">
          <span
            className="min-w-0 flex-1 truncate font-mono text-[9.5px] text-ink-2"
            title={citation}
          >
            {citation}
          </span>
          <CopyButton value={citation} />
        </div>
      </div>
    </motion.article>
  );
});

export function SnippetLocker() {
  const {
    lockerOpen,
    setLockerOpen,
    snippets,
    snippetCitation,
    setBibOpen,
    files,
    setLibraryOpen,
  } = useWorkspace();

  return (
    <AnimatePresence>
      {lockerOpen && (
        <>
          <motion.div
            key="locker-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setLockerOpen(false)}
            className="fixed inset-0 z-[45] bg-ink/25"
          />

          <motion.aside
            key="locker"
            role="dialog"
            aria-label="Snippet locker"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={SPRING_SHEET}
            className="fixed inset-x-0 bottom-0 z-50 flex h-[48vh] min-h-[330px] max-h-[540px] flex-col overflow-hidden rounded-t-2xl bg-paper shadow-[0_-1px_0_rgba(24,21,17,0.08),0_-28px_70px_-30px_rgba(24,21,17,0.5)]"
          >
            <div className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-ink/15" />

            <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2.5 pt-2 sm:px-6">
              <div className="flex min-w-0 items-baseline gap-2.5">
                <h2 className="font-serif text-[20px] leading-none tracking-[-0.01em] text-ink">
                  Snippet Locker
                </h2>
                <span className="chip">{snippets.length} locked</span>
                <span className="hidden font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3 lg:inline">
                  APA citations attached
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setBibOpen(true)}
                  className="btn-outline h-8"
                  title="Build an APA reference list from source metadata"
                >
                  <Icon name="library" size={13} />
                  <span className="hidden sm:inline">Export APA Bibliography</span>
                  <span className="sm:hidden">Bibliography</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLockerOpen(false)}
                  className="btn-icon h-8 w-8"
                  aria-label="Close snippet locker"
                >
                  <Icon name="x" size={15} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden px-4 pb-4 sm:px-6">
              {snippets.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center pb-2 text-center">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-sheet shadow-[0_0_0_1px_rgba(24,21,17,0.07),0_8px_20px_-14px_rgba(24,21,17,0.45)]">
                    <Icon name="quote" size={18} className="text-ink-3" />
                  </div>
                  <p className="mt-3 font-serif text-[17px] text-ink">Nothing locked yet</p>
                  <p className="mt-1 max-w-[42ch] text-[11.5px] leading-relaxed text-ink-3">
                    Highlight a passage in any PDF and choose{' '}
                    <span className="font-medium text-ink-2">Lock snippet</span>. The source,
                    page, and APA citation are captured automatically.
                  </p>
                  <button
                    type="button"
                    onClick={() => setLockerOpen(false)}
                    className="btn-outline mt-4 h-8"
                  >
                    <Icon name="book" size={12} />
                    {files.length ? 'Back to the sources' : 'Add a source first'}
                  </button>
                </div>
              ) : (
                <div className="flex h-full snap-x snap-mandatory gap-3 pb-1">
                  <AnimatePresence initial={false} mode="popLayout">
                    {snippets.map((snippet, index) => (
                      <SnippetCard
                        key={snippet.id}
                        snippet={snippet}
                        index={index}
                        citation={snippetCitation(snippet)}
                      />
                    ))}
                  </AnimatePresence>

                  <button
                    type="button"
                    onClick={() => {
                      setLockerOpen(false);
                      setLibraryOpen(true);
                    }}
                    className="flex h-full w-[132px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line/15 text-ink-3 transition-colors duration-150 hover:border-accent/40 hover:text-accent"
                  >
                    <Icon name="plus" size={16} />
                    <span className="px-3 text-center font-mono text-[9px] uppercase leading-relaxed tracking-[0.1em]">
                      Lock another passage
                    </span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-line/[0.07] bg-sheet/50 px-4 py-2 sm:px-6">
              <span className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-ink-3">
                Scroll horizontally · citations update as you edit metadata
              </span>
              <span className="hidden font-mono text-[8.5px] uppercase tracking-[0.12em] text-ink-3 sm:inline">
                {snippets.length} of ∞
              </span>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

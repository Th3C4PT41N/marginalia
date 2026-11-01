import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useWorkspace } from '../store/workspace';
import { buildBibliographyDocument, buildReferenceList } from '../lib/apa';
import { downloadBlob } from '../lib/utils';
import { Icon } from './icons';
import { EASE_OUT } from '../lib/motion';

export function BibliographyModal() {
  const {
    bibOpen,
    setBibOpen,
    files,
    toast,
    setLibraryOpen,
    setLockerOpen,
  } = useWorkspace();

  const entries = useMemo(() => buildReferenceList(files), [files]);
  const incomplete = entries.filter((entry) => !entry.complete).length;

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(entries.map((entry) => entry.html).join('\n'));
      toast('Reference list HTML copied to clipboard');
    } catch {
      toast('Clipboard unavailable in this browser', 'error');
    }
  };

  const download = () => {
    downloadBlob(buildBibliographyDocument(files), 'apa-references.html', 'text/html');
    toast('APA bibliography downloaded as HTML');
  };

  return (
    <AnimatePresence>
      {bibOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setBibOpen(false)}
            className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="APA bibliography"
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.99 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="relative flex max-h-[86vh] w-full max-w-[42rem] flex-col overflow-hidden rounded-xl bg-sheet shadow-pop"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line/[0.08] px-5 pb-4 pt-5 sm:px-7">
              <div className="min-w-0">
                <p className="micro text-accent">Reference list</p>
                <h2 className="mt-1.5 font-serif text-[26px] leading-none tracking-[-0.015em] text-ink">
                  APA Bibliography
                </h2>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
                  {entries.length} entr{entries.length === 1 ? 'y' : 'ies'} · APA 7th ed. ·
                  alphabetical by author
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBibOpen(false)}
                className="btn-icon -mr-1.5 -mt-1"
                aria-label="Close bibliography"
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
              {entries.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-sheet-2 shadow-[inset_0_0_0_1px_rgba(24,21,17,0.06)]">
                    <Icon name="library" size={18} className="text-ink-3" />
                  </div>
                  <p className="mt-3 font-serif text-[18px] text-ink">No sources to cite</p>
                  <p className="mx-auto mt-1 max-w-[38ch] text-[12px] leading-relaxed text-ink-3">
                    Add PDFs and fill in their author, year, title and publisher. The
                    bibliography builds itself from those fields.
                  </p>
                  <button
                    type="button"
                    className="btn-solid mt-4 h-8"
                    onClick={() => {
                      setBibOpen(false);
                      setLockerOpen(false);
                      setLibraryOpen(true);
                    }}
                  >
                    <Icon name="plus" size={13} />
                    Add sources
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="bib-list text-ink/90"
                    dangerouslySetInnerHTML={{
                      __html: entries.map((entry) => entry.html).join('\n'),
                    }}
                  />

                  {incomplete > 0 && (
                    <div className="mt-6 flex items-start gap-2.5 rounded-md bg-gold/[0.08] px-3 py-2.5 shadow-[inset_0_0_0_1px_rgba(163,124,55,0.22)]">
                      <Icon name="alert" size={14} className="mt-px shrink-0 text-gold" />
                      <div className="min-w-0">
                        <p className="text-[11.5px] font-medium text-ink">
                          {incomplete} entr{incomplete === 1 ? 'y is' : 'ies are'} missing
                          metadata
                        </p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-ink-2">
                          Author, year, or title is blank. Open a source in the library and
                          use the metadata editor to complete it.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-line/[0.08] bg-sheet-2/50 px-5 py-3 sm:px-7">
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
                Sorted automatically · updates live
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={copyHtml}
                  className="btn-outline h-8"
                  disabled={entries.length === 0}
                >
                  <Icon name="copy" size={12} />
                  Copy HTML
                </button>
                <button
                  type="button"
                  onClick={download}
                  className="btn-solid h-8"
                  disabled={entries.length === 0}
                >
                  <Icon name="download" size={13} />
                  Download .html
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

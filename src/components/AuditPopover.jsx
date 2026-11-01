import { AnimatePresence, motion } from 'framer-motion';
import { useWorkspace } from '../store/workspace';
import { cn } from '../lib/utils';
import { Icon } from './icons';
import { FADE_FAST, popIn } from '../lib/motion';

const STATUS = {
  warn: { dot: 'bg-accent', text: 'text-accent', label: 'Fix' },
  info: { dot: 'bg-gold', text: 'text-gold', label: 'Watch' },
  pass: { dot: 'bg-teal', text: 'text-teal', label: 'Pass' },
};

export function AuditPopover() {
  const {
    audit,
    auditOpen,
    setAuditOpen,
    applyPunctuationFix,
    draftTitle,
  } = useWorkspace();

  return (
    <AnimatePresence>
      {auditOpen && (
        <motion.div
          key="audit"
          role="dialog"
          aria-label="Document consistency audit"
          initial={popIn.initial}
          animate={popIn.animate}
          exit={popIn.exit}
          transition={FADE_FAST}
          className="absolute right-0 top-[calc(100%+10px)] z-50 flex max-h-[min(78vh,660px)] w-[min(92vw,404px)] flex-col overflow-hidden rounded-lg bg-sheet text-ink shadow-pop"
        >
          <div className="flex items-start justify-between gap-3 border-b border-line/[0.07] px-4 pb-3 pt-4">
            <div className="min-w-0">
              <p className="micro text-accent">Consistency audit</p>
              <h3 className="mt-1.5 font-serif text-[19px] leading-tight tracking-[-0.01em]">
                Structural & stylistic check
              </h3>
              <p className="mt-1 truncate font-mono text-[10.5px] text-ink-3">
                {audit.words.toLocaleString()} words · {audit.flaggedCount} flag
                {audit.flaggedCount === 1 ? '' : 's'} · {draftTitle}
              </p>
            </div>
            <button
              type="button"
              className="btn-icon -mr-1 -mt-1"
              onClick={() => setAuditOpen(false)}
              aria-label="Close audit"
            >
              <Icon name="x" size={14} />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-3.5">
            {audit.checks.map((check) => {
              const status = STATUS[check.status] ?? STATUS.pass;
              return (
                <section
                  key={check.id}
                  className="rounded-md bg-sheet-2/70 p-3 shadow-[inset_0_0_0_1px_rgba(24,21,17,0.045)]"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', status.dot)} />
                    <h4 className="text-[12.5px] font-medium leading-none text-ink">
                      {check.label}
                    </h4>
                    <span
                      className={cn(
                        'ml-auto font-mono text-[10px] tabular-nums',
                        check.count ? 'text-ink-2' : 'text-ink-3/50',
                      )}
                    >
                      {check.count || '—'}
                    </span>
                  </div>

                  <p className="mt-2 text-[11.5px] leading-[1.55] text-ink-2">{check.detail}</p>

                  {check.rows && (
                    <div className="mt-2.5 space-y-1">
                      {check.rows.map((row) => (
                        <div key={row.label} className="flex items-center gap-2">
                          <span className="text-[11px] text-ink-2">{row.label}</span>
                          <span className="h-px flex-1 bg-line/10" />
                          <span
                            className={cn(
                              'font-mono text-[10px] tabular-nums',
                              row.count > 1 ? 'text-accent' : 'text-ink-3',
                            )}
                          >
                            {row.count}×
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {check.samples.length > 0 && (
                    <div className="mt-2.5 space-y-1">
                      {check.samples.map((sample, index) => (
                        <p
                          key={`${check.id}-${index}`}
                          className="rounded-[3px] bg-sheet px-2 py-1.5 font-mono text-[10px] leading-[1.55] text-ink-3 shadow-[inset_0_0_0_1px_rgba(24,21,17,0.055)]"
                        >
                          {sample.text}
                        </p>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          <div className="border-t border-line/[0.07] bg-sheet-2/50 px-4 py-3">
            {audit.checks.find((check) => check.fixable) ? (
              <button
                type="button"
                className="btn-solid h-8 w-full"
                onClick={applyPunctuationFix}
              >
                <Icon name="check" size={13} />
                Move punctuation inside quotation marks
              </button>
            ) : (
              <p className="flex items-center gap-2 text-[11px] text-ink-3">
                <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                No automatic fixes available — the draft is clean.
              </p>
            )}
            <p className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-3/70">
              Audit re-runs on every keystroke
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LAYOUTS, LAYOUT_ORDER } from '../lib/layouts';
import { useWorkspace } from '../store/workspace';
import { cn } from '../lib/utils';
import { Icon } from './icons';
import { AuditPopover } from './AuditPopover';
import { SPRING_LAYOUT } from '../lib/motion';

function LayoutSwitcher() {
  const { layout, setLayout } = useWorkspace();

  return (
    <div
      className="flex items-center gap-0.5 rounded-lg bg-white/[0.055] p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
      role="group"
      aria-label="Workspace layout"
    >
      {LAYOUT_ORDER.map((id) => {
        const config = LAYOUTS[id];
        const active = layout === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setLayout(id)}
            aria-pressed={active}
            title={`${config.full} — ${config.description}`}
            className={cn(
              'relative flex h-7 select-none items-center gap-1.5 rounded-[6px] px-2 text-[11.5px] font-medium transition-colors duration-150 ease-out sm:px-2.5',
              active ? 'text-ink' : 'text-sheet/55 hover:text-sheet/90',
            )}
          >
            {active && (
              <motion.span
                layoutId="layout-pill"
                className="absolute inset-0 rounded-[6px] bg-sheet shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
                transition={SPRING_LAYOUT}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              <Icon name={config.icon} size={13} strokeWidth={1.7} />
              <span className="hidden whitespace-nowrap md:inline">{config.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function TopBar() {
  const {
    audit,
    auditOpen,
    setAuditOpen,
    snippets,
    lockerOpen,
    setLockerOpen,
    setBibOpen,
  } = useWorkspace();

  const auditRef = useRef(null);

  useEffect(() => {
    if (!auditOpen) return undefined;
    const onPointerDown = (event) => {
      if (!auditRef.current?.contains(event.target)) setAuditOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [auditOpen, setAuditOpen]);

  return (
    <header className="relative z-40 flex h-14 shrink-0 items-center gap-2 bg-bar px-2.5 text-sheet shadow-[0_1px_0_rgba(255,255,255,0.055)] sm:gap-3 sm:px-4">
      {/* Wordmark */}
      <div className="flex min-w-0 shrink items-center gap-2.5">
        <div className="relative grid h-7 w-7 shrink-0 place-items-center rounded-[6px] bg-sheet text-ink shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]">
          <span className="-mt-px font-serif text-[16px] leading-none">M</span>
          <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent ring-2 ring-bar" />
        </div>
        <div className="hidden min-w-0 leading-none sm:block">
          <p className="truncate font-serif text-[17px] tracking-[-0.01em] text-sheet">
            Marginalia
          </p>
          <p className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.16em] text-sheet/40">
            Dissertation Workbench
          </p>
        </div>
      </div>

      <div className="mx-auto flex min-w-0 items-center">
        <LayoutSwitcher />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <div className="relative" ref={auditRef}>
          <button
            type="button"
            onClick={() => setAuditOpen(!auditOpen)}
            aria-expanded={auditOpen}
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-md px-2 text-[11.5px] font-medium transition-colors duration-150',
              auditOpen
                ? 'bg-white/[0.11] text-sheet'
                : 'text-sheet/65 hover:bg-white/[0.07] hover:text-sheet',
            )}
            title="Audit document consistency"
          >
            <Icon name="scan-search" size={14} />
            <span className="hidden lg:inline">Audit</span>
            {audit.issueCount > 0 ? (
              <span className="grid h-[16px] min-w-[16px] place-items-center rounded-full bg-accent px-1 font-mono text-[9px] font-semibold leading-none text-white">
                {audit.issueCount}
              </span>
            ) : (
              <span className="hidden h-[16px] w-[16px] place-items-center rounded-full bg-teal/25 text-teal sm:grid">
                <Icon name="check" size={10} strokeWidth={2.4} />
              </span>
            )}
          </button>
          <AuditPopover />
        </div>

        <span className="mx-0.5 h-4 w-px bg-white/10" />

        <button
          type="button"
          onClick={() => setLockerOpen(!lockerOpen)}
          aria-expanded={lockerOpen}
          className={cn(
            'flex h-8 items-center gap-1.5 rounded-md px-2 text-[11.5px] font-medium transition-colors duration-150',
            lockerOpen
              ? 'bg-white/[0.11] text-sheet'
              : 'text-sheet/65 hover:bg-white/[0.07] hover:text-sheet',
          )}
          title="Snippet locker"
        >
          <Icon name="lock" size={14} />
          <span className="hidden lg:inline">Locker</span>
          <span
            className={cn(
              'grid h-[16px] min-w-[16px] place-items-center rounded-full px-1 font-mono text-[9px] font-semibold leading-none',
              snippets.length
                ? 'bg-sheet text-ink'
                : 'bg-white/10 text-sheet/45',
            )}
          >
            {snippets.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setBibOpen(true)}
          className="ml-0.5 hidden h-8 items-center gap-1.5 rounded-md bg-sheet/[0.07] px-2.5 text-[11.5px] font-medium text-sheet/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] transition-colors duration-150 hover:bg-sheet/[0.12] hover:text-sheet xl:flex"
          title="Export APA bibliography"
        >
          <Icon name="library" size={13} />
          Bibliography
        </button>
      </div>
    </header>
  );
}

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useWorkspace } from '../store/workspace';
import { cn, formatBytes } from '../lib/utils';
import { Icon } from './icons';
import { EASE_OUT } from '../lib/motion';

function MetaField({ label, value, onChange, ...rest }) {
  return (
    <label className="block min-w-0">
      <span className="font-mono text-[8.5px] uppercase tracking-[0.13em] text-ink-3">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onClick={(event) => event.stopPropagation()}
        className="mt-1 w-full rounded-[4px] border-0 bg-sheet px-1.5 py-1 text-[11px] text-ink shadow-[inset_0_0_0_1px_rgba(24,21,17,0.13)] outline-none transition-shadow placeholder:text-ink-3/60 focus:shadow-[inset_0_0_0_1.5px_rgba(173,56,41,0.5)]"
        {...rest}
      />
    </label>
  );
}

function SourceRow({ file, active, expanded, onToggleMeta }) {
  const { setActiveFileId, removeFile, updateMeta, setLibraryOpen } = useWorkspace();
  const incomplete = !file.meta.author || !file.meta.year;

  const select = () => {
    setActiveFileId(file.id);
    setLibraryOpen(false);
  };

  return (
    <div
      className={cn(
        'group relative rounded-md transition-colors duration-150',
        active
          ? 'bg-sheet shadow-[inset_0_0_0_1px_rgba(24,21,17,0.07)]'
          : 'hover:bg-ink/[0.035]',
      )}
    >
      {active && (
        <span className="absolute bottom-2 left-0 top-2 w-[2px] rounded-full bg-accent" />
      )}

      <div className="flex items-start gap-0.5 py-2 pl-2 pr-1">
        <button
          type="button"
          onClick={select}
          className="flex min-w-0 flex-1 items-start gap-2 text-left"
        >
          <span
            className={cn(
              'mt-px grid h-5 w-5 shrink-0 place-items-center rounded-[3px]',
              active ? 'bg-accent/10 text-accent' : 'bg-ink/[0.05] text-ink-3',
            )}
          >
            <Icon name="file" size={11} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-[11.5px] font-medium leading-tight text-ink">
                {file.name}
              </span>
              {incomplete && (
                <span
                  className="h-1 w-1 shrink-0 rounded-full bg-gold"
                  title="Citation metadata incomplete"
                />
              )}
            </span>
            <span className="mt-1 block truncate font-mono text-[9px] leading-none text-ink-3">
              {file.numPages} pp · {formatBytes(file.size)}
              {file.meta.year ? ` · ${file.meta.year}` : ''}
            </span>
          </span>
        </button>

        <div
          className={cn(
            'flex shrink-0 items-center gap-0.5 transition-opacity duration-150',
            expanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
          )}
        >
          <button
            type="button"
            onClick={onToggleMeta}
            className={cn('btn-icon h-6 w-6', expanded && 'bg-ink/[0.06] text-ink')}
            aria-label={`Edit citation metadata for ${file.name}`}
            aria-expanded={expanded}
            title="Citation metadata"
          >
            <Icon name="text" size={11} />
          </button>
          <button
            type="button"
            onClick={() => removeFile(file.id)}
            className="btn-icon h-6 w-6 hover:bg-accent/10 hover:text-accent"
            aria-label={`Remove ${file.name}`}
            title="Remove source"
          >
            <Icon name="x" size={11} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 px-2 pb-2.5">
              <MetaField
                label="Author"
                value={file.meta.author}
                onChange={(value) => updateMeta(file.id, { author: value })}
                placeholder="Sherman, William H."
              />
              <div className="grid grid-cols-2 gap-1.5">
                <MetaField
                  label="Year"
                  value={file.meta.year}
                  onChange={(value) => updateMeta(file.id, { year: value.replace(/[^0-9]/g, '').slice(0, 4) })}
                  placeholder="2021"
                  inputMode="numeric"
                />
                <MetaField
                  label="Publisher"
                  value={file.meta.publisher}
                  onChange={(value) => updateMeta(file.id, { publisher: value })}
                  placeholder="Folger Press"
                />
              </div>
              <MetaField
                label="Title"
                value={file.meta.title}
                onChange={(value) => updateMeta(file.id, { title: value })}
                placeholder="The Margins of Early Modern Books"
              />
              <p className="pt-0.5 font-mono text-[8.5px] uppercase tracking-[0.1em] text-ink-3/70">
                Feeds in-text citations & bibliography
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PdfSidebar({ compact = false }) {
  const { files, activeFileId, addPdfs, loadSamples } = useWorkspace();
  const [expandedId, setExpandedId] = useState(null);

  const handleFiles = (event) => {
    if (event.target.files?.length) addPdfs(event.target.files);
    event.target.value = '';
  };

  return (
    <aside
      className={cn(
        'flex min-h-0 flex-col bg-sheet-2/60',
        compact
          ? 'h-full w-full bg-sheet'
          : 'w-[238px] shrink-0 border-r border-line/[0.07]',
      )}
    >
      <div className="flex h-9 shrink-0 items-center justify-between px-3">
        <span className="micro">Library</span>
        <span className="font-mono text-[9.5px] tabular-nums text-ink-3">
          {files.length} {files.length === 1 ? 'source' : 'sources'}
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-1.5 pb-2">
        {files.length === 0 && (
          <div className="px-2.5 py-6 text-center">
            <Icon name="book" size={18} className="mx-auto text-ink-3/50" />
            <p className="mt-2 text-[11px] leading-relaxed text-ink-3">
              No sources yet. Add PDFs to begin cross-referencing.
            </p>
          </div>
        )}

        {files.map((file) => (
          <SourceRow
            key={file.id}
            file={file}
            active={file.id === activeFileId}
            expanded={expandedId === file.id}
            onToggleMeta={() =>
              setExpandedId((prev) => (prev === file.id ? null : file.id))
            }
          />
        ))}
      </div>

      <div className="shrink-0 border-t border-line/[0.07] p-2">
        <label className="btn-outline h-8 w-full cursor-pointer">
          <Icon name="plus" size={13} />
          Add PDFs
          <input
            type="file"
            multiple
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={handleFiles}
          />
        </label>
        <button
          type="button"
          onClick={loadSamples}
          className="btn-quiet mt-1 h-7 w-full text-[10.5px] text-ink-3"
        >
          Load sample library
        </button>
      </div>
    </aside>
  );
}

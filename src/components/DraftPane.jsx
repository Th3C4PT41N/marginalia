import { useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useWorkspace } from '../store/workspace';
import { cn, formatTime } from '../lib/utils';
import { Icon } from './icons';

function ToolButton({ icon, label, onClick, active = false }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        'grid h-7 w-7 place-items-center rounded-[4px] text-ink-3 transition-colors duration-150 hover:bg-ink/[0.06] hover:text-ink active:scale-95',
        active && 'bg-ink/[0.07] text-ink',
      )}
    >
      <Icon name={icon} size={13} />
    </button>
  );
}

export function DraftPane() {
  const {
    draftTitle,
    setDraftTitle,
    draftHtml,
    updateDraft,
    saveDraft,
    loadDraftFile,
    draftDirty,
    lastSavedAt,
    editorRef,
    audit,
    searchFromSelection,
  } = useWorkspace();

  const seeded = useRef(false);

  /* Seed the contentEditable exactly once; afterwards the DOM owns the text. */
  useEffect(() => {
    if (seeded.current) return;
    const element = editorRef.current;
    if (!element) return;
    element.innerHTML = draftHtml;
    seeded.current = true;
  }, [draftHtml, editorRef]);

  const exec = useCallback(
    (command, value = null) => {
      const element = editorRef.current;
      if (!element) return;
      element.focus();
      try {
        document.execCommand(command, false, value);
      } catch {
        /* execCommand is best-effort; ignore unsupported commands */
      }
      updateDraft(element.innerHTML);
    },
    [editorRef, updateDraft],
  );

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString() ?? '';
    if (text.trim().length >= 4) searchFromSelection(text);
  }, [searchFromSelection]);

  const readingMinutes = Math.max(1, Math.round(audit.words / 220));

  return (
    <section className="pane">
      {/* Header */}
      <div className="pane-head">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="micro shrink-0 text-accent">Draft</span>
          <span className="h-3 w-px shrink-0 bg-line/15" />
          <input
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            aria-label="Draft title"
            className="-ml-1 min-w-0 flex-1 truncate rounded-[4px] border-0 bg-transparent px-1 py-0.5 font-serif text-[13.5px] text-ink outline-none transition-colors hover:bg-ink/[0.03] focus:bg-ink/[0.04]"
          />
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <span className="micro mr-2 hidden tabular-nums xl:inline">
            {audit.words.toLocaleString()} words
          </span>
          <label className="btn-quiet h-8 cursor-pointer" title="Load an .html draft">
            <Icon name="upload" size={13} />
            <span className="hidden 2xl:inline">Load HTML</span>
            <input
              type="file"
              accept=".html,.htm,text/html"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) loadDraftFile(file);
                event.target.value = '';
              }}
            />
          </label>
          <button
            type="button"
            onClick={saveDraft}
            className="btn-icon"
            title="Save draft as HTML (Ctrl+S)"
            aria-label="Save draft as HTML"
          >
            <Icon name="download" size={14} />
          </button>
        </div>
      </div>

      {/* Formatting strip */}
      <div className="flex h-9 shrink-0 items-center gap-0.5 border-b border-line/[0.06] px-2">
        <ToolButton icon="bold" label="Bold" onClick={() => exec('bold')} />
        <ToolButton icon="italic" label="Italic" onClick={() => exec('italic')} />
        <span className="mx-1 h-3.5 w-px bg-line/10" />
        <ToolButton
          icon="heading"
          label="Heading"
          onClick={() => exec('formatBlock', 'h2')}
        />
        <ToolButton
          icon="quote"
          label="Block quotation"
          onClick={() => exec('formatBlock', 'blockquote')}
        />
        <span className="mx-1 h-3.5 w-px bg-line/10" />
        <ToolButton icon="undo" label="Undo" onClick={() => exec('undo')} />

        <div className="ml-auto flex items-center gap-2 pl-2">
          <span className="hidden font-mono text-[9.5px] tabular-nums text-ink-3 sm:inline">
            {readingMinutes} min read
          </span>
          <span className="hidden h-3 w-px bg-line/10 sm:block" />
          <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-3">
            <span
              className={cn(
                'h-1 w-1 rounded-full',
                draftDirty ? 'bg-gold' : 'bg-teal',
              )}
            />
            {draftDirty
              ? 'Unsaved'
              : lastSavedAt
                ? `Saved ${formatTime(lastSavedAt)}`
                : 'In memory'}
          </span>
        </div>
      </div>

      {/* Sheet */}
      <div className="draft-scroll" onMouseUp={handleSelection}>
        <div className="draft-sheet">
          <div
            ref={editorRef}
            className="draft-prose"
            contentEditable
            suppressContentEditableWarning
            spellCheck
            role="textbox"
            aria-multiline="true"
            aria-label="Dissertation draft editor"
            onInput={(event) => updateDraft(event.currentTarget.innerHTML)}
            onBlur={(event) => updateDraft(event.currentTarget.innerHTML)}
            onKeyUp={(event) => {
              if (event.shiftKey) handleSelection();
            }}
          />
        </div>

        <div className="divider-orn mx-auto mt-6 max-w-[46rem] font-mono text-[8.5px] uppercase tracking-[0.2em]">
          <span>End of draft</span>
        </div>
      </div>

      {/* Floating save */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-end bg-gradient-to-t from-sheet via-sheet/80 to-transparent p-3 pt-10 sm:p-4 sm:pt-12">
        <motion.button
          type="button"
          onClick={saveDraft}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.12 }}
          className="pointer-events-auto flex h-10 items-center gap-2 rounded-full bg-ink pl-3.5 pr-4 text-sheet shadow-lift transition-colors duration-150 hover:bg-ink/90"
          title="Package this draft as a downloadable HTML file (Ctrl+S)"
        >
          <Icon name="save" size={15} />
          <span className="text-[12.5px] font-medium">Save Draft</span>
          {draftDirty && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
        </motion.button>
      </div>
    </section>
  );
}

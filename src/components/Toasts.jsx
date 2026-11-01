import { AnimatePresence, motion } from 'framer-motion';
import { useWorkspace } from '../store/workspace';
import { cn } from '../lib/utils';
import { Icon } from './icons';
import { EASE_OUT } from '../lib/motion';

export function Toasts() {
  const { toasts } = useWorkspace();

  return (
    <div className="pointer-events-none fixed left-1/2 top-[68px] z-[80] flex w-[min(92vw,400px)] -translate-x-1/2 flex-col items-center gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className={cn(
              'pointer-events-auto flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-[12px] shadow-pop',
              toast.tone === 'error' ? 'bg-accent text-white' : 'bg-ink text-sheet',
            )}
          >
            <Icon
              name={toast.tone === 'error' ? 'alert' : 'check'}
              size={13}
              strokeWidth={2}
              className="shrink-0 opacity-75"
            />
            <span className="min-w-0 flex-1 leading-snug">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { WorkspaceProvider, useWorkspace } from './store/workspace';
import { TopBar } from './components/TopBar';
import { DraftPane } from './components/DraftPane';
import { ReferencePane } from './components/ReferencePane';
import { SnippetLocker } from './components/SnippetLocker';
import { BibliographyModal } from './components/BibliographyModal';
import { Toasts } from './components/Toasts';
import { LAYOUTS } from './lib/layouts';
import { SPRING_LAYOUT } from './lib/motion';

function Workspace() {
  const { layout } = useWorkspace();
  const reduceMotion = useReducedMotion();
  const [wide, setWide] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches,
  );

  useEffect(() => {
    const query = window.matchMedia('(min-width: 900px)');
    const onChange = (event) => setWide(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const config = LAYOUTS[layout];
  const left = config.left;
  /* Small screens get a friendlier split than the desktop proportions. */
  const mobileLeft = layout === 'writing' ? 58 : layout === 'reading' ? 45 : 50;

  const transition = reduceMotion
    ? { duration: 0 }
    : { ...SPRING_LAYOUT, restDelta: 0.001 };

  return (
    <div className="grain flex h-full flex-col overflow-hidden bg-paper">
      <TopBar />

      <motion.main
        initial={false}
        animate={
          wide
            ? { gridTemplateColumns: `${left}fr ${100 - left}fr`, gridTemplateRows: '1fr' }
            : {
                gridTemplateColumns: '1fr',
                gridTemplateRows: `${mobileLeft}fr ${100 - mobileLeft}fr`,
              }
        }
        transition={transition}
        className="grid min-h-0 flex-1 gap-2 p-2 lg:gap-3 lg:p-3"
      >
        <div className="flex min-h-0 min-w-0 flex-col">
          <DraftPane />
        </div>
        <div className="flex min-h-0 min-w-0 flex-col">
          <ReferencePane />
        </div>
      </motion.main>

      <SnippetLocker />
      <BibliographyModal />
      <Toasts />
    </div>
  );
}

export default function App() {
  return (
    <WorkspaceProvider>
      <Workspace />
    </WorkspaceProvider>
  );
}

export const LAYOUTS = {
  writing: {
    id: 'writing',
    label: 'Writing',
    full: 'Writing Mode',
    description: 'Draft 75 · Reference 25',
    icon: 'pen',
    left: 75,
  },
  verification: {
    id: 'verification',
    label: 'Verification',
    full: 'Verification Mode',
    description: 'Draft 50 · Reference 50',
    icon: 'columns',
    left: 50,
  },
  reading: {
    id: 'reading',
    label: 'Deep Reading',
    full: 'Deep Reading Mode',
    description: 'Draft 40 · Reference 60, stacked',
    icon: 'rows',
    left: 40,
  },
};

export const LAYOUT_ORDER = ['writing', 'verification', 'reading'];

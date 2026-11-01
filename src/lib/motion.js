/* Shared motion vocabulary.
   Context: a productivity tool used for hours at a time.
   Weighting: Emil primary (restraint, speed), Jakub secondary (polish).
   Nothing bounces; nothing loops; exits are quieter than enters. */

export const EASE_OUT = [0.22, 1, 0.36, 1];
export const EASE_IN = [0.64, 0, 0.78, 0];

/** Pane resizing / shared-layout indicator. Occasional, so a soft spring. */
export const SPRING_LAYOUT = { type: 'spring', stiffness: 300, damping: 34, mass: 0.9 };

/** Drawer + modal travel. */
export const SPRING_SHEET = { type: 'spring', stiffness: 320, damping: 36, mass: 0.9 };

export const FADE_FAST = { duration: 0.16, ease: EASE_OUT };
export const FADE_BASE = { duration: 0.22, ease: EASE_OUT };

/** Small enter for rows, cards and results. */
export const riseIn = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -3 },
};

/** Popover anchored to a control. */
export const popIn = {
  initial: { opacity: 0, y: -6, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.99 },
};

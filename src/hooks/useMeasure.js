import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Track an element's box size with a ResizeObserver.
 * Measures synchronously on mount so first paint does not depend on the
 * observer's first callback (which can be delayed in background tabs).
 */
export function useMeasure() {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const measure = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      setSize((prev) =>
        Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1
          ? prev
          : { width, height },
      );
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, size];
}

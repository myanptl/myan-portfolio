import { useEffect, useRef, useState } from 'react';

/**
 * Marks an element as revealed the first time it crosses into view, and keeps
 * a live `active` flag while it occupies the middle of the viewport.
 *
 * One observer per element rather than a shared scroll handler, so there is no
 * scroll-handler churn.
 */
export function useSectionInView({ threshold = 0.25, once = false } = {}) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setRevealed(false);
        }
      },
      { threshold, rootMargin: '0px 0px -10% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return [ref, revealed];
}

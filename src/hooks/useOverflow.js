import { useEffect, useRef } from 'react';

/**
 * Publishes how far an element's content overflows its own box, as
 * `--overflow` in px.
 *
 * The takeover windows use this to scroll a captured site through itself on
 * hover. Measured rather than assumed, because the captures differ in height
 * and the media is lazily loaded, so the value is not known at mount.
 */
export function useOverflow() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const overflow = Math.max(0, el.scrollHeight - el.clientHeight);
      el.style.setProperty('--overflow', `${overflow}px`);
      // Some captures fit the window entirely (VulnScan's report is a single
      // screen). Those must not advertise a scroll that cannot happen.
      el.dataset.scrollable = overflow > 40 ? 'true' : 'false';
    };

    // `load` does not bubble, so this listens in the capture phase. Without it
    // the measurement runs before the lazy image has any height and the
    // scroll-through silently does nothing.
    el.addEventListener('load', measure, true);

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    Array.from(el.children).forEach((child) => observer.observe(child));

    measure();

    return () => {
      el.removeEventListener('load', measure, true);
      observer.disconnect();
    };
  }, []);

  return ref;
}

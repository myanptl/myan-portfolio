import { useEffect, useState } from 'react';

/**
 * Tracks which section owns the top of the viewport and mirrors its polarity
 * and label onto <html>, so the body ground and the sticky header always match
 * the section being read (including in the overscroll area).
 *
 * Sections opt in with data-polarity and data-section on a <section>.
 */
export function usePolarity() {
  const [current, setCurrent] = useState({ polarity: 'dark', label: '' });

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('section[data-polarity]'));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // The section covering the top band of the viewport wins.
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (!hit) return;
        setCurrent({
          polarity: hit.target.dataset.polarity,
          label: hit.target.dataset.section || '',
        });
      },
      // Switches the moment a section reaches the very top of the viewport,
      // which is what sits behind the fixed header. A larger bottom margin
      // flipped the header's colour before the section under it had changed,
      // leaving the wordmark near-invisible across the boundary.
      { rootMargin: '0px 0px -99% 0px', threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.polarity = current.polarity;
  }, [current.polarity]);

  return current;
}

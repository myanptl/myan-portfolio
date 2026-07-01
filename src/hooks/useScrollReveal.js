import { useEffect, useRef, useState } from 'react';

/**
 * IntersectionObserver-based scroll reveal. Adds visibility once the element
 * enters the viewport, then unobserves (reveal-once). Compositor-friendly:
 * the actual animation is CSS (opacity + transform) via the `.reveal` class.
 */
export function useScrollReveal({ threshold = 0.18, rootMargin = '0px 0px -10% 0px' } = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          obs.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
    // isVisible is intentionally omitted: the observer self-unobserves on
    // first intersection, so re-running on reveal would only churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, rootMargin]);

  return { ref, isVisible };
}

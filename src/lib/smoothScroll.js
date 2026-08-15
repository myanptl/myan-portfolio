// Lerped scrolling. This is the single biggest reason award sites feel
// expensive: the page eases toward the wheel instead of snapping to it.
//
// Implemented by damping window.scrollTo rather than translating a wrapper
// element. The wrapper approach (position: fixed content + transform) is what
// most libraries do, but it takes the document out of normal flow and breaks
// anchor links, focus scrolling and native scrollbar dragging. Damping the
// real scroll position keeps all of that working.

const EASE = 0.085;
const SNAP = 0.4; // px below which we stop animating

export function createSmoothScroll() {
  if (typeof window === 'undefined') return null;

  let target = window.scrollY;
  let current = window.scrollY;
  let raf = 0;
  let running = false;
  let velocity = 0;
  let enabled = true;

  const root = document.documentElement;

  const maxScroll = () =>
    Math.max(0, document.body.scrollHeight - window.innerHeight);

  const tick = () => {
    const diff = target - current;

    if (Math.abs(diff) < SNAP) {
      current = target;
      velocity = 0;
      running = false;
      root.style.setProperty('--scroll-velocity', '0');
      return;
    }

    current += diff * EASE;
    velocity = diff;

    // Explicitly instant: if anything reintroduces scroll-behavior: smooth,
    // this keeps the per-frame writes from turning into competing animations.
    window.scrollTo({ top: current, behavior: 'instant' });

    // Published so components can skew or lag with scroll speed. Clamped so a
    // long flick cannot produce an absurd transform.
    const v = Math.max(-1, Math.min(1, velocity / 90));
    root.style.setProperty('--scroll-velocity', v.toFixed(3));

    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(tick);
  };

  const onWheel = (event) => {
    if (!enabled || event.ctrlKey) return; // ctrl+wheel is browser zoom
    event.preventDefault();
    target = Math.max(0, Math.min(maxScroll(), target + event.deltaY));
    start();
  };

  // Anything that moves the page without the wheel (keyboard, anchor jump,
  // scrollbar drag, find-in-page) resyncs the target so the next wheel tick
  // does not yank the page back.
  const onScroll = () => {
    if (!running) {
      target = window.scrollY;
      current = window.scrollY;
    }
  };

  const onResize = () => {
    target = Math.max(0, Math.min(maxScroll(), target));
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  return {
    scrollTo(y) {
      target = Math.max(0, Math.min(maxScroll(), y));
      start();
    },
    setEnabled(next) {
      enabled = next;
      if (!next) {
        target = window.scrollY;
        current = window.scrollY;
      }
    },
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      root.style.removeProperty('--scroll-velocity');
    },
  };
}

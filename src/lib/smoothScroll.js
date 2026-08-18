// Lerped scrolling. This is the single biggest reason award sites feel
// expensive: the page eases toward the wheel instead of snapping to it.
//
// Implemented by damping window.scrollTo rather than translating a wrapper
// element. The wrapper approach (position: fixed content + transform) is what
// most libraries do, but it takes the document out of normal flow and breaks
// anchor links, focus scrolling and native scrollbar dragging. Damping the
// real scroll position keeps all of that working.
//
// The damping is a spring rather than a fixed per-frame ease. Two reasons:
// the old `current += diff * 0.085` scrolled measurably faster on a 120Hz
// display than on 60Hz, and a spring gives real velocity in px/sec to publish
// rather than a per-frame delta that means nothing on its own.
//
// Tuned critically damped on purpose. Overshoot reads as character on a link
// and as motion sickness on a page.

import { createSpring, createClock } from './spring';

const STIFFNESS = 140;
const DAMPING = 24; // ratio ~1.01, no overshoot
const MAX_VELOCITY = 2600; // px/sec that maps to a full-scale --scroll-velocity

export function createSmoothScroll() {
  if (typeof window === 'undefined') return null;

  const root = document.documentElement;
  const spring = createSpring({
    stiffness: STIFFNESS,
    damping: DAMPING,
    value: window.scrollY,
  });
  const tick = createClock();

  let raf = 0;
  let running = false;
  let enabled = true;

  const maxScroll = () =>
    Math.max(0, document.body.scrollHeight - window.innerHeight);

  const frame = (now) => {
    const dt = tick(now);
    spring.step(dt);

    // Explicitly instant: if anything reintroduces scroll-behavior: smooth,
    // this keeps the per-frame writes from turning into competing animations.
    window.scrollTo({ top: spring.value, behavior: 'instant' });

    // Published so components can skew or lag with scroll speed. Clamped so a
    // long flick cannot produce an absurd transform.
    const v = Math.max(-1, Math.min(1, spring.velocity / MAX_VELOCITY));
    root.style.setProperty('--scroll-velocity', v.toFixed(3));

    if (spring.settled(0.4)) {
      window.scrollTo({ top: spring.target, behavior: 'instant' });
      root.style.setProperty('--scroll-velocity', '0');
      running = false;
      raf = 0;
      return;
    }

    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(frame);
  };

  const onWheel = (event) => {
    if (!enabled || event.ctrlKey) return; // ctrl+wheel is browser zoom
    event.preventDefault();
    spring.target = Math.max(0, Math.min(maxScroll(), spring.target + event.deltaY));
    start();
  };

  // Anything that moves the page without the wheel (keyboard, anchor jump,
  // scrollbar drag, find-in-page) resyncs the target so the next wheel tick
  // does not yank the page back.
  const onScroll = () => {
    if (!running) spring.jump(window.scrollY);
  };

  const onResize = () => {
    spring.target = Math.max(0, Math.min(maxScroll(), spring.target));
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  return {
    scrollTo(y) {
      spring.target = Math.max(0, Math.min(maxScroll(), y));
      start();
    },
    setEnabled(next) {
      enabled = next;
      if (!next) spring.jump(window.scrollY);
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

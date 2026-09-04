/*
 * Scroll choreography.
 *
 * Kept out of React on purpose. This runs every frame and writes straight to
 * the DOM; routing it through state would re-render the whole page sixty times
 * a second to change two text nodes.
 *
 * Progress through the tall teardown parent drives the disassembly. Its pinned
 * child stays put, so scrolling reads as moving through the object rather than
 * past it.
 */

import { onFrame, clamp, mapRange, smoothstep } from '../lib/frame.js';

/* Portrait and narrow-landscape viewports cannot afford a side-by-side
   composition, so the drive is lifted clear of the copy instead of being pushed
   beside it. Checked per frame rather than at load, so a rotation or a window
   drag re-composes immediately. */
const isNarrow = () => innerWidth / innerHeight < 1.25;

export function direct(stage, els) {
  const { stageEl, hero, heroInner, teardown, tail, caption, capName, capSpec, readout, scrub, hint } = els;

  /*
   * With reduced motion the drive never opens, so the pinned scene has nothing
   * to show and the section renders as a plain list of the parts instead. A
   * static object parked behind that list just collides with it, so the stage
   * starts receding one section earlier: the object has said everything it has
   * to say by the end of the hero.
   */
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fadeFrom = still ? teardown : tail;

  // The order a bench teardown actually goes in: cover first, board last.
  const ordered = stage.parts.slice().sort((a, b) => b.userData.order - a.userData.order);
  let shown = -1;
  let swapTimer = 0;

  function updateHero() {
    const r = hero.getBoundingClientRect();
    if (r.bottom < 0) {
      // Jumping the scroll straight past the hero used to leave it latched at
      // full opacity, so it reappeared over the teardown on the way back up.
      if (heroInner.style.opacity !== '0') heroInner.style.opacity = '0';
      return;
    }
    const p = clamp(-r.top / innerHeight, 0, 1);
    // Fade the hero copy well before the teardown pins, or the two sections
    // briefly share the frame and their type collides.
    heroInner.style.opacity = String(1 - clamp((p - 0.2) / 0.45, 0, 1));

    // Closed, running, turning slowly, held to the right so the name owns the
    // lower left.
    stage.setExplode(0);
    stage.setFraming(0);
    stage.setOrbit(-0.5 + p * 0.22, 0.34);
    stage.setPan(isNarrow() ? 0 : -0.22 + p * 0.07, isNarrow() ? -0.52 : -0.1);
    stage.setInteractive(false);
  }

  function updateTeardown() {
    const r = teardown.getBoundingClientRect();
    const total = r.height - innerHeight;
    // Under reduced motion the section drops to `height: auto` and is SHORTER
    // than the viewport, so this goes negative and the progress it produces is
    // nonsense: -r.top / a negative flips sign, and the drive opens backwards
    // as you scroll up. There is no travel to map in that case.
    const p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
    const inView = r.top < innerHeight && r.bottom > 0;

    if (!inView) {
      stage.setInteractive(false);
      if (shown !== -1) { shown = -1; stage.setFocus(null); }
      return;
    }

    // Beat 1 (0 to 0.24): the drive comes apart.
    // Beat 2 (0.24 to 0.84): hold, orbit, walk the caption through the parts.
    // Beat 3 (0.84 to 1): close back up.
    let e;
    if (p < 0.24) e = smoothstep(p / 0.24);
    else if (p < 0.84) e = 1;
    else e = 1 - smoothstep((p - 0.84) / 0.16);
    stage.setExplode(e);

    // Pitch stays in a raised three-quarter band the whole way. Dropping it
    // toward level puts the eye edge-on to a stack of flat plates, which is the
    // one angle where an exploded view reads as nothing at all, and the
    // platters in particular vanish to lines.
    stage.setOrbit(mapRange(p, 0, 1, -0.5, 0.72), mapRange(p, 0, 1, 0.34, 0.54));
    stage.setFraming(e);
    stage.setPan(isNarrow() ? 0 : -0.14, isNarrow() ? -0.4 : -0.08);

    // Hover only means anything while the drive is actually apart.
    stage.setInteractive(e > 0.85);
    hint.classList.toggle('is-off', e < 0.85);
    scrub.style.transform = `scaleX(${p})`;

    const inHold = p >= 0.24 && p < 0.84;
    if (!inHold) {
      if (shown !== -1) { shown = -1; stage.setFocus(null); }
      return;
    }

    const t = clamp(mapRange(p, 0.24, 0.84, 0, 0.999), 0, 0.999);
    const idx = Math.floor(t * ordered.length);
    if (idx === shown) return;

    shown = idx;
    const part = ordered[idx];
    stage.setFocus(part);
    caption.classList.add('is-swap');
    readout.textContent = String(idx + 1).padStart(2, '0');
    // Cancel any swap still pending. Scrolling fast queues several of these,
    // and a stale one landing after the readout advanced leaves the caption
    // naming a different part than the number beside it.
    clearTimeout(swapTimer);
    swapTimer = setTimeout(() => {
      capName.textContent = part.userData.name;
      capSpec.textContent = part.userData.spec;
      caption.classList.remove('is-swap');
    }, 130);
  }

  /*
   * Everything past the teardown still has to own the camera explicitly, or the
   * drive keeps whatever pan it was last given and sits underneath the work.
   * The object has finished its story by then, so it recedes.
   *
   * Panning it off-frame was the first instinct and it is fragile: an object
   * this wide needs about two full frames of travel to clear, and anything
   * short of that leaves it under the right-hand column. Fading is reliable.
   */
  function updateTail() {
    const r = fadeFrom.getBoundingClientRect();
    if (r.top > innerHeight * 0.9) {
      stageEl.style.opacity = '1';
      return false;
    }
    const p = clamp(1 - r.top / (innerHeight * 0.9), 0, 1);
    stage.setExplode(0);
    stage.setFraming(0);
    stage.setOrbit(1.15, 0.32);
    stage.setPan(isNarrow() ? 0 : -0.48, 0.18 + p * 0.5);
    stage.setInteractive(false);
    stageEl.style.opacity = String(1 - p);
    if (shown !== -1) { shown = -1; stage.setFocus(null); }
    return true;
  }

  const stop = onFrame(() => {
    // Later sections win, because they are further down the page. Testing the
    // earlier one first means that at any seam where two sections overlap, the
    // one being scrolled away from keeps the camera.
    if (updateTail()) return;
    updateHero();
    updateTeardown();
  });

  return () => {
    stop();
    clearTimeout(swapTimer);
  };
}

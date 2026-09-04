import { useEffect } from 'react';

/*
 * Ids the scene reads off the DOM. The choreography needs the real measured
 * position of four elements every frame, and threading refs down through four
 * components to hand them over buys nothing but ceremony. Declared here so the
 * contract between the markup and the scene is written down in one place.
 */
const IDS = {
  stageEl: 'stage', hero: 'hero', heroInner: 'hero-inner', teardown: 'teardown',
  tail: 'work', caption: 'caption', capName: 'caption-name', capSpec: 'caption-spec',
  readout: 'readout-idx', scrub: 'scrub', hint: 'hint',
};

/**
 * Mounts the drive and wires it to the scroll. Returns nothing: the scene owns
 * itself from here and never re-enters React.
 *
 * three.js is imported dynamically, which is worth the small extra complexity:
 * it is about 150 kB gzipped, four times the rest of the page put together, and
 * none of it is needed to paint the name and the first line of copy. Loading it
 * in the initial chunk would hold up first paint for a scene that spends its
 * first second springing itself together anyway.
 */
export function useTeardown() {
  useEffect(() => {
    let cancelled = false;
    let teardown = null;

    (async () => {
      const [{ createStage }, { direct }] = await Promise.all([
        import('../scene/stage.js'),
        import('../scene/director.js'),
      ]);
      // The effect can be torn down before the import resolves, which in
      // StrictMode is not an edge case but the normal development path.
      if (cancelled) return;

      const els = {};
      for (const [key, id] of Object.entries(IDS)) {
        const el = document.getElementById(id);
        // A missing element would otherwise surface as a null dereference deep
        // in the frame loop, sixty times a second, with no clue which one.
        if (!el) {
          console.error(`[teardown] no element with id "${id}"`);
          return;
        }
        els[key] = el;
      }

      const hotspots = els.stageEl.querySelector('.stage__hotspots');
      if (!hotspots) return;

      // The stage creates and appends its own canvas. See createStage.
      const stage = createStage(els.stageEl, hotspots);
      const undirect = direct(stage, els);

      // The drive assembles itself on first paint: it starts open and far away,
      // then springs together. It states what the page does before a word is
      // read, and it covers the moment the chunk was still arriving.
      stage.prime();
      const raf = requestAnimationFrame(() => {
        stage.setExplode(0);
        stage.setFraming(0);
      });

      teardown = () => {
        cancelAnimationFrame(raf);
        undirect();
        stage.dispose();
      };
    })();

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, []);
}

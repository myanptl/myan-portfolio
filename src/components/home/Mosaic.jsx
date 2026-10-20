import { useEffect, useRef, useState } from 'react';
import { motionReel } from '../../data/motion';

// The hero is one of the motion pieces, played through a pixel mosaic.
// A hidden <video> is sampled into a tiny offscreen canvas each frame, and
// every sampled pixel becomes one cell drawn on a single-hue ramp.
const CELL = 7;          // css px per cell
const LEVELS = 7;        // brightness steps; fewer reads more "pixel"
const PLAYBACK = 0.6;    // the source cuts are fast; slowed so it drifts
const CROP = 0.62;       // the objects sit mid-frame, so sample the centre
const BLACK = 0.12;      // the renders sit on grainy near-black; below this is empty

const ramp = () => {
  const s = getComputedStyle(document.documentElement);
  return Array.from({ length: LEVELS }, (_, i) => s.getPropertyValue(`--mosaic-${i}`).trim());
};

export function Mosaic() {
  const [index, setIndex] = useState(0);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const piece = motionReel[index];

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    const sample = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let colors = ramp();
    let raf = 0;
    let visible = true;
    let cols = 0;
    let rows = 0;

    const size = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.floor(width / CELL);
      rows = Math.floor(height / CELL);
      sample.canvas.width = cols;
      sample.canvas.height = rows;
    };

    const draw = () => {
      if (video.readyState < 2 || !cols) return;
      const vw = video.videoWidth * CROP;
      const vh = vw * (rows / cols);
      sample.drawImage(video, (video.videoWidth - vw) / 2, (video.videoHeight - vh) / 2, vw, vh, 0, 0, cols, rows);
      const px = sample.getImageData(0, 0, cols, rows).data;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const raw = (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / 255;
          const lum = Math.max(0, (raw - BLACK) / (1 - BLACK));
          // Gamma lifts the dark renders so the shapes actually register.
          const level = Math.min(LEVELS - 1, Math.floor(Math.pow(lum, 0.6) * LEVELS));
          if (level === 0) continue;
          // Brighter cells are also bigger, which is what makes it read as a
          // mosaic rather than as a blurry, low resolution video.
          const s = CELL * (0.45 + 0.5 * (level / (LEVELS - 1)));
          ctx.fillStyle = colors[level];
          ctx.fillRect(x * CELL + (CELL - s) / 2, y * CELL + (CELL - s) / 2, s, s);
        }
      }
    };

    const loop = () => {
      draw();
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const onReady = () => {
      video.playbackRate = PLAYBACK;
      if (still) { video.pause(); draw(); return; }
      video.play().catch(() => draw());
      if (!raf) loop();
    };

    // Stop drawing when scrolled away; there is no point burning a core on it.
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf && !still) loop();
    });
    io.observe(canvas);

    // Theme flips change the ramp.
    const mo = new MutationObserver(() => { colors = ramp(); draw(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onScheme = () => { colors = ramp(); draw(); };
    mq.addEventListener('change', onScheme);

    const ro = new ResizeObserver(() => { size(); draw(); });
    ro.observe(canvas);
    size();

    video.addEventListener('loadeddata', onReady);
    if (video.readyState >= 2) onReady();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
      ro.disconnect();
      mq.removeEventListener('change', onScheme);
      video.removeEventListener('loadeddata', onReady);
    };
  }, [index]);

  const next = () => setIndex((i) => (i + 1) % motionReel.length);

  return (
    <figure className="mosaic">
      <button className="mosaic__frame" type="button" onClick={next} aria-label={`${piece.name}, shown as a pixel mosaic. Show the next piece.`}>
        <video
          key={piece.slug}
          ref={videoRef}
          src={`/motion/${piece.slug}.mp4`}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
        />
        <canvas ref={canvasRef} aria-hidden="true" />
      </button>
      <figcaption className="mosaic__caption">
        <span>{piece.name}. {piece.role}.</span>
        <span>{index + 1} / {motionReel.length}</span>
      </figcaption>
    </figure>
  );
}

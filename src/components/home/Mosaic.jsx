import { useEffect, useRef, useState } from 'react';

// Footage drawn as a grid of small diamonds, one per sampled pixel.
// Both clips were shot on black. By day the black keys out to the page, so the
// flower sits on white; by night the page is black too, so the jellyfish float.
const CLIPS = {
  light: { src: '/motion/flower.mp4', label: 'An alstroemeria opening', key: [0.07, 0.24], lift: true },
  dark: { src: '/motion/jellyfish.mp4', label: 'Moon jellyfish drifting', key: [0.03, 0.14], lift: false },
};
const CELL = 7; // css px per diamond

const resolvedTheme = () => document.documentElement.dataset.theme
  || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function Mosaic() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [theme, setTheme] = useState(resolvedTheme);
  const [ready, setReady] = useState(false);
  const clip = CLIPS[theme];

  useEffect(() => {
    const sync = () => setTheme(resolvedTheme());
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', sync);
    return () => { mo.disconnect(); mq.removeEventListener('change', sync); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    const sample = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let cols = 0;
    let rows = 0;
    let lastTime = -1;
    setReady(false);

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
      lastTime = -1;
    };

    const draw = () => {
      if (video.readyState < 2 || !cols || video.currentTime === lastTime) return;
      lastTime = video.currentTime;
      // Cover-fit the clip into the grid.
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const scale = Math.max(cols / vw, rows / vh);
      const sw = cols / scale;
      const sh = rows / scale;
      sample.drawImage(video, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, cols, rows);
      const px = sample.getImageData(0, 0, cols, rows).data;
      const r = CELL / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const peak = Math.max(px[i], px[i + 1], px[i + 2]) / 255;
          const a = smooth(clip.key[0], clip.key[1], peak);
          if (a < 0.02) continue;
          // On paper the dim edges of the footage need lifting to read; on black
          // the jellyfish keep their own colour, only slightly brightened.
          const lift = clip.lift ? 1 / Math.max(0.35, peak) : 1.5;
          // At night the jellyfish read pale and glassy: pull a third of each
          // channel towards grey before brightening.
          const grey = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
          const c = (v) => Math.min(255, Math.round((clip.lift ? v : v * 0.65 + grey * 0.35) * lift * 0.92));
          ctx.fillStyle = `rgba(${c(px[i])},${c(px[i + 1])},${c(px[i + 2])},${a})`;
          const cx = x * CELL + r;
          const cy = y * CELL + r;
          ctx.beginPath();
          ctx.moveTo(cx, cy - r);
          ctx.lineTo(cx + r, cy);
          ctx.lineTo(cx, cy + r);
          ctx.lineTo(cx - r, cy);
          ctx.fill();
        }
      }
      setReady(true);
    };

    const loop = () => { draw(); raf = requestAnimationFrame(loop); };

    const onReady = () => {
      if (still) {
        video.pause();
        video.currentTime = video.duration / 2;
        video.addEventListener('seeked', draw, { once: true });
        return;
      }
      video.play().catch(() => {});
      if (!raf) loop();
    };

    const ro = new ResizeObserver(() => { size(); draw(); });
    ro.observe(canvas);
    size();
    video.addEventListener('loadeddata', onReady);
    if (video.readyState >= 2) onReady();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      video.removeEventListener('loadeddata', onReady);
    };
  }, [clip]);

  return (
    <div className="mosaic">
      <video key={clip.src} ref={videoRef} src={clip.src} muted loop playsInline preload="auto" aria-hidden="true" />
      <canvas ref={canvasRef} className={ready ? 'is-ready' : ''} role="img" aria-label={clip.label} />
    </div>
  );
}

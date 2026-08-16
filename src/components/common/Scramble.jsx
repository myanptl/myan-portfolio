import { useEffect, useRef } from 'react';
import { useSectionInView } from '../../hooks/useSectionInView';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>*#§%';

/**
 * Resolves text from noise, character by character, when it scrolls into view
 * and again on hover.
 *
 * Writes through a ref rather than state: a scramble runs at 30fps for about
 * half a second, and re-rendering the tree that often for a caption is waste.
 */
export function Scramble({ text, className = '', as: Tag = 'span', speed = 34 }) {
  const [viewRef, revealed] = useSectionInView({ threshold: 0.4, once: true });
  const reducedMotion = useReducedMotion();
  const nodeRef = useRef(null);
  const frame = useRef(0);
  const timer = useRef(0);

  const run = () => {
    if (reducedMotion) return;
    const node = nodeRef.current;
    if (!node) return;

    const target = text;
    let step = 0;
    clearInterval(timer.current);

    timer.current = setInterval(() => {
      const progress = step / 3;
      let out = '';

      for (let i = 0; i < target.length; i += 1) {
        if (target[i] === ' ') {
          out += ' ';
        } else if (i < progress) {
          out += target[i];
        } else {
          out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }

      node.textContent = out;
      step += 1;

      if (progress >= target.length) {
        clearInterval(timer.current);
        node.textContent = target;
      }
    }, speed);
  };

  useEffect(() => {
    if (revealed) run();
    return () => clearInterval(timer.current);
    // run is stable enough for this: it only closes over text and speed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, text]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <Tag ref={viewRef} className={className} onPointerEnter={run}>
      <span ref={nodeRef}>{text}</span>
    </Tag>
  );
}

import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Types out an ordered list of command "steps" sequentially, revealing each
 * step's output once its command finishes "typing". Mirrors a real terminal
 * running commands one after another.
 *
 * steps: [{ command: string, key: string }]
 * Returns: { typed: { [key]: string }, doneSteps: Set<key>, activeKey }
 */
export function useTypewriter(steps, { speed = 55, stepDelay = 420 } = {}) {
  const [typed, setTyped] = useState({});
  const [doneSteps, setDoneSteps] = useState(() => new Set());
  const [activeKey, setActiveKey] = useState(steps[0]?.key ?? null);
  const timers = useRef([]);

  useEffect(() => {
    // Reduced motion: show everything immediately (checked at mount).
    if (prefersReducedMotion()) {
      const allTyped = {};
      steps.forEach((s) => (allTyped[s.key] = s.command));
      setTyped(allTyped);
      setDoneSteps(new Set(steps.map((s) => s.key)));
      setActiveKey(null);
      return;
    }

    let cancelled = false;
    const schedule = (fn, ms) => {
      const id = setTimeout(fn, ms);
      timers.current.push(id);
    };

    const runStep = (index) => {
      if (cancelled || index >= steps.length) {
        setActiveKey(null);
        return;
      }
      const step = steps[index];
      setActiveKey(step.key);
      let char = 0;

      const typeChar = () => {
        if (cancelled) return;
        char += 1;
        setTyped((prev) => ({ ...prev, [step.key]: step.command.slice(0, char) }));
        if (char < step.command.length) {
          schedule(typeChar, speed);
        } else {
          setDoneSteps((prev) => new Set(prev).add(step.key));
          schedule(() => runStep(index + 1), stepDelay);
        }
      };
      typeChar();
    };

    runStep(0);

    return () => {
      cancelled = true;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    // steps/speed/stepDelay are intentionally read once at mount — the hook
    // runs the full intro animation from scratch and does not support live
    // reconfiguration mid-animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { typed, doneSteps, activeKey };
}

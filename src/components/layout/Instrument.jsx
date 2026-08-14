import { useRef } from 'react';
import { usePointer } from '../../hooks/usePointer';
import { useLocalClock } from '../../hooks/useLocalClock';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './instrument.css';

const COLUMNS = 4;
const ROWS = 3;

/**
 * The persistent chrome: a column grid with crosshairs at its intersections,
 * live readouts, and a cursor that trails the pointer.
 *
 * This layer is what carries the density. Without it the page is a sequence of
 * large quiet blocks, which is what read as bland.
 */
export function Instrument() {
  const readoutRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const clock = useLocalClock();

  usePointer(readoutRef);

  const crosshairs = [];
  for (let r = 1; r < ROWS; r += 1) {
    for (let c = 1; c < COLUMNS; c += 1) {
      crosshairs.push(
        <span
          key={`${r}-${c}`}
          className="grid__cross"
          style={{ left: `${(c / COLUMNS) * 100}%`, top: `${(r / ROWS) * 100}%` }}
        />,
      );
    }
  }

  return (
    <>
      <div className="grid" aria-hidden="true">
        {Array.from({ length: COLUMNS - 1 }, (_, i) => (
          <span
            key={`col-${i}`}
            className="grid__col"
            style={{ left: `${((i + 1) / COLUMNS) * 100}%` }}
          />
        ))}
        {crosshairs}
      </div>

      {!reducedMotion && <div className="cursor" aria-hidden="true" />}

      <div className="readout" aria-hidden="true">
        <span className="readout__item">EST US {clock}</span>
        <span className="readout__item readout__item--center" ref={readoutRef}>
          0000 X 0000 Y
        </span>
        <span className="readout__item">42.58N 71.44W</span>
      </div>
    </>
  );
}

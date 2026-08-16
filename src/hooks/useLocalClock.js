import { useEffect, useState } from 'react';

/**
 * Live local time where Myan is, in the same terse format the reference sites
 * use for their location readout. Real clock, not a decorative string.
 */
export function useLocalClock(timeZone = 'America/New_York') {
  const [now, setNow] = useState(() => format(timeZone));

  useEffect(() => {
    const id = setInterval(() => setNow(format(timeZone)), 1000 * 30);
    return () => clearInterval(id);
  }, [timeZone]);

  return now;
}

function format(timeZone) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

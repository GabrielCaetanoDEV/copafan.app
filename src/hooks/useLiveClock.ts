import { useState, useEffect } from 'react';
import { Match } from '../data/copaData';

/**
 * Returns a continuously-ticking match minute for LIVE matches.
 * 
 * Between API polls (every 5 min), the clock counts up locally every second.
 * When a new API response comes in (match.minuteUpdatedAt changes), the base
 * minute is reset and counting resumes from there.
 *
 * During halftime (match.isHalftime=true), the clock is frozen at 45.
 * For FINISHED/SCHEDULED matches, returns undefined.
 */
export const useLiveClock = (match: Match): { displayMinute: number | undefined; isHalftime: boolean } => {
  const [displayMinute, setDisplayMinute] = useState<number | undefined>(match.minute);

  useEffect(() => {
    // Only tick for LIVE matches
    if (match.status !== 'LIVE') {
      setDisplayMinute(undefined);
      return;
    }

    // Halftime: freeze at 45
    if (match.isHalftime) {
      setDisplayMinute(45);
      return;
    }

    // No minute data yet
    if (match.minute === undefined) {
      setDisplayMinute(undefined);
      return;
    }

    const baseMinute = match.minute;
    const syncedAt = match.minuteUpdatedAt ?? Date.now();

    // Compute initial display minute immediately
    const compute = () => {
      const elapsed = Math.floor((Date.now() - syncedAt) / 60000);
      const computed = baseMinute + elapsed;
      // Cap: 1H can't go past 45 (would be halftime), 2H can't go past 90
      // We don't know which half from just minute, so cap at 90
      return Math.min(computed, 90);
    };

    setDisplayMinute(compute());

    // Tick every 30 seconds (accurate enough, avoids excessive renders)
    const interval = setInterval(() => {
      setDisplayMinute(compute());
    }, 30000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.status, match.isHalftime, match.minute, match.minuteUpdatedAt]);

  return {
    displayMinute,
    isHalftime: match.isHalftime ?? false,
  };
};

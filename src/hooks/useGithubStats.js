import { useEffect, useState } from 'react';

const CACHE_KEY = 'gh-stats-myanptl';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour — stays well inside the 60 req/hr unauthenticated limit

/**
 * Live repo stats for github.com/myanptl, keyed by repo name.
 * Returns {} until loaded; stays {} on rate-limit or network failure so
 * cards render cleanly without stats rather than with placeholders.
 */
export function useGithubStats() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
        setStats(cached.data);
        return;
      }
    } catch {
      // ignore bad cache
    }

    const controller = new AbortController();
    fetch('https://api.github.com/users/myanptl/repos?per_page=100', {
      signal: controller.signal,
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((repos) => {
        const data = {};
        for (const r of repos) {
          data[r.name] = {
            stars: r.stargazers_count,
            forks: r.forks_count,
            language: r.language,
            pushedAt: r.pushed_at,
          };
        }
        setStats(data);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
        } catch {
          // storage full/blocked — fine, we just refetch next visit
        }
      })
      .catch(() => {
        // rate-limited or offline — cards render without stats
      });

    return () => controller.abort();
  }, []);

  return stats;
}

export function formatPushed(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

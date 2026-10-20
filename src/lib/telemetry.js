// Live data for the datasheet. Nothing here is mocked: probes hit the real
// apps, counts come from the real registries. Every network read fails soft,
// returning null so the UI can say what it could not reach.

const GITHUB = 'https://api.github.com';
const NPM_DOWNLOADS = 'https://api.npmjs.org/downloads/point/last-month';
const NPM_REGISTRY = 'https://registry.npmjs.org';
const CACHE_MS = 10 * 60 * 1000; // GitHub allows 60 unauthenticated reads an hour per visitor
const PROBE_TIMEOUT_MS = 4000;

export function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export function timeAgo(iso, now = Date.now()) {
  const seconds = Math.max(0, (now - Date.parse(iso)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.floor(minutes)} min ago`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 60) return `${days} d ago`;
  return `${Math.floor(days / 30)} mo ago`;
}

/** First line of a commit message, without trailing punctuation noise. */
export function subject(message) {
  return (message || '').split('\n')[0].trim();
}

/**
 * One round trip to a deployed app. `no-cors` gives an opaque response, so
 * this measures reachability and time, not status codes. A cache-busting
 * query keeps the browser and CDN from answering on the app's behalf.
 */
export async function probe(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  const start = performance.now();
  try {
    await fetch(`${url}/?probe=${Date.now()}`, { mode: 'no-cors', cache: 'no-store', signal: controller.signal });
    return { ok: true, ms: Math.round(performance.now() - start) };
  } catch {
    return { ok: false, ms: null };
  } finally {
    clearTimeout(timer);
  }
}

async function cached(key, load) {
  try {
    const hit = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;
  } catch { /* storage blocked: just load */ }
  const value = await load();
  try { if (value) sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), value })); } catch { /* full or blocked */ }
  return value;
}

async function getJson(url) {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/** Repo name -> last push time, for one owner. */
export function fetchRepos(owner) {
  return cached(`gh:repos:${owner}`, async () => {
    const list = await getJson(`${GITHUB}/users/${owner}/repos?per_page=100&sort=pushed`);
    if (!Array.isArray(list)) return null;
    return Object.fromEntries(list.map((r) => [r.name, { pushedAt: r.pushed_at, url: r.html_url }]));
  });
}

/** The newest commits across the `count` most recently pushed repos. */
export function fetchRevisions(owner, repos, count = 3, limit = 7) {
  return cached(`gh:revs:${owner}`, async () => {
    const names = Object.entries(repos)
      .filter(([name]) => name !== owner) // the profile README repo is not a product
      .sort((a, b) => Date.parse(b[1].pushedAt) - Date.parse(a[1].pushedAt))
      .slice(0, count)
      .map(([name]) => name);
    const batches = await Promise.all(names.map((name) =>
      getJson(`${GITHUB}/repos/${owner}/${name}/commits?per_page=4`).then((list) =>
        (Array.isArray(list) ? list : []).map((c) => ({
          repo: name,
          sha: c.sha.slice(0, 7),
          // External data ends up in an href: only ever link back to GitHub itself.
          url: typeof c.html_url === 'string' && c.html_url.startsWith('https://github.com/') ? c.html_url : null,
          date: c.commit.author.date,
          message: subject(c.commit.message),
        })))));
    const all = batches.flat().sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    return all.length ? all.slice(0, limit) : null;
  });
}

/** Downloads over the last 30 days plus the published version, per package. */
export function fetchPackages(names) {
  return cached(`npm:${names.join(',')}`, async () => {
    const [counts, ...versions] = await Promise.all([
      getJson(`${NPM_DOWNLOADS}/${names.join(',')}`),
      ...names.map((n) => getJson(`${NPM_REGISTRY}/${n}/latest`)),
    ]);
    if (!counts) return null;
    return Object.fromEntries(names.map((n, i) => [n, {
      downloads: counts[n]?.downloads ?? null,
      version: versions[i]?.version ?? null,
    }]));
  });
}

/**
 * Round-robin probes, one app at a time so the trace reads as separate blips.
 * Pauses while the tab is hidden. Returns a stop function.
 */
export function startProbes(targets, onResult, intervalMs = 1100) {
  let index = 0;
  let timer = 0;
  let stopped = false;
  const tick = async () => {
    if (stopped) return;
    if (!document.hidden) {
      const target = targets[index % targets.length];
      index += 1;
      const result = await probe(target.url);
      if (!stopped) onResult(target, result, performance.now());
    }
    timer = setTimeout(tick, intervalMs);
  };
  tick();
  return () => { stopped = true; clearTimeout(timer); };
}

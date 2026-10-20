import { useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from 'react';
import { OWNER, systems, packages, links } from '../../data/systems';
import { fetchPackages, fetchRepos, fetchRevisions, median, startProbes, timeAgo } from '../../lib/telemetry';
import { getTheme, subscribeTheme, toggleTheme } from '../../lib/theme';
import { Scope } from './Scope';
import { Palette } from './Palette';
import { HeaderCheck } from './HeaderCheck';
import { Systems } from './Systems';
import './sheet.css';

const SAMPLES_KEPT = 16;
const ext = { target: '_blank', rel: 'noreferrer' };

// A tiny event bus so probe results reach the canvas without a React render.
function createBus() {
  const fns = new Set();
  return { on: (fn) => { fns.add(fn); return () => fns.delete(fn); }, emit: (x) => fns.forEach((fn) => fn(x)) };
}

function probesReducer(state, { id, result }) {
  const prev = state[id] || { samples: [], fails: 0 };
  return {
    ...state,
    [id]: {
      samples: result.ok ? [...prev.samples, result.ms].slice(-SAMPLES_KEPT) : prev.samples,
      fails: result.ok ? 0 : prev.fails + 1,
      ok: result.ok,
    },
  };
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  return now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false });
}

function ThemeButton() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme);
  return (
    <button type="button" className="chip" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
      {theme === 'dark' ? 'Light' : 'Dark'} <kbd>T</kbd>
    </button>
  );
}

export function Sheet() {
  const bus = useMemo(createBus, []);
  const paletteRef = useRef(() => {});
  const [probes, record] = useReducer(probesReducer, {});
  const [repos, setRepos] = useState(undefined);
  const [revisions, setRevisions] = useState(undefined);
  const [pkgs, setPkgs] = useState(undefined);
  const clock = useClock();
  const revised = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  useEffect(() => startProbes(systems, (target, result, t) => {
    record({ id: target.id, result });
    bus.emit({ t, ms: result.ms, name: target.id });
  }), [bus]);

  useEffect(() => {
    fetchRepos(OWNER).then((r) => {
      setRepos(r);
      if (r) fetchRevisions(OWNER, r).then(setRevisions); else setRevisions(null);
    });
    fetchPackages(packages.map((p) => p.name)).then(setPkgs);
  }, []);

  const all = Object.values(probes).flatMap((p) => p.samples);
  const responding = systems.filter((s) => probes[s.id]?.ok).length;
  const measured = systems.filter((s) => probes[s.id]).length;

  return (
    <div className="sheet">
      <header className="sheet__top">
        <div className="sheet__part">MP-2028</div>
        <div className="sheet__meta">
          <span>Myan Patel</span>
          <span>Westford, Massachusetts</span>
          <span className="data" aria-label="Local time in Westford">{clock} ET</span>
        </div>
        <div className="sheet__tools">
          <button type="button" className="chip" onClick={() => paletteRef.current()}>Jump to <kbd>⌘K</kbd></button>
          <ThemeButton />
        </div>
      </header>

      <div className="sheet__title">
        <h1>Product builder with integrated security testing</h1>
        <p className="sheet__doc">Datasheet MPDS-2028, revised {revised}. Every figure on this page is measured when it loads.</p>
      </div>

      <div className="sheet__intro">
        <section aria-labelledby="s1">
          <h2 id="s1"><span className="num">1</span>Features</h2>
          <ul className="list">
            <li>Builds AI products end to end on React, Supabase and Vercel</li>
            <li>{systems.length} live web apps and {packages.length} published npm packages</li>
            <li>Writes its own security tooling, for the OWASP Top 10 and the OWASP LLM Top 10</li>
            <li>Co-founder and technical lead of a nonprofit</li>
            <li>18 Anthropic Academy certifications</li>
          </ul>
        </section>
        <section aria-labelledby="s2">
          <h2 id="s2"><span className="num">2</span>Applications</h2>
          <ul className="list">
            <li>Generative AI product teams</li>
            <li>AI security and red-teaming</li>
            <li>Summer 2027 research programs and internships</li>
          </ul>
        </section>
        <section aria-labelledby="s3">
          <h2 id="s3"><span className="num">3</span>Description</h2>
          <p>
            The MP-2028 is Myan Patel, a junior at Westford Academy, class of 2028. He builds AI
            products and then tests them the way an attacker would. Current work is{' '}
            <a href={systems[0].url} {...ext}>FocusOS</a>, a study app built around a real attention
            span, and the technical side of <a href={systems[1].url} {...ext}>NYE Media</a>, a
            nonprofit he co-founded for high school builders.
          </p>
        </section>
      </div>

      <figure className="figure">
        <div className="figure__screen">
          <Scope bus={bus} />
        </div>
        <div className="figure__readout data" aria-live="polite">
          <span>CH1 round trip</span>
          <span>median {median(all) ?? '...'} ms</span>
          <span>samples {all.length}</span>
          <span>responding {measured ? `${responding}/${systems.length}` : '...'}</span>
        </div>
        <figcaption>
          Figure 1. Round-trip time from your browser to each deployed system, probed one at a time.
          Each pulse is a real reply; its height is how long it took.
        </figcaption>
      </figure>

      <Systems probes={probes} repos={repos} />

      <div className="sheet__pair">
        <section className="sheet__block" aria-labelledby="s5a">
          <h2 id="s5a"><span className="num">5</span>Published packages</h2>
          <table className="table">
            <caption>Table 2. From the npm registry. Downloads over the last 30 days.</caption>
            <thead><tr><th scope="col">Package</th><th scope="col">Function</th><th scope="col" className="r">Version</th><th scope="col" className="r">Downloads</th></tr></thead>
            <tbody>
              {packages.map((p) => {
                const d = pkgs?.[p.name];
                return (
                  <tr key={p.name}>
                    <td><a href={`https://www.npmjs.com/package/${p.name}`} {...ext}>{p.name}</a></td>
                    <td>{p.what}</td>
                    <td className="data r">{pkgs === undefined ? <span className="skeleton" /> : d?.version ?? 'n/a'}</td>
                    <td className="data r">{pkgs === undefined ? <span className="skeleton" /> : d?.downloads?.toLocaleString() ?? 'n/a'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {pkgs === null && <p className="note">The npm registry did not answer. Counts will show on the next load.</p>}
        </section>

        <HeaderCheck />
      </div>

      <section className="sheet__block" aria-labelledby="s7">
        <h2 id="s7"><span className="num">7</span>Revision history</h2>
        <table className="table">
          <caption>Table 4. The latest commits across the most recently pushed repositories, from GitHub.</caption>
          <thead><tr><th scope="col">Date</th><th scope="col">Repository</th><th scope="col">Commit</th><th scope="col">Change</th></tr></thead>
          <tbody>
            {revisions === undefined && [0, 1, 2, 3].map((i) => (
              <tr key={i}><td><span className="skeleton" /></td><td><span className="skeleton" /></td><td><span className="skeleton" /></td><td><span className="skeleton skeleton--wide" /></td></tr>
            ))}
            {revisions?.map((r) => (
              <tr key={`${r.repo}-${r.sha}`}>
                <td className="data nowrap">{timeAgo(r.date)}</td>
                <td>{r.repo}</td>
                <td className="data">{r.url ? <a href={r.url} {...ext}>{r.sha}</a> : r.sha}</td>
                <td>{r.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {revisions === null && <p className="note">GitHub did not answer, or this browser hit its hourly limit of 60 requests. Try again later.</p>}
      </section>

      <footer className="sheet__foot">
        <span>MP-2028</span>
        <span>No cookies and no analytics. Your browser fetched every number here directly from the apps, GitHub and npm.</span>
        <ul>
          {links.map((l) => <li key={l.label}><a href={l.href} {...ext}>{l.label}</a></li>)}
        </ul>
      </footer>

      <Palette openRef={paletteRef} />
    </div>
  );
}

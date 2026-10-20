import { OWNER, systems } from '../../data/systems';
import { median, timeAgo } from '../../lib/telemetry';

const ext = { target: '_blank', rel: 'noreferrer' };

// The last few round trips for one system, drawn as a step line.
function Trace({ samples }) {
  if (samples.length < 2) return <span className="skeleton skeleton--trace" />;
  const max = Math.max(400, ...samples);
  const w = 88;
  const h = 18;
  const step = w / (samples.length - 1);
  const points = samples.map((ms, i) => `${(i * step).toFixed(1)},${(h - (ms / max) * h).toFixed(1)}`).join(' ');
  return (
    <svg className="trace" viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Status({ probe }) {
  if (!probe) return <span className="state state--wait">probing</span>;
  if (probe.ok) return <span className="state state--ok">up</span>;
  return <span className="state state--down">{probe.fails > 1 ? 'down' : 'no reply'}</span>;
}

export function Systems({ probes, repos }) {
  return (
    <section className="sheet__block" aria-labelledby="s4">
      <h2 id="s4"><span className="num">4</span>Deployed systems</h2>
      <div className="table-wrap">
        <table className="table table--systems">
          <caption>Table 1. Each row is probed live from your browser. Last push is from GitHub.</caption>
          <thead>
            <tr>
              <th scope="col">System</th>
              <th scope="col">Function</th>
              <th scope="col">Status</th>
              <th scope="col" className="r">Median RTT</th>
              <th scope="col">Last {16} trips</th>
              <th scope="col">Last push</th>
              <th scope="col">Source</th>
            </tr>
          </thead>
          <tbody>
            {systems.map((s) => {
              const p = probes[s.id];
              const repo = s.repo && repos?.[s.repo];
              const ms = p ? median(p.samples) : null;
              return (
                <tr key={s.id}>
                  <th scope="row"><a href={s.url} {...ext}>{s.name}</a></th>
                  <td>{s.what}</td>
                  <td><Status probe={p} /></td>
                  <td className="data r">{ms !== null ? `${ms} ms` : p && !p.ok ? 'none' : <span className="skeleton" />}</td>
                  <td><Trace samples={p?.samples ?? []} /></td>
                  <td className="data nowrap">
                    {!s.repo ? 'n/a' : repos === undefined ? <span className="skeleton" /> : repo ? timeAgo(repo.pushedAt) : 'n/a'}
                  </td>
                  <td className="data">
                    {s.repo ? <a href={`https://github.com/${OWNER}/${s.repo}`} {...ext}>{s.repo}</a> : 'not public'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

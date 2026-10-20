import { useEffect, useState } from 'react';

// Section 6. The page reads its own response headers and reports which
// security headers it sends. On the dev server none are set; Vercel adds
// them in production from vercel.json, so the table says which it is.

const HEADERS = [
  ['content-security-policy', 'Content-Security-Policy'],
  ['strict-transport-security', 'Strict-Transport-Security'],
  ['x-content-type-options', 'X-Content-Type-Options'],
  ['x-frame-options', 'X-Frame-Options'],
  ['referrer-policy', 'Referrer-Policy'],
  ['permissions-policy', 'Permissions-Policy'],
];

export function HeaderCheck() {
  const [found, setFound] = useState(null);
  const local = /^(localhost|127\.|\[::1\])/.test(location.hostname);

  useEffect(() => {
    fetch(location.href, { method: 'HEAD', cache: 'no-store' })
      .then((res) => setFound(Object.fromEntries(HEADERS.map(([key]) => [key, res.headers.get(key)]))))
      .catch(() => setFound({}));
  }, []);

  const sent = found ? HEADERS.filter(([key]) => found[key]).length : 0;

  return (
    <section className="sheet__block" aria-labelledby="s6">
      <h2 id="s6"><span className="num">6</span>Security headers on this page</h2>
      <table className="table">
        <caption>
          Table 3. Read from this page's own response just now.
          {local && ' This is the local dev server, which sets none; production adds them from vercel.json.'}
        </caption>
        <thead><tr><th scope="col">Header</th><th scope="col">Sent</th></tr></thead>
        <tbody>
          {HEADERS.map(([key, label]) => (
            <tr key={key}>
              <td>{label}</td>
              <td className="data">
                {found === null ? <span className="skeleton" /> : found[key]
                  ? <span className="state state--ok">yes</span>
                  : <span className="state state--off">no</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {found && <p className="note">{sent} of {HEADERS.length} sent.</p>}
    </section>
  );
}

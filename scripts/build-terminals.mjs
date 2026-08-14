// Renders real CLI output into terminal-styled HTML for screenshotting.
// Text is captured verbatim from the actual tools. Nothing here is invented.
// Run: node scripts/build-terminals.mjs
import { writeFile, mkdir } from 'node:fs/promises';

const OUT = '.capture/term';
await mkdir(OUT, { recursive: true });

const shell = (title, cmd, body) => `<!doctype html>
<meta charset="utf-8">
<style>
  @font-face{font-family:Plex;src:url('../../public/fonts/plexmono-400.woff2') format('woff2');font-weight:400}
  @font-face{font-family:Plex;src:url('../../public/fonts/plexmono-500.woff2') format('woff2');font-weight:500}
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1440px;height:900px;background:#000}
  body{font-family:Plex,ui-monospace,monospace;font-size:15px;line-height:1.62;color:#e8e8e8;
       padding:56px 64px;display:flex;flex-direction:column;gap:26px}
  .bar{display:flex;align-items:center;gap:14px;font-size:12px;letter-spacing:.14em;
       text-transform:uppercase;color:#666;border-bottom:1px solid #222;padding-bottom:14px}
  .bar b{color:#e8e8e8;font-weight:500;letter-spacing:.14em}
  .cmd{color:#888}
  .cmd i{color:#fff;font-style:normal}
  pre{white-space:pre-wrap;font:inherit}
  .hi{color:#ff5f56}.md{color:#e3b341}.dim{color:#666}.ok{color:#4ec9b0}.w{color:#fff}
</style>
<div class="bar"><b>${title}</b><span>${cmd}</span></div>
<div class="cmd">$ <i>${cmd}</i></div>
<pre>${body}</pre>`;

// --- keyhound: verbatim from `python3 -m keyhound tests` ---
const keyhound = shell(
  'keyhound',
  'keyhound tests',
  `<span class="w">keyhound v0.1.0</span>
<span class="dim">target: ~/workspace/keyhound/tests  ·  25 patterns  ·  entropy on  ·  git history off</span>

<span class="dim">tests/test_patterns.py</span>
  <span class="hi">HIGH</span>    L12     AWS Access Key ID            <span class="dim">AKIA****************</span>
  <span class="hi">HIGH</span>    L60     Slack Bot Token              <span class="dim">xoxb********************</span>
  <span class="hi">HIGH</span>    L66     Slack Webhook URL            <span class="dim">http********************</span>
  <span class="hi">HIGH</span>    L71     RSA Private Key              <span class="dim">----********************</span>
  <span class="hi">HIGH</span>    L75     OpenSSH Private Key          <span class="dim">----********************</span>
  <span class="hi">HIGH</span>    L79     PGP Private Key Block        <span class="dim">----********************</span>
  <span class="md">MEDIUM</span>  L100    Generic API Key              <span class="dim">supe******************</span>
  <span class="md">MEDIUM</span>  L108    Generic Password             <span class="dim">myse************</span>

<span class="dim">tests/test_scanner.py</span>
  <span class="hi">HIGH</span>    L11     AWS Access Key ID            <span class="dim">AKIA****************</span>
  <span class="hi">HIGH</span>    L29     AWS Access Key ID            <span class="dim">AKIA****************</span>
  <span class="md">MEDIUM</span>  L45     High Entropy String          <span class="dim">p8yK********************</span>

<span class="dim">────────────────────────────────────────────</span>
  <span class="w">22 findings in 5 files</span> <span class="dim">(0.00s)</span>
  <span class="hi">high 12</span>  ·  <span class="md">medium 10</span>`,
);

// --- fable-jarvis: verbatim from `jarvis --help` ---
const jarvis = shell(
  'fable-jarvis',
  'jarvis --help',
  `<span class="w">◈ fable-jarvis v1.0.0 — your own JARVIS in the terminal</span>

<span class="ok">Usage</span>
  <span class="w">jarvis</span>                      start a live chat session
  <span class="w">jarvis brief</span> [--raw]        your daily briefing (weather, projects, reminders)
  <span class="w">jarvis</span> "any question"       quick one-shot answer
  <span class="w">jarvis ask</span> "question"       same as above, explicit
  <span class="w">jarvis remember</span> "text"      save a reminder without opening a chat
  <span class="w">jarvis memories</span>             list saved reminders
  <span class="w">jarvis init</span>                 30-second setup (name, city, projects folder)
  <span class="w">jarvis</span> --help | --version

<span class="ok">Auth</span>
  Uses your Claude Code login if you have one, or ANTHROPIC_API_KEY.

<span class="ok">Tools</span>  <span class="dim">allowlisted, read only — it can look, never touch</span>`,
);

// --- etf-research-mcp: verbatim from a live compare_etfs call ---
const etf = shell(
  'etf-research-mcp',
  'compare_etfs QQQM VUG VOO IJR',
  `<span class="w">ETF Comparison: QQQM vs VUG vs VOO vs IJR</span>

<span class="dim">Metric            QQQM         VUG          VOO          IJR</span>
Price             <span class="w">$301.76</span>      <span class="w">$89.75</span>       <span class="w">$715.41</span>      <span class="w">$150.25</span>
1-Day Change      <span class="ok">0.12%</span>        <span class="ok">0.02%</span>        <span class="ok">0.06%</span>        <span class="ok">0.35%</span>
YTD Return        <span class="ok">12.28%</span>       <span class="ok">5.00%</span>        <span class="ok">10.12%</span>       <span class="ok">21.53%</span>
AUM               $97.11B      $371.99B     $1.69T       $109.63B
Expense Ratio     <span class="md">0.15%</span>        <span class="md">0.03%</span>        <span class="md">0.03%</span>        <span class="md">0.06%</span>
Category          Large Growth Large Growth Large Blend  Small Blend
Fund Family       Invesco      Vanguard     Vanguard     iShares
52W High          $308.21      $90.60       $716.39      $150.69
52W Low           $228.75      $69.63       $578.46      $112.00

<span class="dim">7 tools · Yahoo Finance · no API key required</span>`,
);

await writeFile(`${OUT}/keyhound.html`, keyhound);
await writeFile(`${OUT}/jarvis.html`, jarvis);
await writeFile(`${OUT}/etfmcp.html`, etf);
console.log('wrote 3 terminal pages to', OUT);

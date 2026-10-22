import { useEffect, useRef, useState } from 'react';
import { profile } from '../../data/profile';
import { etf, workIndex } from '../../data/work';
import { experience, recognition } from '../../data/resume';
import { motionReel, motionSites } from '../../data/motion';
import { Mosaic } from './Mosaic';
import { ThemeToggle } from './ThemeToggle';
import './home.css';

const ext = { target: '_blank', rel: 'noopener noreferrer' };

function Section({ id, title, children }) {
  return (
    <section className="block" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  );
}

// Real downloads for the last 30 days, straight from the npm registry. If the
// request fails the sentence is simply left out.
function useMonthlyDownloads(pkg) {
  const [count, setCount] = useState(null);
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`https://api.npmjs.org/downloads/point/last-month/${pkg}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && Number.isInteger(d.downloads)) setCount(d.downloads); })
      .catch(() => {});
    return () => ctrl.abort();
  }, [pkg]);
  return count;
}

// Plays while on screen, pauses when scrolled away, so nothing downloads until
// someone gets this far down.
function Clip({ slug, name }) {
  const ref = useRef(null);
  useEffect(() => {
    const video = ref.current;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.4 });
    io.observe(video);
    return () => io.disconnect();
  }, []);
  return (
    <figure className="clip">
      <video
        ref={ref}
        src={`/motion/${slug}.mp4`}
        poster={`/motion/${slug}.jpg`}
        width="1280"
        height="720"
        muted
        loop
        playsInline
        preload="none"
        aria-label={name}
      />
      <figcaption>{name}</figcaption>
    </figure>
  );
}

function Row({ name, desc, meta, href }) {
  const body = (
    <>
      <span className="row__name">{name}</span>
      {desc && <span className="row__desc">{desc}</span>}
      <span className="row__meta">{meta}</span>
    </>
  );
  const cls = desc ? 'row' : 'row row--plain';
  return <li>{href ? <a className={cls} href={href} {...ext}>{body}</a> : <div className={cls}>{body}</div>}</li>;
}

export function Home() {
  const downloads = useMonthlyDownloads(etf.pkg);

  return (
    <div className="page">
      <header className="page__head">
        <h1>Myan <em>Patel</em></h1>
        <ThemeToggle />
      </header>

      <aside className="page__art">
        <Mosaic />
      </aside>

      <main className="page__body">
        <div className="intro">
          <p>
            I'm a junior at Westford Academy in Massachusetts. Most of my free time goes into
            building stuff on the internet, usually with AI, sometimes just because it looks cool.
          </p>
          <p>
            I also invest a little, so I made <a href={etf.href} {...ext}>{etf.name}</a> to let
            Claude look up ETFs for me.
            {downloads !== null && <> It got {downloads.toLocaleString('en-US')} downloads last month.</>}
          </p>
        </div>

        <Section id="experience" title="Experience">
          <ul className="rows">
            {experience.map((e) => <Row key={e.org} name={e.org} desc={e.role} meta={e.when} href={e.href} />)}
          </ul>
        </Section>

        <Section id="projects" title="Projects">
          <ul className="rows">
            {workIndex.map((w) => <Row key={w.name} name={w.name} desc={w.role} meta={w.at} href={w.href} />)}
          </ul>
        </Section>

        <Section id="motion" title="Motion">
          <div className="clips">
            {motionReel.map((m) => <Clip key={m.slug} slug={m.slug} name={m.name} />)}
          </div>
          <ul className="rows">
            {motionSites.map((m) => <Row key={m.name} name={m.name} desc={m.role} meta="web" href={m.href} />)}
          </ul>
        </Section>

        <Section id="programs" title="Programs">
          <ul className="rows">
            {recognition.map((r) => <Row key={r.what} name={r.what} meta={r.when} />)}
          </ul>
        </Section>

        <footer className="page__foot">
          <ul className="page__links">
            {profile.links.map((l) => (
              <li key={l.label}><a href={l.href} {...ext}>{l.label.toLowerCase()}</a></li>
            ))}
          </ul>
          <span>{profile.where}</span>
        </footer>
      </main>
    </div>
  );
}

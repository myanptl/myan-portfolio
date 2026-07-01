import { TerminalHero } from './components/terminal/TerminalHero';
import { Experience } from './components/experience/Experience';
import { Projects } from './components/projects/Projects';
import { Skills } from './components/skills/Skills';
import { Credentials } from './components/credentials/Credentials';
import { Footer } from './components/layout/Footer';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <TerminalHero />
      <main id="main-content" tabIndex={-1}>
        <Experience />
        <Projects />
        <Skills />
        <Credentials />
      </main>
      <Footer />
    </>
  );
}

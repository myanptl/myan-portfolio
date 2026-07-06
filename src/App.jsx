import { CodeHero } from './components/hero/CodeHero';
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
      <div className="page-rail">
        <CodeHero />
        <main id="main-content" tabIndex={-1}>
          <Projects />
          <Experience />
          <Skills />
          <Credentials />
        </main>
      </div>
      <Footer />
    </>
  );
}

import TitleBar from './components/TitleBar.jsx';
import Hero from './components/Hero.jsx';
import Projects from './components/Projects.jsx';
import ExperienceTree from './components/ExperienceTree.jsx';
import Skills from './components/Skills.jsx';
import StatusBar from './components/StatusBar.jsx';

export default function App() {
  return (
    <div className="shell">
      <TitleBar />
      <main>
        <Hero />
        <Projects />
        <ExperienceTree />
        <Skills />
      </main>
      <StatusBar />
    </div>
  );
}

import TitleBar from './components/TitleBar.jsx';
import Hero from './components/Hero.jsx';
import Projects from './components/Projects.jsx';
import StatusBar from './components/StatusBar.jsx';

export default function App() {
  return (
    <div className="shell">
      <TitleBar />
      <main>
        <Hero />
        <Projects />
      </main>
      <StatusBar />
    </div>
  );
}

import { CONFIG } from '../config.js';
import { SKILLS } from '../data/skills.js';
import { PromptLine } from './Hero.jsx';

export default function Skills() {
  return (
    <section className="section" id="skills" aria-label="Skills">
      <PromptLine command={CONFIG.skillsCommand} />

      <h2 className="section__heading">Skills</h2>
      <p className="section__meta">
        edit src/data/skills.js to add or remove anything below
      </p>

      <div className="skills-groups">
        {SKILLS.map(({ group, items }) => (
          <div key={group} className="skills-group">
            <span className="skills-group__name">{group}/</span>
            <div className="skills">
              {items.map((s) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

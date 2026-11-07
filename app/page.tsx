import { RecognitionCard } from "@/components/recognition-card";
import { AnimatedDetails } from "@/components/animated-details";
import {
  Plus,
  Braces,
  Database,
  Cloud,
  Sparkles,
  BriefcaseBusiness,
  GraduationCap,
  Trophy,
  Users,
} from "lucide-react";
import {
  experience,
  education,
  projects,
  skillGroups,
  type ResumeEntry,
} from "@/lib/content";
import { Portrait } from "@/components/portrait";
// TODO - Restore this import when enabling the portfolio voice agent.
// import { VoiceWidget } from "@/components/voice-widget";
function Entries({ items }: { items: ResumeEntry[] }) {
  return (
    <div className="entries">
      {items.map((item) => (
        <AnimatedDetails className="entry" key={item.name}>
          <summary>
            <div
              className={
                "organization-logo logo-" +
                item.name.split(" ")[0].toLowerCase()
              }
            >
              <img src={item.logo} alt={item.name} width="120" height="48" />
            </div>
            <div className="entry-info">
              <h3>{item.name}</h3>
              <p>{item.role}</p>
              <span className="entry-date">{item.dates}</span>
            </div>
            <div className="entry-highlights">
              {item.highlights.map((highlight) => (
                <span key={highlight}>{highlight}</span>
              ))}
            </div>
            <span className="entry-action">
              <span>Read more</span>
              <Plus className="expand-icon" size={16} />
            </span>
          </summary>
          <div className="entry-detail">
            {item.courses?.length ? (
              <div className="entry-coursework">
                <p>{item.detail}</p>
                <h4 className="coursework-label">Current coursework</h4>
                {item.courses.map((course) => (
                  <section
                    className="course-focus"
                    key={course.title}
                    aria-label={course.title}
                  >
                    <h4>{course.title}</h4>
                    <ul>
                      {course.topics.map((topic) => (
                        <li key={topic}>{topic}</li>
                      ))}
                    </ul>
                    <a
                      href={course.source}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Course outline ↗
                    </a>
                  </section>
                ))}
              </div>
            ) : item.bullets?.length ? (
              <ul>
                {item.bullets.map((sentence) => (
                  <li key={sentence}>{sentence}</li>
                ))}
              </ul>
            ) : (
              <p>{item.detail}</p>
            )}
          </div>
        </AnimatedDetails>
      ))}
    </div>
  );
}
export default function Home() {
  return (
    <main id="main" className="about-page">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">
            I build.
            <br />I question.
            <br />I build better.
          </h1>
          <p className="hero-description">
            I like building things and figuring out what
            <br className="desktop-break" /> could go wrong before they ship.
          </p>
          <p className="eyebrow discipline">
            Software engineering <span>×</span> Security
          </p>
          {/* TODO - Restore the ElevenLabs voice agent UI after completing
              docs/VOICE_AGENT_TODO.md. Keep the existing implementation.
          <VoiceWidget />
          */}
        </div>
        <Portrait />
      </section>
      <div className="credentials">
        <section aria-labelledby="experience-title">
          <div className="credential-heading">
            <BriefcaseBusiness size={20} />
            <h2 id="experience-title">Experience</h2>
          </div>
          <Entries items={experience} />
        </section>
        <section aria-labelledby="education-title">
          <div className="credential-heading">
            <GraduationCap size={22} />
            <h2 id="education-title">Education</h2>
          </div>
          <Entries items={education} />
        </section>
      </div>
      <section className="work" aria-labelledby="work-title">
        <div className="section-heading">
          <h2 id="work-title">Selected work</h2>
          <span className="section-aside">A few things I’ve built</span>
        </div>
        {projects.map((project, index) => (
          <AnimatedDetails className="project" key={project.name}>
            <summary>
              <span className="project-number">0{index + 1}</span>
              <div className="project-heading">
                <h3>{project.name}</h3>
                <p>{project.label}</p>
              </div>
              <span className="project-category">
                {
                  [
                    "Learning platform",
                    "Data engineering",
                    "Route intelligence",
                  ][index]
                }
              </span>
              <span className="project-toggle">
                <Plus size={18} />
              </span>
            </summary>
            <div className="project-detail">
              <div className="project-story">
                <h4 className="project-caption">The starting point</h4>
                <p>{project.detail.split("\n\n")[0]}</p>
              </div>
              <div className="project-outcome">
                {index === 0 && (
                  <dl className="project-metrics">
                    <div>
                      <dt>6</dt>
                      <dd>professors used it in class</dd>
                    </div>
                    <div>
                      <dt>63+</dt>
                      <dd>students prepared for a quiz</dd>
                    </div>
                  </dl>
                )}
                <h4 className="project-caption">
                  {index === 0
                    ? "Beyond the project report"
                    : index === 1
                      ? "What I learned"
                      : "What we built"}
                </h4>
                <p>{project.detail.split("\n\n")[1]}</p>
              </div>
              <ul
                className="project-stack"
                aria-label={`${project.name} technologies`}
              >
                {project.stack.split(" · ").map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            </div>
          </AnimatedDetails>
        ))}
      </section>
      <section className="skills" aria-labelledby="skills-title">
        <div className="toolkit-heading">
          <h2 id="skills-title">Tools I work with</h2>
        </div>
        <div className="skills-grid">
          {skillGroups.map((group, index) => {
            const Icon = [Braces, Database, Cloud, Sparkles][index];
            return (
              <section
                className="skill-group"
                key={group.name}
                aria-labelledby={`skill-group-${index}`}
              >
                <div className="skill-group-top">
                  <Icon size={24} strokeWidth={1.4} />
                  <span>0{index + 1}</span>
                </div>
                <h3 id={`skill-group-${index}`}>{group.name}</h3>
                <ul className="skill-tags">
                  {group.tools.split(", ").map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>
      <section className="recognition" aria-labelledby="recognition-title">
        <div className="section-heading recognition-heading">
          <h2 id="recognition-title">Leadership & recognition</h2>
        </div>
        <div className="recognition-grid">
          <RecognitionCard title="E-Cell leadership" story="Led fundraising and sponsorship efforts for E-Cell at RV University and helped run two events, including Hack to a Hackathon. The event connected students with industry experts to explore real-world problems and develop ideas for the Smart India Hackathon.">
            <div className="recognition-card-top">
              <Users size={24} strokeWidth={1.5} aria-hidden="true" />
              <span>Leadership</span>
            </div>
            <h3>Vice President</h3>
            <p className="recognition-focus">Sponsorship & Fundraising</p>
            <div className="recognition-meta">
              <strong>E-Cell · RV University</strong>
              <span>Mar 2023 – Feb 2024</span>
            </div>
          </RecognitionCard>
          <RecognitionCard award title="IEEE CCEM proposal winner" story="Built an IoT-based smart dustbin that prevents the lid from opening when the bin is full and sends collection alerts to the owner and government officials. The system was designed to help prevent overflowing bins and support timely waste collection.">
            <div className="recognition-card-top">
              <Trophy size={24} strokeWidth={1.5} aria-hidden="true" />
              <span>Recognition · 2023</span>
            </div>
            <h3>Proposal Winner</h3>
            <p className="recognition-focus">Student Project Showcase</p>
            <div className="recognition-meta">
              <strong>IEEE CCEM 2023</strong>
            </div>
          </RecognitionCard>
        </div>
      </section>
    </main>
  );
}

import { useEffect } from 'react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import {
  OTHER_CALFA_PROJECTS,
  SITE,
} from '../config/site'

import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { getDomain } from '../utils/format'


/* =========================================================
   Sections
   Placeholder text: replace the lorem ipsum before release.
   ========================================================= */

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'

const LOREM_SHORT =
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'

const SECTIONS = [
  { id: 'project', title: 'Project' },
  { id: 'sources', title: 'Sources' },
  { id: 'methodology', title: 'Methodology' },
  { id: 'team', title: 'Team' },
  { id: 'citation', title: 'Citation' },
  { id: 'contact', title: 'Contact' },
  { id: 'other-projects', title: 'Other Calfa heritage projects' },
] as const

const TEAM = [
  { name: 'Lorem Ipsum', role: 'Dolor sit amet' },
  { name: 'Consectetur Adipiscing', role: 'Sed do eiusmod' },
  { name: 'Tempor Incididunt', role: 'Ut labore et dolore' },
]


export default function AboutPage() {
  const { section } = useParams()

  useDocumentTitle('About')

  useEffect(() => {
    const target =
      section
        ? document.getElementById(section)
        : null

    if (target) {
      target.scrollIntoView({
        block: 'start',
      })
    } else {
      window.scrollTo({ top: 0 })
    }
  }, [section])

  return (
    <main className="page about-page">

      <header className="about-header">
        <h1>About</h1>

        <p className="hero-description">
          {SITE.subtitle}
        </p>
      </header>

      <div className="about-layout">

        <nav
          className="about-toc"
          aria-label="About sections"
        >
          <ul>
            {SECTIONS.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/about/${item.id}`}
                  aria-current={
                    section === item.id
                      ? 'location'
                      : undefined
                  }
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="about-content">

          <section id="project" className="about-section">
            <h2>Project</h2>
            <p>{LOREM}</p>
            <p>{LOREM_SHORT}</p>
          </section>

          <section id="sources" className="about-section">
            <h2>Sources</h2>
            <p>{LOREM}</p>

            <ul>
              <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
              <li>Sed do eiusmod tempor incididunt ut labore et dolore.</li>
              <li>Ut enim ad minim veniam, quis nostrud exercitation.</li>
            </ul>
          </section>

          <section id="methodology" className="about-section">
            <h2>Methodology</h2>
            <p>{LOREM}</p>
            <p>{LOREM_SHORT}</p>
          </section>

          <section id="team" className="about-section">
            <h2>Team</h2>

            <ul className="about-team">
              {TEAM.map((member) => (
                <li key={member.name}>
                  <strong>{member.name}</strong>
                  <span>{member.role}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="citation" className="about-section">
            <h2>Citation</h2>
            <p>{LOREM_SHORT}</p>

            <blockquote className="about-citation">
              Lorem ipsum dolor sit amet. <i>{SITE.title}</i>.
              Consectetur adipiscing elit, 2026. {SITE.url}
            </blockquote>
          </section>

          <section id="contact" className="about-section">
            <h2>Contact</h2>
            <p>{LOREM_SHORT}</p>
          </section>

          <section id="other-projects" className="about-section">
            <h2>Other Calfa heritage projects</h2>

            <ul className="about-projects">
              {OTHER_CALFA_PROJECTS.map((project) => (
                <li key={project.url}>
                  <span className="project-logo">
                    <img
                      src={`${import.meta.env.BASE_URL}${project.logo}`}
                      alt=""
                    />
                  </span>

                  <div>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener"
                    >
                      {project.name}
                    </a>

                    <span>
                      {getDomain(project.url)}
                    </span>

                    <p>
                      {project.description.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

        </div>

      </div>

    </main>
  )
}

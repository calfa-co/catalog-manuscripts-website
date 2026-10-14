import { useEffect } from 'react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import {
  COLLECTION_CODES,
  COLLECTIONS,
} from '../config/collections'

import {
  OTHER_CALFA_PROJECTS,
  SITE,
} from '../config/site'

import {
  DIGITAL_LIBRARY,
  PRINTED_CATALOGUES,
} from '../config/sources'

import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { getDomain } from '../utils/format'


/* =========================================================
   Sections
   ========================================================= */

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
  { name: 'Chahan Vidal-Gorène', role: 'Project leader', affiliation: 'Calfa' },
  { name: 'Ani Tanelian', role: 'Project and data manager', affiliation: 'Calfa' },
  { name: 'Anahide Kasparian', role: 'Project and data manager', affiliation: 'Calfa' },
  { name: 'Edita Matevosyan', role: 'IT and ML engineer', affiliation: 'Calfa · UFAR' },
  { name: 'Seda Kirakosyan', role: 'IT and ML engineer', affiliation: 'Calfa · UFAR' },
]

const DATA_REPOSITORIES_URL =
  'https://github.com/orgs/calfa-co/repositories?q=catalog-manuscripts'

const CONTACT_URL = 'https://calfa.fr/contact'

/* A record whose scan shows the printed page number. */
const CITATION_EXAMPLE =
  'Norair Bogharian, Grand Catalogue of St. James Manuscripts, vol. 1 (Jerusalem, 1966), p. 42, no. 2. ' +
  `${SITE.title}, Calfa, record J2, ${SITE.url}/#/manuscript/J2 (accessed 14 October 2026).`


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
          This site offers a searchable version of the printed
          catalogues of the Armenian manuscripts of Jerusalem,
          Vienna and Venice. It also serves as a basis for
          enriching the records over time: the platform is built
          for collaborative correction, and any field can be
          reported from its record. All the data are openly
          available on{' '}
          <a
            href={DATA_REPOSITORIES_URL}
            target="_blank"
            rel="noopener"
          >
            GitHub
          </a>
          .
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

            <p>
              The printed catalogues of the Armenian Patriarchate
              of Jerusalem and of the Mekhitarist Congregations of
              Vienna and Venice describe several thousand
              manuscripts: their contents, scribes, places and
              dates of copying, colophons, decoration and bindings.
              They remain the main reference for these
              collections, but can only be searched page by page.
            </p>

            <p>
              Calfa machine-read these catalogues and turned each
              description into a structured record. The site has
              three aims:
            </p>

            <ul>
              <li>
                to make the information in the printed catalogues
                easy to search and browse;
              </li>
              <li>
                to provide a lasting basis on which the records can
                be corrected and enriched over time, collaboratively;
              </li>
              <li>
                to make the data openly available for research, in
                one GitHub repository per collection:{' '}
                {COLLECTION_CODES.map((code, index) => (
                  <span key={code}>
                    {index > 0 ? ', ' : ''}
                    <a
                      href={COLLECTIONS[code].repository}
                      target="_blank"
                      rel="noopener"
                    >
                      {COLLECTIONS[code].name}
                    </a>
                  </span>
                ))}
                .
              </li>
            </ul>

            <p>
              The edition rests above all on the work of the
              compilers of the printed catalogues (see{' '}
              <Link to="/about/sources">Sources</Link>). Any use
              of a digital record must cite the printed catalogue
              as well as the record consulted (see{' '}
              <Link to="/about/citation">Citation</Link>).
            </p>
          </section>

          <section id="sources" className="about-section">
            <h2>Sources</h2>

            <p>
              The records are compiled from the printed catalogues
              listed below, as read off their title pages.
              Digitised copies of the volumes are available from
              the{' '}
              <a
                href={DIGITAL_LIBRARY.url}
                target="_blank"
                rel="noopener"
              >
                {DIGITAL_LIBRARY.name}
              </a>
              .
            </p>

            {PRINTED_CATALOGUES.map((catalogue) => {
              const collection =
                COLLECTIONS[catalogue.collection]

              return (
                <div
                  key={catalogue.collection}
                  className="about-catalogue"
                >
                  <h3>
                    {collection.name}
                    <span>{collection.institution}</span>
                  </h3>

                  <p className="about-catalogue-title">
                    <span lang="hy">{catalogue.title}</span>
                    {catalogue.parallelTitle && (
                      <>
                        {' = '}
                        <i>{catalogue.parallelTitle}</i>
                      </>
                    )}
                    {catalogue.translation && (
                      <> [{catalogue.translation}]</>
                    )}
                    . {catalogue.imprint}.
                  </p>

                  <div className="about-volumes-wrapper">
                    <table className="about-volumes">
                      <thead>
                        <tr>
                          <th scope="col">Vol.</th>
                          <th scope="col">Compiler</th>
                          <th scope="col">Year</th>
                          <th scope="col">Digitised copy</th>
                        </tr>
                      </thead>

                      <tbody>
                        {catalogue.volumes.map((volume) => (
                          <tr key={volume.volume}>
                            <td>{volume.volume}</td>
                            <td>{volume.compiler}</td>
                            <td>{volume.year}</td>
                            <td>
                              {volume.url ? (
                                <a
                                  href={volume.url}
                                  target="_blank"
                                  rel="noopener"
                                  aria-label={`Digitised copy of ${collection.name} volume ${volume.volume}`}
                                >
                                  View ↗
                                </a>
                              ) : (
                                <>
                                  <span aria-hidden="true">—</span>
                                  <span className="sr-only">None</span>
                                </>
                              )}

                              {volume.note && (
                                <span className="about-volume-note">
                                  {volume.note}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </section>

          <section id="methodology" className="about-section">
            <h2>Methodology</h2>

            <p>
              The records were extracted from scans of the printed
              volumes with a pipeline developed by Calfa. Models
              specialised in printed Armenian analyse the layout of
              each page and read its text; a vision-language model
              built by Calfa then structures each description into
              fields: title, date, scribe, place of copying,
              contents, colophon, decoration, binding, and so on.
            </p>

            <p>
              Errors remain, especially where the scans are of poor
              quality: confusions between similar letters, missing
              lines, or text placed in the wrong field. The scan of
              the printed page, shown next to each record, remains
              the reference.
            </p>

            <p>
              The platform is also a proofreading tool. Any field
              can be reported from its record; reports are filed as
              issues on the GitHub repository of the collection,
              and every correction is checked before it is
              published.
            </p>
          </section>

          <section id="team" className="about-section">
            <h2>Team</h2>

            <ul className="about-team">
              {TEAM.map((member) => (
                <li key={member.name}>
                  <strong>{member.name}</strong>
                  <span>
                    {member.role} · {member.affiliation}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section id="citation" className="about-section">
            <h2>Citation</h2>

            <p>
              Cite the printed catalogue first, with the volume and
              the page shown on the scan, then the digital record
              with its address and the date you consulted it:
            </p>

            <blockquote className="about-citation">
              {CITATION_EXAMPLE}
            </blockquote>

            <p>
              To cite the site as a whole:
            </p>

            <blockquote className="about-citation">
              Calfa. <i>{SITE.title}</i>. {SITE.subtitle}. 2026.{' '}
              {SITE.url}
            </blockquote>
          </section>

          <section id="contact" className="about-section">
            <h2>Contact</h2>

            <p>
              To correct a record, use “Report a typo or error” on
              its page, or the report link next to any field. For
              any other question about the project, write to Calfa
              through{' '}
              <a
                href={CONTACT_URL}
                target="_blank"
                rel="noopener"
              >
                {getDomain(CONTACT_URL)}/contact
              </a>
              .
            </p>
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

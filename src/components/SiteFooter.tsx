import { Link } from 'react-router-dom'

import CalfaCredit from './CalfaCredit'

import { COLLECTIONS } from '../config/collections'
import {
  OTHER_CALFA_PROJECTS,
  SITE,
} from '../config/site'
import { getDomain } from '../utils/format'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">

        <div className="footer-columns">

          <section
            className="footer-projects"
            aria-labelledby="footer-projects"
          >
            <h2 id="footer-projects">
              Other Calfa heritage projects
            </h2>

            <ul>
              {OTHER_CALFA_PROJECTS.map(
                (project) => (
                  <li key={project.url}>
                    <a
                      className="footer-project"
                      href={project.url}
                      target="_blank"
                      rel="noopener"
                    >
                      <span className="project-logo">
                        <img
                          src={`${import.meta.env.BASE_URL}${project.logo}`}
                          alt=""
                        />
                      </span>

                      <span className="footer-project-text">
                        <strong>{project.name}</strong>

                        <span>
                          {getDomain(project.url)} ↗
                        </span>
                      </span>
                    </a>
                  </li>
                ),
              )}
            </ul>
          </section>

          <nav aria-labelledby="footer-data">
            <h2 id="footer-data">
              Data repositories
            </h2>

            <ul>
              {Object.values(COLLECTIONS).map(
                (collection) => (
                  <li key={collection.code}>
                    <a
                      href={collection.repository}
                      target="_blank"
                      rel="noopener"
                    >
                      {collection.name}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <nav aria-labelledby="footer-site">
            <h2 id="footer-site">
              Site
            </h2>

            <ul>
              <li>
                <Link to="/">Catalogue</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/about/citation">
                  How to cite
                </Link>
              </li>
            </ul>
          </nav>

        </div>

        <div className="footer-line">
          <span>
            <i>{SITE.title}</i>
          </span>

          <CalfaCredit />
        </div>

      </div>
    </footer>
  )
}

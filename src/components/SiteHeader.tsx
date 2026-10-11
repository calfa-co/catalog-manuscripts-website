import {
  Link,
  useLocation,
} from 'react-router-dom'

import { SITE } from '../config/site'

export default function SiteHeader() {
  const { pathname } =
    useLocation()

  const onAbout =
    pathname.startsWith('/about')

  const calfaLogo =
    `${import.meta.env.BASE_URL}brand/calfa.png`

  return (
    <header className="site-header">
      <div className="site-header-inner">

        <Link
          to="/"
          className="brand"
        >
          <img
            src={calfaLogo}
            alt=""
            className="calfa-logo"
          />

          <div className="brand-text">
            <strong>{SITE.title}</strong>

            <span>
              {SITE.subtitle}
            </span>
          </div>
        </Link>

        <nav
          className="site-nav"
          aria-label="Main navigation"
        >
          <Link
            to="/"
            className={
              onAbout ? undefined : 'active'
            }
            aria-current={
              pathname === '/'
                ? 'page'
                : undefined
            }
          >
            Catalogue
          </Link>

          <Link
            to="/about"
            className={
              onAbout ? 'active' : undefined
            }
            aria-current={
              pathname === '/about'
                ? 'page'
                : undefined
            }
          >
            About
          </Link>
        </nav>

      </div>
    </header>
  )
}

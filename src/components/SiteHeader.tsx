import {
  Link,
  useLocation,
} from 'react-router-dom'

import CalfaCredit from './CalfaCredit'
import CatalogMark from './CatalogMark'

import { SITE } from '../config/site'

export default function SiteHeader() {
  const { pathname } =
    useLocation()

  const onAbout =
    pathname.startsWith('/about')

  return (
    <header className="site-header">
      <div className="site-header-inner">

        <Link
          to="/"
          className="brand"
        >
          <CatalogMark
            className="brand-mark"
          />

          <span className="brand-text">
            <strong>{SITE.title}</strong>

            <span>
              {SITE.subtitle}
            </span>
          </span>
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

        <CalfaCredit className="header-credit" />

      </div>
    </header>
  )
}

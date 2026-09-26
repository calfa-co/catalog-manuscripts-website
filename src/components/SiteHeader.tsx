import { Link } from 'react-router-dom'

export default function SiteHeader() {
  const calfaLogo =
    `${import.meta.env.BASE_URL}brand/calfa.png`

  return (
    <header className="site-header">
      <div className="site-header-inner">

        <Link
          to="/"
          className="brand"
          aria-label="CALFA Manuscript Catalogue"
        >
          <img
            src={calfaLogo}
            alt=""
            className="calfa-logo"
          />

          <div className="brand-text">
            <strong>CALFA</strong>

            <span>
              Armenian Manuscript Catalogue
            </span>
          </div>
        </Link>

        <nav
          className="site-nav"
          aria-label="Main navigation"
        >
          <Link to="/">
            Catalogue
          </Link>
        </nav>

      </div>
    </header>
  )
}
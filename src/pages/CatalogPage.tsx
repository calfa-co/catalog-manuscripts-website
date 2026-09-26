import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import {
  COLLECTIONS,
} from '../config/collections'

import {
  getJerusalemCatalog,
} from '../services/catalog'

import type {
  Catalog,
  CatalogRecord,
} from '../types/catalog'

function displayDate(
  record: CatalogRecord,
) {
  if (record.date_display) {
    return record.date_display
  }

  if (
    record.date_from &&
    record.date_to
  ) {
    if (
      record.date_from ===
      record.date_to
    ) {
      return record.date_from
    }

    return `${record.date_from}–${record.date_to}`
  }

  return (
    record.date_from ||
    record.date_to ||
    'Date unknown'
  )
}

export default function CatalogPage() {
  const [catalog, setCatalog] =
    useState<Catalog | null>(null)

  const [search, setSearch] =
    useState('')

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    getJerusalemCatalog()
      .then(setCatalog)
      .catch((err: Error) =>
        setError(err.message),
      )
  }, [])

  const filteredRecords =
    useMemo(() => {
      if (!catalog) {
        return []
      }

      const query =
        search.trim().toLowerCase()

      if (!query) {
        return catalog.records
      }

      return catalog.records.filter(
        (record) => {
          const searchableValues = [
            record.id,
            record.number,
            record.title,
            record.source,
            record.volume,
            record.date_from,
            record.date_to,
            record.date_display,
          ]

          return searchableValues.some(
            (value) => {
              if (
                value === null ||
                value === undefined
              ) {
                return false
              }

              return String(value)
                .toLowerCase()
                .includes(query)
            },
          )
        },
      )
    }, [catalog, search])

  const visibleResults =
    filteredRecords.slice(0, 100)

  return (
    <>
      <section className="hero">
        <div className="hero-inner">

          <p className="hero-kicker">
            Digital Armenian manuscript research
          </p>

          <h1>
            Armenian Manuscript Catalogue
          </h1>

          <p className="hero-description">
            Search structured catalogue records
            from major collections of Armenian
            manuscripts.
          </p>

          <div className="hero-search">
            <label
              htmlFor="catalog-search"
              className="sr-only"
            >
              Search manuscripts
            </label>

            <span
              className="search-icon"
              aria-hidden="true"
            >
              ⌕
            </span>

            <input
              id="catalog-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search by manuscript ID, title, number, date…"
              className="search-input"
              autoComplete="off"
            />
          </div>

          <p className="search-hint">
            Examples: J145, 1154,
            Մեկնութիւն
          </p>

        </div>
      </section>

      <main className="page">

        <section className="collections-section">

          <div className="section-heading">

            <div>
              <p className="section-kicker">
                Collections
              </p>

              <h2>
                Manuscript catalogues
              </h2>
            </div>

            <p className="section-description">
              Each collection retains its
              institutional identity while
              using one searchable CALFA
              interface.
            </p>

          </div>

          <div className="collection-grid">

            {Object.values(
              COLLECTIONS,
            ).map((collection) => {
              const logo =
                `${import.meta.env.BASE_URL}${collection.logo}`

              return (
                <article
                  className={
                    collection.available
                      ? 'collection-card collection-card-active'
                      : 'collection-card collection-card-disabled'
                  }
                  key={
                    collection.code
                  }
                >

                  <div className="collection-logo-area">

                    <img
                      src={logo}
                      alt={
                        collection.institution
                      }
                      className="home-collection-logo"
                    />

                  </div>

                  <div className="collection-card-content">

                    <div className="collection-title-row">

                      <h3>
                        {
                          collection.name
                        }
                      </h3>

                      <span
                        className={
                          collection.available
                            ? 'status-badge status-live'
                            : 'status-badge'
                        }
                      >
                        {collection.available
                          ? 'Available'
                          : 'Coming soon'}
                      </span>

                    </div>

                    <p className="collection-institution">
                      {
                        collection.institution
                      }
                    </p>

                    <p className="collection-description">
                      {
                        collection.description
                      }
                    </p>

                    {collection.available &&
                      catalog && (
                        <p className="collection-count">
                          {catalog.record_count.toLocaleString()}{' '}
                          records
                        </p>
                      )}

                  </div>

                </article>
              )
            })}

          </div>

        </section>

        <section
          className="catalog-section"
          id="catalog"
        >

          <div className="results-heading">

            <div>
              <p className="section-kicker">
                Jerusalem
              </p>

              <h2>
                Catalogue records
              </h2>
            </div>

            {catalog && (
              <div className="results-count">
                {search.trim()
                  ? `${filteredRecords.length.toLocaleString()} matches`
                  : `${catalog.record_count.toLocaleString()} records`}
              </div>
            )}

          </div>

          {error && (
            <div className="error-state">
              <strong>
                Catalogue unavailable
              </strong>

              <p>{error}</p>
            </div>
          )}

          {!error && !catalog && (
            <div className="loading-state">
              Loading Jerusalem
              catalogue…
            </div>
          )}

          {catalog && (
            <>
              <div className="results">

                {visibleResults.map(
                  (record) => (
                    <article
                      className="record-card"
                      key={record.id}
                    >

                      <Link
                        to={`/manuscript/${record.id}`}
                        className="record-link"
                      >
                        <div className="record-id-column">
                          <span className="record-id">
                            {record.id}
                          </span>
                        </div>

                        <div className="record-content">

                          <h3>
                            {record.title ||
                              'Untitled manuscript'}
                          </h3>

                          <div className="record-metadata">

                            <span>
                              {
                                record.source
                              }
                            </span>

                            <span
                              aria-hidden="true"
                              className="metadata-dot"
                            >
                              ·
                            </span>

                            <span>
                              No.{' '}
                              {
                                record.number
                              }
                            </span>

                            <span
                              aria-hidden="true"
                              className="metadata-dot"
                            >
                              ·
                            </span>

                            <span>
                              {displayDate(
                                record,
                              )}
                            </span>

                          </div>

                        </div>

                        <span
                          className="record-arrow"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </Link>

                    </article>
                  ),
                )}

              </div>

              {filteredRecords.length ===
                0 && (
                <div className="empty-state">

                  <h3>
                    No manuscripts found
                  </h3>

                  <p>
                    Try another manuscript
                    number, title, date or
                    identifier.
                  </p>

                </div>
              )}

              {filteredRecords.length >
                visibleResults.length && (
                <p className="results-limit">
                  Showing the first{' '}
                  {
                    visibleResults.length
                  }{' '}
                  of{' '}
                  {
                    filteredRecords.length
                  }{' '}
                  matching records.
                </p>
              )}
            </>
          )}

        </section>

      </main>
    </>
  )
}
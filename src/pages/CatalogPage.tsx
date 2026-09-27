import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import { COLLECTIONS } from '../config/collections'
import {
  getJerusalemCatalog,
  getViennaCatalog,
} from '../services/catalog'

import type {
  Catalog,
  CatalogRecord,
} from '../types/catalog'


const PAGE_SIZE = 100


interface AvailableCatalogs {
  J: Catalog
  W: Catalog
}

interface CatalogPageProps {
  collectionCode?: 'J' | 'W'
}


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

    return (
      `${record.date_from}–` +
      `${record.date_to}`
    )
  }

  return (
    record.date_from ||
    record.date_to ||
    'Date unknown'
  )
}


function getVisiblePages(
  currentPage: number,
  totalPages: number,
): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1,
    )
  }

  if (currentPage <= 4) {
    return [
      1,
      2,
      3,
      4,
      5,
      'ellipsis',
      totalPages,
    ]
  }

  if (
    currentPage >=
    totalPages - 3
  ) {
    return [
      1,
      'ellipsis',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ]
  }

  return [
    1,
    'ellipsis',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis',
    totalPages,
  ]
}


export default function CatalogPage({
  collectionCode,
}: CatalogPageProps) {
  const [
    catalogs,
    setCatalogs,
  ] = useState<
    AvailableCatalogs | null
  >(null)

  const [search, setSearch] =
    useState('')

  const [error, setError] =
    useState<string | null>(null)

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1)

  const catalogRef =
    useRef<HTMLElement | null>(null)


  useEffect(() => {
    Promise.all([
      getJerusalemCatalog(),
      getViennaCatalog(),
    ])
      .then(
        ([
          jerusalem,
          vienna,
        ]) => {
          setCatalogs({
            J: jerusalem,
            W: vienna,
          })
        },
      )
      .catch(
        (err: Error) => {
          setError(err.message)
        },
      )
  }, [])


  const allRecords =
    useMemo(() => {
      if (!catalogs) {
        return []
      }

      if (collectionCode === 'J') {
        return catalogs.J.records
      }

      if (collectionCode === 'W') {
        return catalogs.W.records
      }

      return [
        ...catalogs.J.records,
        ...catalogs.W.records,
      ]
    }, [
      catalogs,
      collectionCode,
    ])


  const totalRecordCount =
    useMemo(() => {
      if (!catalogs) {
        return 0
      }

      if (collectionCode === 'J') {
        return catalogs.J.record_count
      }

      if (collectionCode === 'W') {
        return catalogs.W.record_count
      }

      return (
        catalogs.J.record_count +
        catalogs.W.record_count
      )
    }, [
      catalogs,
      collectionCode,
    ])


  const filteredRecords =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase()

      if (!query) {
        return allRecords
      }

      return allRecords.filter(
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

          return (
            searchableValues.some(
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
          )
        },
      )
    }, [
      allRecords,
      search,
    ])


  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredRecords.length /
        PAGE_SIZE,
      ),
    )


  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages,
    )


  const startIndex =
    (
      safeCurrentPage - 1
    ) * PAGE_SIZE


  const endIndex =
    Math.min(
      startIndex + PAGE_SIZE,
      filteredRecords.length,
    )


  const visibleResults =
    filteredRecords.slice(
      startIndex,
      endIndex,
    )


  const visiblePages =
    getVisiblePages(
      safeCurrentPage,
      totalPages,
    )


  function handleSearchChange(
    value: string,
  ) {
    setSearch(value)
    setCurrentPage(1)
  }


  function changePage(
    page: number,
  ) {
    if (
      page < 1 ||
      page > totalPages ||
      page === safeCurrentPage
    ) {
      return
    }

    setCurrentPage(page)

    requestAnimationFrame(() => {
      catalogRef.current
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
    })
  }


  return (
    <>
      {/* =====================================================
          Intro
          ===================================================== */}

      <section className="catalog-intro">
        <div className="catalog-intro-inner">

          <p className="hero-kicker">
            Digital Armenian manuscript research
          </p>

          <h1>
            {collectionCode
              ? `${COLLECTIONS[collectionCode].name} Manuscript Catalogue`
              : 'Armenian Manuscript Catalogue'}
          </h1>

          <p className="hero-description">
            {collectionCode
              ? `Search the structured catalogue of Armenian manuscripts preserved in ${COLLECTIONS[collectionCode].name}.`
              : 'Search structured catalogue records from major collections of Armenian manuscripts.'}
          </p>

        </div>
      </section>


      <main className="page">

        {/* ===================================================
            Collections
            =================================================== */}

        {!collectionCode && (
        <section className="collections-section">

          <div className="section-heading">

            <div>
              <p className="section-kicker">
                Collections
              </p>

              <h2>
                Participating catalogues
              </h2>
            </div>

            <p className="section-description">
              CALFA provides one research
              interface while preserving the
              identity and provenance of each
              manuscript collection.
            </p>

          </div>


          <div className="collection-grid">

            {Object.values(
              COLLECTIONS,
            ).map(
              (collection) => {

                const logo =
                  `${import.meta.env.BASE_URL}` +
                  `${collection.logo}`

                const collectionCatalog =
                  collection.code === 'J'
                    ? catalogs?.J
                    : collection.code === 'W'
                      ? catalogs?.W
                      : null

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

                    {collection.available && (
                      <Link
                        to={`/collection/${collection.code}`}
                        className="collection-card-link-overlay"
                        aria-label={`Open ${collection.name} catalogue`}
                      />
                    )}

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
                          {collection.name}
                        </h3>

                        <span
                          className={
                            collection.available
                              ? 'status-badge status-live'
                              : 'status-badge'
                          }
                        >
                          {
                            collection.available
                              ? 'Available'
                              : 'Coming soon'
                          }
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


                      {
                        collection.available &&
                        collectionCatalog && (
                          <p className="collection-count">
                            {
                              collectionCatalog
                                .record_count
                                .toLocaleString()
                            }{' '}
                            records
                          </p>
                        )
                      }

                    </div>

                  </article>
                )
              },
            )}

          </div>

        </section>
        )}

        {collectionCode && (
          <Link
            to="/"
            className="back-link"
          >
            ← All collections
          </Link>
        )}


        {/* ===================================================
            Search + Catalogue
            =================================================== */}

        <section
          className="catalog-section"
          ref={catalogRef}
        >

          <div className="catalog-toolbar">

            <div>
              <p className="section-kicker">
                {collectionCode
                  ? COLLECTIONS[collectionCode].name
                  : 'Jerusalem + Vienna'}
              </p>

              <h2>
                Search manuscripts
              </h2>
            </div>


            {catalogs && (
              <div className="results-count">

                {search.trim()
                  ? `${filteredRecords.length.toLocaleString()} matches`
                  : `${totalRecordCount.toLocaleString()} records`
                }

              </div>
            )}

          </div>


          <div className="catalog-search-panel">

            <div className="catalog-search-box">

              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="catalog-search-icon"
              >
                <path
                  d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>


              <label
                htmlFor="catalog-search"
                className="sr-only"
              >
                Search manuscripts
              </label>


              <input
                id="catalog-search"
                type="search"
                value={search}
                onChange={
                  (event) =>
                    handleSearchChange(
                      event.target.value,
                    )
                }
                placeholder="Search by ID, title, catalogue number, date…"
                className="catalog-search-input"
                autoComplete="off"
              />


              {search && (
                <button
                  className="clear-search"
                  type="button"
                  onClick={
                    () =>
                      handleSearchChange('')
                  }
                >
                  Clear
                </button>
              )}

            </div>


            <div className="catalog-search-footer">

              <span>
                {collectionCode
                  ? `${COLLECTIONS[collectionCode].name} collection`
                  : 'Jerusalem and Vienna collections'}
              </span>

              <span className="search-examples">
                {collectionCode === 'J'
                  ? 'Try: J2, J145, 1154, Մեկնութիւն'
                  : collectionCode === 'W'
                    ? 'Try: W1, W1269, W1629, Շարակնոց'
                    : 'Try: J2, W1269, 1154, Մեկնութիւն'}
              </span>

            </div>

          </div>


          {error && (
            <div className="error-state">

              <strong>
                Catalogue unavailable
              </strong>

              <p>{error}</p>

            </div>
          )}


          {!error && !catalogs && (
            <div className="loading-state">
              Loading manuscript catalogues…
            </div>
          )}


          {catalogs &&
            filteredRecords.length > 0 && (
            <>

              <div className="catalog-page-info">

                <span>
                  Showing{' '}

                  <strong>
                    {startIndex + 1}
                  </strong>

                  {'–'}

                  <strong>
                    {endIndex}
                  </strong>

                  {' of '}

                  <strong>
                    {
                      filteredRecords.length
                        .toLocaleString()
                    }
                  </strong>

                  {' records'}
                </span>


                <span>
                  Page {safeCurrentPage} of{' '}
                  {totalPages}
                </span>

              </div>


              <div className="results">

                {visibleResults.map(
                  (record) => (

                    <article
                      className="record-card"
                      key={record.id}
                    >

                      <Link
                        to={
                          `/manuscript/${record.id}`
                        }
                        className="record-link"
                      >

                        <div className="record-id-column">

                          <span className="record-id">
                            {record.id}
                          </span>

                        </div>


                        <div className="record-content">

                          <h3>
                            {
                              record.title ||
                              'Untitled manuscript'
                            }
                          </h3>


                          <div className="record-metadata">

                            <span>
                              {record.source}
                            </span>

                            <span className="metadata-dot">
                              ·
                            </span>

                            <span>
                              No. {record.number}
                            </span>

                            <span className="metadata-dot">
                              ·
                            </span>

                            <span>
                              {
                                displayDate(
                                  record,
                                )
                              }
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


              {totalPages > 1 && (

                <nav
                  className="pagination"
                  aria-label="Catalogue pagination"
                >

                  <button
                    type="button"
                    className="pagination-navigation"
                    disabled={
                      safeCurrentPage === 1
                    }
                    onClick={
                      () =>
                        changePage(
                          safeCurrentPage - 1,
                        )
                    }
                  >
                    ← Previous
                  </button>


                  <div className="pagination-pages">

                    {visiblePages.map(
                      (page, index) => {

                        if (
                          page === 'ellipsis'
                        ) {
                          return (
                            <span
                              className="pagination-ellipsis"
                              key={
                                `ellipsis-${index}`
                              }
                            >
                              …
                            </span>
                          )
                        }


                        return (
                          <button
                            type="button"
                            key={page}
                            className={
                              page ===
                              safeCurrentPage
                                ? 'pagination-page pagination-page-active'
                                : 'pagination-page'
                            }
                            aria-current={
                              page ===
                              safeCurrentPage
                                ? 'page'
                                : undefined
                            }
                            onClick={
                              () =>
                                changePage(
                                  page,
                                )
                            }
                          >
                            {page}
                          </button>
                        )
                      },
                    )}

                  </div>


                  <button
                    type="button"
                    className="pagination-navigation"
                    disabled={
                      safeCurrentPage ===
                      totalPages
                    }
                    onClick={
                      () =>
                        changePage(
                          safeCurrentPage + 1,
                        )
                    }
                  >
                    Next →
                  </button>

                </nav>

              )}

            </>
          )}


          {catalogs &&
            filteredRecords.length === 0 && (

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

        </section>

      </main>
    </>
  )
}

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import {
  COLLECTION_CODES,
  COLLECTIONS,
  type CollectionCode,
} from '../config/collections'
import { SITE } from '../config/site'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { getCatalog } from '../services/catalog'
import {
  formatDateRange,
  MAX_DATE_LENGTH,
  shortenText,
  UNTITLED,
} from '../utils/format'
import {
  normalizeForSearch,
  SEARCH_FIELD_SEPARATOR,
} from '../utils/search'

import type {
  Catalog,
  CatalogRecord,
} from '../types/catalog'


const PAGE_SIZE = 100


const SEARCH_EXAMPLES: Record<
  CollectionCode | 'all',
  string
> = {
  all: 'Try: J2, W1269, 1154, Մեկնութիւն',
  J: 'Try: J2, J145, 1154, Մեկնութիւն',
  W: 'Try: W1, W1269, W1629, Շարակնոց',
  V: 'Try: V1300, V1181-1182, 1319, Ճառընտիր',
}


interface CatalogPageProps {
  collectionCode?: CollectionCode
}


function displayDate(
  record: CatalogRecord,
) {
  return shortenText(
    formatDateRange({
      display: record.date_display,
      from: record.date_from,
      to: record.date_to,
    }),
    MAX_DATE_LENGTH,
  )
}


function getSearchableValues(
  record: CatalogRecord,
): string[] {
  return [
    record.id,
    record.number,
    record.title,
    record.source,
    record.volume,
    record.date_from,
    record.date_to,
    record.date_display,
  ]
    .filter(
      (value) =>
        value !== null &&
        value !== undefined,
    )
    .map(String)
}


function getSearchText(
  record: CatalogRecord,
): string {
  return getSearchableValues(record)
    .map(normalizeForSearch)
    .join(SEARCH_FIELD_SEPARATOR)
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
    Partial<Record<CollectionCode, Catalog>>
  >({})

  const [
    errors,
    setErrors,
  ] = useState<
    Partial<Record<CollectionCode, string>>
  >({})

  const [search, setSearch] =
    useState('')

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1)

  const catalogRef =
    useRef<HTMLElement | null>(null)

  useDocumentTitle(
    collectionCode
      ? COLLECTIONS[collectionCode].name
      : null,
  )


  /*
   * Each collection loads on its own: a failure in one
   * catalogue does not hide the others, and a collection
   * page only needs its own index.
   */
  const requiredCodes =
    useMemo(
      () =>
        collectionCode
          ? [collectionCode]
          : COLLECTION_CODES,
      [collectionCode],
    )

  useEffect(() => {
    let active = true

    requiredCodes.forEach((code) => {
      getCatalog(code)
        .then((catalog) => {
          if (active) {
            setCatalogs((previous) => ({
              ...previous,
              [code]: catalog,
            }))
          }
        })
        .catch((err: Error) => {
          if (active) {
            setErrors((previous) => ({
              ...previous,
              [code]: err.message,
            }))
          }
        })
    })

    return () => {
      active = false
    }
  }, [requiredCodes])


  const loadedCatalogs =
    requiredCodes
      .map((code) => catalogs[code])
      .filter(
        (catalog): catalog is Catalog =>
          Boolean(catalog),
      )

  const loadErrors =
    requiredCodes
      .map((code) => errors[code])
      .filter(
        (message): message is string =>
          Boolean(message),
      )

  const isLoading =
    requiredCodes.some(
      (code) =>
        !catalogs[code] &&
        !errors[code],
    )

  const ready =
    !isLoading &&
    loadedCatalogs.length > 0

  const error =
    !isLoading &&
    loadErrors.length > 0
      ? loadErrors.join(' · ')
      : null


  const allRecords =
    useMemo(() => {
      if (isLoading) {
        return []
      }

      return requiredCodes.flatMap(
        (code) =>
          catalogs[code]?.records ?? [],
      )
    }, [
      catalogs,
      isLoading,
      requiredCodes,
    ])


  const totalRecordCount =
    loadedCatalogs.reduce(
      (total, catalog) =>
        total + catalog.record_count,
      0,
    )


  const searchTexts =
    useMemo(
      () => allRecords.map(getSearchText),
      [allRecords],
    )


  const filteredRecords =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase()

      if (!query) {
        return allRecords
      }

      const normalizedQuery =
        normalizeForSearch(query)

      if (!normalizedQuery) {
        // Query made only of ignored marks: match it literally.
        return allRecords.filter(
          (record) =>
            getSearchableValues(record).some(
              (value) =>
                value
                  .toLowerCase()
                  .includes(query),
            ),
        )
      }

      return allRecords.filter(
        (_record, index) =>
          searchTexts[index].includes(
            normalizedQuery,
          ),
      )
    }, [
      allRecords,
      search,
      searchTexts,
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
      const reduceMotion =
        window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches

      catalogRef.current
        ?.scrollIntoView({
          behavior: reduceMotion
            ? 'auto'
            : 'smooth',
          block: 'start',
        })
    })
  }


  return (
    <main className="page">

      {/* =====================================================
          Intro
          ===================================================== */}

      <section className="catalog-intro">
        <div className="catalog-intro-inner">

          <h1>
            {collectionCode
              ? `${COLLECTIONS[collectionCode].name} Manuscript Catalogue`
              : SITE.title}
          </h1>

          <p className="hero-description">
            {collectionCode
              ? COLLECTIONS[collectionCode].institution
              : SITE.subtitle}
          </p>

        </div>
      </section>


        {/* ===================================================
            Collections
            =================================================== */}

        {!collectionCode && (
        <section className="collections-section">

          <div className="section-heading">
            <h2>
              Collections
            </h2>
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
                  catalogs[collection.code]

                return (
                  <article
                    className="collection-card collection-card-active"
                    key={
                      collection.code
                    }
                  >

                    <Link
                      to={`/collection/${collection.code}`}
                      className="collection-card-link-overlay"
                      aria-label={`Open ${collection.name} catalogue`}
                    />

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

                      </div>


                      <p className="collection-institution">
                        {
                          collection.institution
                        }
                      </p>


                      {
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

            <h2>
              Search manuscripts
            </h2>


            {ready && (
              <div
                className="results-count"
                role="status"
              >

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

              <span className="search-examples">
                {SEARCH_EXAMPLES[collectionCode ?? 'all']}
              </span>

            </div>

          </div>


          {error && (
            <div
              className="error-state"
              role="alert"
            >

              <strong>
                Catalogue unavailable
              </strong>

              <p>{error}</p>

            </div>
          )}


          {isLoading && (
            <div
              className="loading-state"
              role="status"
            >
              Loading manuscript catalogues…
            </div>
          )}


          {ready &&
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

                          <h3
                            lang={
                              record.title
                                ? 'hy'
                                : undefined
                            }
                          >
                            {
                              record.title ||
                              UNTITLED
                            }
                          </h3>


                          <div className="record-metadata">

                            <span>
                              {record.source}
                            </span>

                            <span
                              className="metadata-dot"
                              aria-hidden="true"
                            >
                              ·
                            </span>

                            <span>
                              No. {record.number}
                            </span>

                            <span
                              className="metadata-dot"
                              aria-hidden="true"
                            >
                              ·
                            </span>

                            <span lang="hy">
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
                              aria-hidden="true"
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


          {ready &&
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
  )
}
